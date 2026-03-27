import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Upload,
  Download,
  Visibility,
  Send,
  Science,
  Assignment,
  Person,
  Search,
  Refresh,
  Close,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';

import labsApi from '../../api/labsApi';

const LabTestResult = () => {
  // State management
  const [labRequests, setLabRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultDialog, setResultDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Result form state
  const [resultForm, setResultForm] = useState({
    result_text: '',
    result_document: null,
    result_values: {},
    interpretation: '',
    is_abnormal: false
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'in_progress',
    priority: '',
    has_result: ''
  });

  // Show snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Load lab requests
  useEffect(() => {
    loadLabRequests();
  }, [filters]);

  const loadLabRequests = async () => {
    try {
      setLoading(true);
      const data = await labsApi.getLabRequests(filters);
      const requests = data.results || data.data || data || [];
      setLabRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error('Error loading lab requests:', error);
      showSnackbar('Failed to load lab requests', 'error');
      setLabRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for data display
  const getPatientName = (patient) => {
    if (!patient) return 'Unknown Patient';
    if (patient.user) {
      return `${patient.user.first_name || ''} ${patient.user.last_name || ''}`.trim();
    }
    return patient.name || `Patient ${patient.id}`;
  };

  const getTestName = (test) => {
    if (!test) return 'Unknown Test';
    return test.name || `Test ${test.id}`;
  };

  const getLaboratoristName = (laboratorist) => {
    if (!laboratorist) return 'Not assigned';
    return `${laboratorist.first_name || ''} ${laboratorist.last_name || ''}`.trim();
  };

  // Handle result submission
  const handleSubmitResult = async () => {
    try {
      if (!resultForm.result_text && !resultForm.result_document) {
        showSnackbar('Please provide either text result or upload a document', 'error');
        return;
      }

      const result = await labsApi.createOrUpdateLabResult(selectedRequest.id, resultForm);
      
      // Also update request status to completed
      await labsApi.updateLabRequestStatus(selectedRequest.id, { status: 'completed' });
      
      showSnackbar('Lab result submitted successfully', 'success');
      setResultDialog(false);
      resetResultForm();
      loadLabRequests();
    } catch (error) {
      console.error('Error submitting result:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to submit result';
      showSnackbar(errorMessage, 'error');
    }
  };

  const resetResultForm = () => {
    setResultForm({
      result_text: '',
      result_document: null,
      result_values: {},
      interpretation: '',
      is_abnormal: false
    });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResultForm({ ...resultForm, result_document: file });
    }
  };

  // Filter requests
  const filteredRequests = labRequests.filter(request => {
    const patientName = getPatientName(request.patient).toLowerCase();
    const testName = getTestName(request.test).toLowerCase();
    const laboratoristName = getLaboratoristName(request.laboratorist).toLowerCase();
    
    const matchesSearch = !searchTerm || 
      patientName.includes(searchTerm.toLowerCase()) ||
      testName.includes(searchTerm.toLowerCase()) ||
      laboratoristName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesPriority = !filters.priority || request.priority === filters.priority;
    const matchesHasResult = filters.has_result === '' || 
      (filters.has_result === 'yes' && request.result) ||
      (filters.has_result === 'no' && !request.result);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesHasResult;
  });

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'requested': 'warning',
      'assigned': 'info',
      'sample_collected': 'primary',
      'in_progress': 'secondary',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'success',
      'normal': 'primary',
      'high': 'warning',
      'urgent': 'error'
    };
    return colors[priority] || 'default';
  };

  // Download result document
  const handleDownloadResult = async (request) => {
    try {
      if (request.result?.result_document) {
        window.open(request.result.result_document, '_blank');
        showSnackbar('Opening result document', 'info');
      } else {
        showSnackbar('No result document available', 'warning');
      }
    } catch (error) {
      console.error('Error downloading result:', error);
      showSnackbar('Failed to download result', 'error');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ 
      padding: 3,
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Lab Test Results
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload and manage laboratory test results
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadLabRequests}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by patient, test, or laboratorist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Has Result</InputLabel>
                <Select
                  value={filters.has_result}
                  label="Has Result"
                  onChange={(e) => setFilters({ ...filters, has_result: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="yes">With Results</MenuItem>
                  <MenuItem value="no">Without Results</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lab Requests Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lab Requests ({filteredRequests.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>Laboratorist</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Result Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {getPatientName(request.patient)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {request.patient?.id || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {getTestName(request.test)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.test?.category || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {request.laboratorist ? (
                          <Box>
                            <Typography variant="body2">
                              {getLaboratoristName(request.laboratorist)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.laboratorist.email || request.laboratorist.specialization || ''}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not assigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.priority_display || request.priority || 'normal'}
                          color={getPriorityColor(request.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status_display || request.status || 'requested'}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {request.result ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2" color="success.main">
                              Available
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning color="warning" fontSize="small" />
                            <Typography variant="body2" color="warning.main">
                              Pending
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.requested_date || request.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setViewDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {!request.result && request.status === 'in_progress' && (
                            <Tooltip title="Upload Result">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setResultDialog(true);
                                }}
                              >
                                <Upload />
                              </IconButton>
                            </Tooltip>
                          )}
                          {request.result?.result_document && (
                            <Tooltip title="Download Result">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleDownloadResult(request)}
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredRequests.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No lab requests found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No lab requests match the current filters'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Result Dialog */}
      <Dialog 
        open={resultDialog} 
        onClose={() => {
          setResultDialog(false);
          resetResultForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Upload />
            Upload Lab Result
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Patient:</strong> {getPatientName(selectedRequest.patient)}
                  <br />
                  <strong>Test:</strong> {getTestName(selectedRequest.test)}
                  <br />
                  <strong>Normal Range:</strong> {selectedRequest.test?.normal_range || 'Not specified'}
                </Typography>
              </Alert>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Result Text"
                value={resultForm.result_text}
                onChange={(e) => setResultForm({ ...resultForm, result_text: e.target.value })}
                placeholder="Enter the lab test results, values, and observations..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Interpretation"
                value={resultForm.interpretation}
                onChange={(e) => setResultForm({ ...resultForm, interpretation: e.target.value })}
                placeholder="Enter clinical interpretation of the results..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={resultForm.is_abnormal}
                    onChange={(e) => setResultForm({ ...resultForm, is_abnormal: e.target.checked })}
                  />
                }
                label="Mark as abnormal result"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="result-document-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="result-document-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                  >
                    Upload Result Document
                  </Button>
                </label>
                {resultForm.result_document && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {resultForm.result_document.name}
                  </Typography>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResultDialog(false);
            resetResultForm();
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitResult}
            startIcon={<Send />}
            disabled={!resultForm.result_text && !resultForm.result_document}
          >
            Submit Result
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility />
              Lab Request Details
            </Box>
            <IconButton onClick={() => setViewDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
                <Typography variant="body1" gutterBottom>
                  {getPatientName(selectedRequest.patient)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Test</Typography>
                <Typography variant="body1" gutterBottom>
                  {getTestName(selectedRequest.test)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedRequest.status_display || selectedRequest.status}
                  color={getStatusColor(selectedRequest.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Chip
                  label={selectedRequest.priority_display || selectedRequest.priority}
                  color={getPriorityColor(selectedRequest.priority)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Laboratorist</Typography>
                <Typography variant="body1" gutterBottom>
                  {getLaboratoristName(selectedRequest.laboratorist)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Requested Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedRequest.requested_date || selectedRequest.created_at)}
                </Typography>
              </Grid>
              {selectedRequest.clinical_notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Clinical Notes</Typography>
                  <Typography variant="body1" gutterBottom style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.clinical_notes}
                  </Typography>
                </Grid>
              )}
              {selectedRequest.test?.normal_range && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Normal Range</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.test.normal_range}
                  </Typography>
                </Grid>
              )}
              {selectedRequest.result && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Lab Result</Typography>
                  {selectedRequest.result.result_text && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Result</Typography>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedRequest.result.result_text}
                      </Typography>
                    </Box>
                  )}
                  {selectedRequest.result.interpretation && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Interpretation</Typography>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedRequest.result.interpretation}
                      </Typography>
                    </Box>
                  )}
                  {selectedRequest.result.is_abnormal && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      This result has been marked as abnormal
                    </Alert>
                  )}
                  {selectedRequest.result.result_document && (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => handleDownloadResult(selectedRequest)}
                    >
                      Download Result Document
                    </Button>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LabTestResult;