import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Download,
  Science,
  Assignment,
  Search,
  Refresh,
  CheckCircle,
  Warning,
  ExpandMore,
  Print,
  Share
} from '@mui/icons-material';

import labsApi from '../../api/labsApi';

const LabResults = () => {
  // State management
  const [labRequests, setLabRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    has_result: '',
    date_range: 'all'
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
      setLabRequests(data);
    } catch (error) {
      console.error('Error loading lab requests:', error);
      showSnackbar('Failed to load lab results', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter requests
  const filteredRequests = labRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.test?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.doctor?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.doctor?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesHasResult = filters.has_result === '' || 
      (filters.has_result === 'yes' && request.result) ||
      (filters.has_result === 'no' && !request.result);
    
    // Date range filter
    let matchesDateRange = true;
    if (filters.date_range !== 'all') {
      const requestDate = new Date(request.requested_date);
      const now = new Date();
      const daysDiff = Math.floor((now - requestDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.date_range) {
        case '7days':
          matchesDateRange = daysDiff <= 7;
          break;
        case '30days':
          matchesDateRange = daysDiff <= 30;
          break;
        case '90days':
          matchesDateRange = daysDiff <= 90;
          break;
        default:
          matchesDateRange = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesHasResult && matchesDateRange;
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

  // Download result document
  const handleDownloadResult = async (request) => {
    try {
      if (request.result?.result_document) {
        window.open(request.result.result_document, '_blank');
        showSnackbar('Downloading result document', 'info');
      }
    } catch (error) {
      console.error('Error downloading result:', error);
      showSnackbar('Failed to download result', 'error');
    }
  };

  // Share result
  const handleShareResult = async (request) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Lab Result: ${request.test?.name}`,
          text: `Lab test result for ${request.test?.name}`,
          url: window.location.href,
        });
        showSnackbar('Result shared successfully', 'success');
      } else {
        // Fallback: copy to clipboard
        const resultText = `Lab Test: ${request.test?.name}\nDate: ${new Date(request.requested_date).toLocaleDateString()}\nStatus: ${request.status_display}`;
        
        await navigator.clipboard.writeText(resultText);
        showSnackbar('Result details copied to clipboard', 'success');
      }
    } catch (error) {
      console.error('Error sharing result:', error);
      if (error.name !== 'AbortError') {
        showSnackbar('Failed to share result', 'error');
      }
    }
  };

  // Get result summary stats
  const getResultStats = () => {
    const total = labRequests.length;
    const completed = labRequests.filter(r => r.status === 'completed').length;
    const pending = labRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
    const abnormal = labRequests.filter(r => r.result?.is_abnormal).length;
    
    return { total, completed, pending, abnormal };
  };

  const stats = getResultStats();

  return (
    <Box sx={{ 
      marginLeft: { xs: 0, sm: '240px' },
      padding: 3,
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
                My Lab Results
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and download your laboratory test results
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tests
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
                  <Typography variant="h4" color="success.main">
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
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
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
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
                  <Typography variant="h4" color="error.main">
                    {stats.abnormal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Abnormal Results
                  </Typography>
                </Box>
                <Warning color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by test name or doctor..."
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
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Results</InputLabel>
                <Select
                  value={filters.has_result}
                  label="Results"
                  onChange={(e) => setFilters({ ...filters, has_result: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="yes">With Results</MenuItem>
                  <MenuItem value="no">Without Results</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.date_range}
                  label="Date Range"
                  onChange={(e) => setFilters({ ...filters, date_range: e.target.value })}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lab Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lab Results ({filteredRequests.length})
            </Typography>
            
            {filteredRequests.length > 0 ? (
              <Stack spacing={2}>
                {filteredRequests.map((request) => (
                  <Accordion key={request.id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {request.test?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(request.requested_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Chip
                            label={request.status_display}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
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
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Typography variant="body2">
                            Dr. {request.doctor?.user?.first_name} {request.doctor?.user?.last_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          {request.result?.is_abnormal && (
                            <Chip
                              label="Abnormal"
                              color="error"
                              size="small"
                              icon={<Warning />}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Test Information
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Test:</strong> {request.test?.name}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Category:</strong> {request.test?.category || 'General'}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Normal Range:</strong> {request.test?.normal_range || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Sample Type:</strong> {request.test?.sample_type || 'Not specified'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Request Details
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Requested by:</strong> Dr. {request.doctor?.user?.first_name} {request.doctor?.user?.last_name}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Priority:</strong> {request.priority_display}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Status:</strong> {request.status_display}
                          </Typography>
                          {request.laboratorist && (
                            <Typography variant="body2" gutterBottom>
                              <strong>Laboratorist:</strong> {request.laboratorist.first_name} {request.laboratorist.last_name}
                            </Typography>
                          )}
                        </Grid>

                        {request.clinical_notes && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Clinical Notes
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              {request.clinical_notes}
                            </Typography>
                          </Grid>
                        )}

                        {request.result && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" gutterBottom>
                              Lab Result
                            </Typography>
                            
                            {request.result.is_abnormal && (
                              <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                  <strong>Abnormal Result:</strong> This result is outside the normal range. 
                                  Please consult with your doctor for interpretation.
                                </Typography>
                              </Alert>
                            )}

                            {request.result.result_text && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Result</Typography>
                                <Typography variant="body1">{request.result.result_text}</Typography>
                              </Box>
                            )}

                            {request.result.interpretation && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Interpretation</Typography>
                                <Typography variant="body1">{request.result.interpretation}</Typography>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              {request.result.result_document && (
                                <Button
                                  variant="outlined"
                                  startIcon={<Download />}
                                  onClick={() => handleDownloadResult(request)}
                                >
                                  Download
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                startIcon={<Share />}
                                onClick={() => handleShareResult(request)}
                              >
                                Share
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Print />}
                                onClick={() => window.print()}
                              >
                                Print
                              </Button>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Science sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No lab results found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No lab tests have been requested yet'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

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

export default LabResults;