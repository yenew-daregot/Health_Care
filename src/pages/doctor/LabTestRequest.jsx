import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Autocomplete,
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
  Tabs,
  Tab,
  Snackbar,
  Divider,
  Stack,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Download,
  Upload,
  Send,
  History,
  Science,
  Person,
  Assignment,
  Refresh,
  FilterList,
  Close
} from '@mui/icons-material';
import labsApi from '../../api/labsApi';
import patientsApi from '../../api/patientsApi';
const LabTestRequest = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [laboratorists, setLaboratorists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [requestForm, setRequestForm] = useState({
    patient_id: '',
    test_id: '',
    laboratorist_id: '',
    priority: 'normal',
    clinical_notes: '',
    request_document: null
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    test_category: ''
  });

  // Show snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [testsData, requestsData, laboratoristsData, statsData] = await Promise.all([
        labsApi.getLabTests().catch(() => ({ results: [], data: [] })),
        labsApi.getLabRequests().catch(() => ({ results: [], data: [] })),
        labsApi.getLaboratorists().catch(() => ({ results: [], data: [] })),
        labsApi.getDashboardStats().catch(() => ({}))
      ]);

      // Handle different response formats
      const safeTests = testsData.results || testsData.data || [];
      const safeRequests = requestsData.results || requestsData.data || [];
      const safeLaboratorists = laboratoristsData.results || laboratoristsData.data || [];

      setLabTests(Array.isArray(safeTests) ? safeTests : []);
      setLabRequests(Array.isArray(safeRequests) ? safeRequests : []);
      
      // If no laboratorists from API, use demo data
      if (Array.isArray(safeLaboratorists) && safeLaboratorists.length > 0) {
        setLaboratorists(safeLaboratorists);
      } else {
        const demoLaboratorists = [
          {
            id: 1,
            first_name: 'Dr. Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@lab.com',
            specialization: 'Clinical Chemistry'
          },
          {
            id: 2,
            first_name: 'Dr. Michael',
            last_name: 'Chen',
            email: 'michael.chen@lab.com',
            specialization: 'Hematology'
          },
          {
            id: 3,
            first_name: 'Dr. Emily',
            last_name: 'Davis',
            email: 'emily.davis@lab.com',
            specialization: 'Microbiology'
          }
        ];
        setLaboratorists(demoLaboratorists);
        showSnackbar('Using demo laboratorists', 'info');
      }
      
      setDashboardStats(statsData || {});
      
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
      
      // Set demo data as fallback
      setLabTests([]);
      setLabRequests([]);
      setLaboratorists([
        {
          id: 1,
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@lab.com',
          specialization: 'Clinical Chemistry'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load patients when needed
  const loadPatients = async (searchQuery = '') => {
    try {
      const data = await patientsApi.getPatients({ search: searchQuery });
      const patientsData = Array.isArray(data) ? data : data?.results || data?.data || [];
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
      showSnackbar('Failed to load patients', 'error');
      // Set demo patients as fallback
      setPatients([
        {
          id: 1,
          user: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          }
        }
      ]);
    }
  };

  // Handle form submission
  const handleSubmitRequest = async () => {
    try {
      if (!requestForm.patient_id || !requestForm.test_id) {
        showSnackbar('Please select patient and test', 'error');
        return;
      }

      const result = await labsApi.createLabRequest(requestForm);
      showSnackbar('Lab test request created successfully', 'success');
      setCreateDialog(false);
      resetForm();
      loadInitialData();
    } catch (error) {
      console.error('Error creating request:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         'Failed to create lab request';
      showSnackbar(errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setRequestForm({
      patient_id: '',
      test_id: '',
      laboratorist_id: '',
      priority: 'normal',
      clinical_notes: '',
      request_document: null
    });
    setSelectedPatient(null);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setRequestForm({ ...requestForm, request_document: file });
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

  // Filter requests
  const filteredRequests = labRequests.filter(request => {
    const patientName = getPatientName(request.patient).toLowerCase();
    const testName = getTestName(request.test).toLowerCase();
    const matchesSearch = !searchTerm || 
      patientName.includes(searchTerm.toLowerCase()) ||
      testName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesPriority = !filters.priority || request.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
                Lab Test Requests
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Request and manage laboratory tests for patients
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setCreateDialog(true);
                  loadPatients();
                }}
              >
                New Request
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadInitialData}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      {Object.keys(dashboardStats).length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {dashboardStats.total_requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                  </Box>
                  <Assignment color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {dashboardStats.pending || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Results
                    </Typography>
                  </Box>
                  <Science color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {dashboardStats.completed || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                  <History color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by patient name or test..."
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
                  <MenuItem value="requested">Requested</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
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
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Laboratorist</TableCell>
                    <TableCell>Requested Date</TableCell>
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
                        <Typography variant="body2">
                          {getTestName(request.test)}
                        </Typography>
                        {request.test?.category && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {request.test.category}
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
                        <Typography variant="body2">
                          {getLaboratoristName(request.laboratorist)}
                        </Typography>
                        {request.laboratorist?.specialization && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {request.laboratorist.specialization}
                          </Typography>
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
                          {request.result?.result_document && (
                            <Tooltip title="Download Result">
                              <IconButton 
                                size="small"
                                onClick={() => window.open(request.result.result_document, '_blank')}
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
                  {searchTerm ? 'Try adjusting your search criteria' : 'Create your first lab request'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Request Dialog */}
      <Dialog 
        open={createDialog} 
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add />
            Create Lab Test Request
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => 
                  `${option.user?.first_name || ''} ${option.user?.last_name || ''} (ID: ${option.id})`
                }
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                  setRequestForm({ ...requestForm, patient_id: newValue?.id || '' });
                }}
                onInputChange={(event, newInputValue) => {
                  if (newInputValue.length > 2) {
                    loadPatients(newInputValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    placeholder="Search by name or ID..."
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                options={labTests}
                getOptionLabel={(option) => `${option.name} - ${option.description || option.category || ''}`}
                onChange={(event, newValue) => {
                  setRequestForm({ ...requestForm, test_id: newValue?.id || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Lab Test"
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={requestForm.priority}
                  label="Priority"
                  onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={laboratorists}
                getOptionLabel={(option) => 
                  `${option.first_name} ${option.last_name} (${option.email || option.specialization || ''})`
                }
                onChange={(event, newValue) => {
                  setRequestForm({ ...requestForm, laboratorist_id: newValue?.id || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign Laboratorist (Optional)"
                    placeholder="Search by name or email..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Clinical Notes"
                value={requestForm.clinical_notes}
                onChange={(e) => setRequestForm({ ...requestForm, clinical_notes: e.target.value })}
                placeholder="Enter clinical notes, symptoms, or special instructions..."
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed #ccc', borderRadius: 1, p: 2, textAlign: 'center' }}>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="request-document-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="request-document-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                  >
                    Upload Request Document
                  </Button>
                </label>
                {requestForm.request_document && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {requestForm.request_document.name}
                  </Typography>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Supported formats: PDF, DOC, DOCX, JPG, PNG
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRequest}
            startIcon={<Send />}
          >
            Submit Request
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
                  {selectedRequest.result.result_document && (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => window.open(selectedRequest.result.result_document, '_blank')}
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

export default LabTestRequest;