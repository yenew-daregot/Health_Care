import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  Chip,
  Tabs,
  Tab,
  Snackbar,
  Divider,
  Stack,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search,
  Visibility,
  Download,
  Print,
  Medication,
  LocalHospital,
  Schedule,
  Warning,
  CheckCircle,
  Cancel,
  Refresh,
  Send,
  FilterList,
  Sort,
  MoreVert,
  Person,
  CalendarToday,
  AccessTime,
  Info,
  Share,
  Notifications,
  Add
} from '@mui/icons-material';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';

import prescriptionsApi from '../../api/prescriptionsApi';

const MyPrescriptions = () => {
  // State management
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [refillDialog, setRefillDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('prescribed_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Refill form state
  const [refillForm, setRefillForm] = useState({
    prescription_id: '',
    quantity: 1,
    notes: ''
  });

  // Show snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      const [prescriptionsRes, dashboardRes] = await Promise.all([
        prescriptionsApi.getPrescriptions(),
        prescriptionsApi.getPatientDashboard()
      ]);
      
      setPrescriptions(prescriptionsRes.data?.results || prescriptionsRes.data || []);
      setDashboardStats(dashboardRes.data?.statistics || {});
      
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      showSnackbar('Failed to fetch prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Handle prescription view
  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewDialog(true);
  };

  // Handle refill request
  const handleRefillRequest = (prescription) => {
    setRefillForm({
      prescription_id: prescription.id,
      quantity: 1,
      notes: ''
    });
    setSelectedPrescription(prescription);
    setRefillDialog(true);
  };

  // Submit refill request
  const handleSubmitRefill = async () => {
    try {
      await prescriptionsApi.requestRefill(refillForm);
      showSnackbar('Refill request submitted successfully', 'success');
      setRefillDialog(false);
      fetchPrescriptions(); // Refresh data
    } catch (error) {
      console.error('Error requesting refill:', error);
      showSnackbar('Failed to request refill', 'error');
    }
  };

  // Download prescription
  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      showSnackbar('Downloading prescription...', 'info');
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) {
        showSnackbar('Prescription not found', 'error');
        return;
      }

      const content = `
PRESCRIPTION
${'-'.repeat(50)}
Prescription ID: ${prescription.prescription_id}
Date: ${format(new Date(prescription.prescribed_date), 'MMMM dd, yyyy')}

PATIENT INFORMATION:
Name: ${prescription.patient?.user?.first_name} ${prescription.patient?.user?.last_name}

DOCTOR INFORMATION:
Name: ${prescription.doctor?.user?.first_name} ${prescription.doctor?.user?.last_name}

MEDICATION:
Name: ${prescription.medication?.name}
Dosage: ${prescription.dosage}
Frequency: ${prescription.frequency_display}
Duration: ${prescription.duration}
${prescription.instructions ? `Instructions: ${prescription.instructions}` : ''}

${prescription.notes ? `NOTES:\n${prescription.notes}` : ''}

Refills Remaining: ${prescription.refills_remaining}/${prescription.refills_allowed}
Status: ${prescription.status}
${prescription.is_urgent ? 'URGENT PRESCRIPTION' : ''}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescription.prescription_id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Prescription downloaded', 'success');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      showSnackbar('Failed to download prescription', 'error');
    }
  };

  // Filter prescriptions based on tab
  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;
    
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Active
        filtered = prescriptions.filter(p => p.status === 'active');
        break;
      case 2: // Expiring Soon
        filtered = prescriptions.filter(p => 
          p.days_remaining !== null && p.days_remaining <= 7 && p.status === 'active'
        );
        break;
      case 3: // Completed
        filtered = prescriptions.filter(p => p.status === 'completed');
        break;
      default:
        break;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.medication?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctor?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctor?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescription_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'prescribed_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  // Get urgency indicator
  const getUrgencyIndicator = (prescription) => {
    if (prescription.is_urgent) {
      return <Chip label="URGENT" color="error" size="small" />;
    }
    if (prescription.days_remaining !== null && prescription.days_remaining <= 3 && prescription.status === 'active') {
      return <Chip label="EXPIRING SOON" color="warning" size="small" />;
    }
    return null;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                My Prescriptions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage your medical prescriptions
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchPrescriptions}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Medication color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.total_prescriptions || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Prescriptions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.active_prescriptions || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Active Prescriptions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.expiring_soon || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Expiring Soon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Notifications color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {dashboardStats.pending_refills || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Refills
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab label="All Prescriptions" />
              <Tab 
                label={
                  <Badge badgeContent={dashboardStats.active_prescriptions} color="success">
                    Active
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={dashboardStats.expiring_soon} color="warning">
                    Expiring Soon
                  </Badge>
                } 
              />
              <Tab label="Completed" />
            </Tabs>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 250 }}
                size="small"
              />
              <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
                <Sort />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      {loading ? (
        <LinearProgress />
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Prescription</TableCell>
                  <TableCell>Medication</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Prescribed Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredPrescriptions().map((prescription) => (
                  <TableRow key={prescription.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {prescription.prescription_id}
                        </Typography>
                        {getUrgencyIndicator(prescription)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {prescription.medication?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {prescription.dosage} - {prescription.frequency_display}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          Duration: {prescription.duration}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          Dr. {prescription.doctor?.user?.first_name} {prescription.doctor?.user?.last_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Chip
                          label={prescription.status}
                          color={getStatusColor(prescription.status)}
                          size="small"
                        />
                        {prescription.days_remaining !== null && prescription.status === 'active' && (
                          <Typography variant="caption" color="text.secondary">
                            {prescription.days_remaining > 0 
                              ? `${prescription.days_remaining} days left`
                              : 'Expired'
                            }
                          </Typography>
                        )}
                        {prescription.refills_remaining > 0 && (
                          <Typography variant="caption" color="primary.main">
                            {prescription.refills_remaining} refills left
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(prescription.prescribed_date), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewPrescription(prescription)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPrescription(prescription.id)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        {prescription.refills_remaining > 0 && prescription.status === 'active' && (
                          <Tooltip title="Request Refill">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleRefillRequest(prescription)}
                            >
                              <Add />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {getFilteredPrescriptions().length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Medication sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No prescriptions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'Your prescriptions will appear here when available'}
              </Typography>
            </Box>
          )}
        </Card>
      )}

      {/* View Prescription Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prescription Details
          {selectedPrescription && (
            <Typography variant="subtitle2" color="text.secondary">
              ID: {selectedPrescription.prescription_id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedPrescription && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Doctor Information</Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body1" gutterBottom>
                      <strong>Dr. {selectedPrescription.doctor?.user?.first_name} {selectedPrescription.doctor?.user?.last_name}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prescribed on: {format(new Date(selectedPrescription.prescribed_date), 'MMMM dd, yyyy')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Prescription Status</Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Chip 
                      label={selectedPrescription.status} 
                      color={getStatusColor(selectedPrescription.status)}
                      sx={{ mb: 1 }}
                    />
                    {selectedPrescription.is_urgent && (
                      <Chip label="URGENT" color="error" sx={{ ml: 1, mb: 1 }} />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Refills: {selectedPrescription.refills_remaining}/{selectedPrescription.refills_allowed}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Medication Details</Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedPrescription.medication?.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Dosage</Typography>
                        <Typography variant="body1">{selectedPrescription.dosage}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Frequency</Typography>
                        <Typography variant="body1">{selectedPrescription.frequency_display}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">{selectedPrescription.duration}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Days Left</Typography>
                        <Typography variant="body1">
                          {selectedPrescription.days_remaining !== null 
                            ? (selectedPrescription.days_remaining > 0 
                                ? `${selectedPrescription.days_remaining} days`
                                : 'Expired')
                            : 'N/A'
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {selectedPrescription.instructions && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">Instructions</Typography>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          {selectedPrescription.instructions}
                        </Alert>
                      </Box>
                    )}
                    
                    {selectedPrescription.notes && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">Doctor's Notes</Typography>
                        <Typography variant="body1">{selectedPrescription.notes}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {selectedPrescription.days_remaining !== null && selectedPrescription.days_remaining <= 7 && selectedPrescription.status === 'active' && (
                <Grid item xs={12}>
                  <Alert 
                    severity={selectedPrescription.days_remaining <= 3 ? 'error' : 'warning'}
                    icon={<Schedule />}
                  >
                    {selectedPrescription.days_remaining > 0 
                      ? `This prescription expires in ${selectedPrescription.days_remaining} days. Consider requesting a refill.`
                      : 'This prescription has expired. Please contact your doctor.'
                    }
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => selectedPrescription && handleDownloadPrescription(selectedPrescription.id)}
          >
            Download
          </Button>
          {selectedPrescription?.refills_remaining > 0 && selectedPrescription?.status === 'active' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setViewDialog(false);
                handleRefillRequest(selectedPrescription);
              }}
            >
              Request Refill
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Refill Request Dialog */}
      <Dialog
        open={refillDialog}
        onClose={() => setRefillDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Request Prescription Refill
          {selectedPrescription && (
            <Typography variant="subtitle2" color="text.secondary">
              {selectedPrescription.medication?.name} - {selectedPrescription.prescription_id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                You have {selectedPrescription?.refills_remaining} refills remaining for this prescription.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={refillForm.quantity}
                onChange={(e) => setRefillForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1, max: selectedPrescription?.refills_remaining || 1 }}
                helperText="Number of refills to request"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={refillForm.notes}
                onChange={(e) => setRefillForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes for your doctor or pharmacy"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefillDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitRefill}
            startIcon={<Send />}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sort Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <MenuItem onClick={() => { setSortBy('prescribed_date'); setSortOrder('desc'); setFilterAnchor(null); }}>
          Newest First
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('prescribed_date'); setSortOrder('asc'); setFilterAnchor(null); }}>
          Oldest First
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('medication.name'); setSortOrder('asc'); setFilterAnchor(null); }}>
          Medication A-Z
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('status'); setSortOrder('asc'); setFilterAnchor(null); }}>
          Status
        </MenuItem>
      </Menu>

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

export default MyPrescriptions;