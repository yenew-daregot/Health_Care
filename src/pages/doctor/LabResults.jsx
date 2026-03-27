import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  IconButton,
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
  Tabs,
  Tab,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Visibility,
  Download,
  Upload,
  CheckCircle,
  Cancel,
  AccessTime,
  Search,
  FilterList,
  Refresh,
  Notifications,
  Add,
  PictureAsPdf,
  Image
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import labsApi from '../../api/labsApi'; // Changed from doctorsApi to labsApi

const LabResults = () => {
  const [labRequests, setLabRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState('');
  const [uploadResultValues, setUploadResultValues] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { enqueueSnackbar } = useSnackbar();

  // Status colors
  const statusColors = {
    pending: 'warning',
    'in-progress': 'info',
    completed: 'success',
    cancelled: 'error'
  };

  // Status icons
  const statusIcons = {
    pending: <AccessTime />,
    'in-progress': <LinearProgress style={{ width: 60 }} />,
    completed: <CheckCircle />,
    cancelled: <Cancel />
  };

  // Fetch lab requests
  const fetchLabRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await labsApi.getLabRequests(); // Using labsApi instead of direct axios
      setLabRequests(response.results || response.data || response);
      setFilteredRequests(response.results || response.data || response);
    } catch (error) {
      enqueueSnackbar('Failed to fetch lab requests', { variant: 'error' });
      console.error('Error fetching lab requests:', error);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchLabRequests();
  }, [fetchLabRequests]);

  // Filter requests
  useEffect(() => {
    let filtered = labRequests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.patient?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.patient?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.test_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.lab_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply tab filter
    if (tabValue === 1) {
      filtered = filtered.filter(request => request.status === 'pending');
    } else if (tabValue === 2) {
      filtered = filtered.filter(request => request.status === 'in-progress');
    } else if (tabValue === 3) {
      filtered = filtered.filter(request => request.status === 'completed');
    }

    setFilteredRequests(filtered);
  }, [labRequests, searchTerm, statusFilter, tabValue]);

  // Get patient name
  const getPatientName = (patient) => {
    if (!patient) return 'Unknown Patient';
    return `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.trim();
  };

  // Get doctor name
  const getDoctorName = (doctor) => {
    if (!doctor) return 'Unknown Doctor';
    return `Dr. ${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.trim();
  };

  // Handle view lab result
  const handleViewResult = (request) => {
    setSelectedRequest(request);
    setViewDialog(true);
  };

  // Handle upload lab result
  const handleUploadResult = (request) => {
    setSelectedRequest(request);
    setUploadDialog(true);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        enqueueSnackbar('File size should be less than 10MB', { variant: 'error' });
        return;
      }
      setUploadFile(file);
    }
  };

  // Submit lab result
  const handleSubmitResult = async () => {
    if (!uploadFile && !uploadResult.trim() && Object.keys(uploadResultValues).length === 0) {
      enqueueSnackbar('Please upload a file, enter result text, or add result values', { variant: 'error' });
      return;
    }

    try {
      const resultData = {
        result_text: uploadResult.trim(),
        result_document: uploadFile,
        result_values: Object.keys(uploadResultValues).length > 0 ? uploadResultValues : undefined,
        notes: uploadResult.trim() || 'Lab results uploaded',
        status: 'completed'
      };

      await labsApi.createOrUpdateLabResult(selectedRequest.id, resultData);

      enqueueSnackbar('Lab result uploaded successfully', { variant: 'success' });
      
      // Update request status
      await labsApi.updateLabRequestStatus(selectedRequest.id, { status: 'completed' });
      
      setUploadDialog(false);
      setUploadFile(null);
      setUploadResult('');
      setUploadResultValues({});
      fetchLabRequests();
    } catch (error) {
      console.error('Error uploading lab result:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to upload lab result';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Update request status
  const handleUpdateStatus = async (requestId, status) => {
    try {
      await labsApi.updateLabRequestStatus(requestId, { status });
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
      fetchLabRequests();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update status';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  // Download result file
  const handleDownloadResult = async (request) => {
    if (request.result_document) {
      try {
        // Since labsApi.downloadLabResult returns blob data directly
        const blob = await labsApi.downloadLabResult(request.id);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `lab_result_${request.lab_id || request.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        enqueueSnackbar('Failed to download file', { variant: 'error' });
      }
    }
  };

  // Calculate priority
  const calculatePriority = (request) => {
    if (request.priority === 'urgent') return 3;
    if (request.priority === 'high') return 2;
    return 1;
  };

  // Sort requests by priority and date
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const priorityDiff = calculatePriority(b) - calculatePriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at || b.created_date) - new Date(a.created_at || a.created_date);
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1">
              Lab Results Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchLabRequests}
                sx={{ mr: 1 }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="All Requests" />
            <Tab label={
              <Badge badgeContent={labRequests.filter(r => r.status === 'pending').length} color="error">
                Pending
              </Badge>
            } />
            <Tab label="In Progress" />
            <Tab label="Completed" />
          </Tabs>

          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by patient name, test type, or lab ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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
      ) : sortedRequests.length === 0 ? (
        <Alert severity="info">
          No lab requests found. {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : ''}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lab ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRequests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {request.lab_id || `LAB-${request.id}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                        {getPatientName(request.patient)?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {getPatientName(request.patient)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {request.patient?.id || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {request.test_type || 'General Test'}
                    </Typography>
                    {request.test_notes && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {request.test_notes}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(request.created_at || request.created_date)}
                    </Typography>
                    {request.due_date && (
                      <Typography
                        variant="caption"
                        color={new Date(request.due_date) < new Date() ? 'error' : 'text.secondary'}
                        display="block"
                      >
                        Due: {formatDate(request.due_date)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.priority || 'normal'}
                      color={
                        request.priority === 'urgent' ? 'error' :
                        request.priority === 'high' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={statusIcons[request.status] || <AccessTime />}
                      label={request.status || 'pending'}
                      color={statusColors[request.status] || 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.result_document ? (
                      <Chip
                        icon={<PictureAsPdf />}
                        label="File Attached"
                        size="small"
                        color="success"
                      />
                    ) : request.result_text ? (
                      <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                        {request.result_text.substring(0, 50)}...
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Not Available
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewResult(request)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {request.result_document && (
                        <Tooltip title="Download Result">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadResult(request)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {request.status !== 'completed' && (
                        <Tooltip title="Upload Result">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleUploadResult(request)}
                          >
                            <Upload />
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
      )}

      {/* View Lab Result Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              Lab Results - {selectedRequest.lab_id || `LAB-${selectedRequest.id}`}
              <Chip
                label={selectedRequest.status || 'pending'}
                color={statusColors[selectedRequest.status] || 'default'}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Patient Name
                      </Typography>
                      <Typography variant="body1">
                        {getPatientName(selectedRequest.patient)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Patient ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.patient?.id || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Requested By
                      </Typography>
                      <Typography variant="body1">
                        {getDoctorName(selectedRequest.doctor)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Request Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedRequest.created_at || selectedRequest.created_date)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Test Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Test Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.test_type || 'General Test'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Priority
                      </Typography>
                      <Typography variant="body1">
                        <Chip
                          label={selectedRequest.priority || 'normal'}
                          color={
                            selectedRequest.priority === 'urgent' ? 'error' :
                            selectedRequest.priority === 'high' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedRequest.due_date) || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Completed Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.completed_date ? formatDate(selectedRequest.completed_date) : 'Not completed'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {selectedRequest.test_notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Test Notes
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {selectedRequest.test_notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Lab Results
                  </Typography>
                  {selectedRequest.result_document ? (
                    <Box sx={{ mb: 2 }}>
                      <Button
                        startIcon={<Download />}
                        onClick={() => handleDownloadResult(selectedRequest)}
                        variant="outlined"
                      >
                        Download Result File
                      </Button>
                    </Box>
                  ) : null}
                  
                  {selectedRequest.result_text ? (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedRequest.result_text}
                      </Typography>
                    </Paper>
                  ) : selectedRequest.result_values ? (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      {Object.entries(selectedRequest.result_values).map(([key, value]) => (
                        <Box key={key} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{key}:</strong> {value}
                          </Typography>
                        </Box>
                      ))}
                    </Paper>
                  ) : (
                    <Alert severity="info">
                      No results available yet. Please upload the results when ready.
                    </Alert>
                  )}
                </Grid>

                {selectedRequest.lab_notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Lab Technician Notes
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">
                        {selectedRequest.lab_notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Close</Button>
              {selectedRequest.status !== 'completed' && (
                <Button
                  variant="contained"
                  onClick={() => handleUploadResult(selectedRequest)}
                >
                  Upload Results
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Upload Lab Result Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => {
          setUploadDialog(false);
          setUploadFile(null);
          setUploadResult('');
          setUploadResultValues({});
        }}
        maxWidth="sm"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>Upload Lab Results - {selectedRequest.lab_id || `LAB-${selectedRequest.id}`}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle2" gutterBottom>
                Patient: {getPatientName(selectedRequest.patient)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Test: {selectedRequest.test_type || 'General Test'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Upload Result File (PDF/Image)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<Upload />}
                  sx={{ mb: 2 }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </Button>
                {uploadFile && (
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                    Selected: {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
                  </Typography>
                )}

                <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                  Or Enter Results Manually
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={uploadResult}
                  onChange={(e) => setUploadResult(e.target.value)}
                  placeholder="Enter lab results here..."
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, mb: 2 }}>
                  Note: Uploading results will mark the request as completed and notify the requesting doctor.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setUploadDialog(false);
                setUploadFile(null);
                setUploadResult('');
                setUploadResultValues({});
              }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitResult}
                disabled={!uploadFile && !uploadResult.trim() && Object.keys(uploadResultValues).length === 0}
              >
                Upload & Complete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default LabResults;