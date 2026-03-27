import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Chip, IconButton, Tooltip, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  LinearProgress, Badge, Tabs, Tab, List, ListItem, ListItemText, 
  ListItemIcon, Avatar, Stack, useTheme, useMediaQuery, Skeleton,
  Snackbar, TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Emergency as EmergencyIcon, MedicalServices as MedicalIcon,
  Favorite as HeartIcon, LocalHospital as HospitalIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon, Message as MessageIcon, Map as MapIcon,
  AccessTime as TimeIcon, Person as PersonIcon, LocationOn as LocationIcon,
  Refresh as RefreshIcon, Visibility as ViewIcon, Edit as EditIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import emergencyApi from '../../api/emergencyApi';
import EmergencyErrorBoundary from '../../components/ErrorBoundary/EmergencyErrorBoundary';

const EmergencyRequestedComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    critical: 0
  });

  // Show snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Safe date formatting functions with comprehensive error handling
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      let date;
      if (typeof timestamp === 'string') {
        if (timestamp === 'Invalid Date' || timestamp === 'null' || timestamp === 'undefined') {
          return 'Invalid date';
        }
        date = parseISO(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return 'Invalid date';
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (err) {
      console.warn('Error formatting timestamp:', timestamp, err);
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      let date;
      if (typeof timestamp === 'string') {
        if (timestamp === 'Invalid Date' || timestamp === 'null' || timestamp === 'undefined') {
          return 'Invalid date';
        }
        date = parseISO(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return 'Invalid date';
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      console.warn('Error formatting time ago:', timestamp, err);
      return 'Invalid date';
    }
  };

  // Fetch emergencies with error handling
  const fetchEmergencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await emergencyApi.getEmergencies({
        status: tabValue === 1 ? 'pending,acknowledged,dispatched,en_route,arrived' : undefined
      });
      
      let emergenciesData = [];
      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results)) {
          emergenciesData = response.data.results;
        } else if (Array.isArray(response.data)) {
          emergenciesData = response.data;
        }
      }
      
      // Validate and clean emergency data
      emergenciesData = emergenciesData.map(emergency => ({
        ...emergency,
        // Ensure all date fields are properly formatted or null
        created_at: emergency.created_at && emergency.created_at !== 'Invalid Date' ? emergency.created_at : null,
        acknowledged_at: emergency.acknowledged_at && emergency.acknowledged_at !== 'Invalid Date' ? emergency.acknowledged_at : null,
        dispatched_at: emergency.dispatched_at && emergency.dispatched_at !== 'Invalid Date' ? emergency.dispatched_at : null,
        completed_at: emergency.completed_at && emergency.completed_at !== 'Invalid Date' ? emergency.completed_at : null,
        // Ensure required fields have defaults
        patient: emergency.patient || { user: { first_name: 'Unknown', last_name: '', email: '', phone: '' } },
        emergency_type: emergency.emergency_type || 'other',
        priority: emergency.priority || 'medium',
        status: emergency.status || 'pending',
        location: emergency.location || 'Location not specified',
        description: emergency.description || 'No description provided'
      }));
      
      setEmergencies(emergenciesData);
      
      // Calculate stats
      const totalCount = emergenciesData.length;
      const pendingCount = emergenciesData.filter(e => e.status === 'pending').length;
      const activeCount = emergenciesData.filter(e => 
        ['pending', 'acknowledged', 'dispatched', 'en_route', 'arrived'].includes(e.status)
      ).length;
      const criticalCount = emergenciesData.filter(e => e.priority === 'critical').length;
      
      setStats({
        total: totalCount,
        pending: pendingCount,
        active: activeCount,
        critical: criticalCount
      });
      
      if (emergenciesData.length > 0) {
        showSnackbar(`Loaded ${emergenciesData.length} emergencies`, 'success');
      }
      
    } catch (err) {
      console.error('Error fetching emergencies:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch emergencies';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      
      // Set empty data on error to prevent crashes
      setEmergencies([]);
      setStats({ total: 0, pending: 0, active: 0, critical: 0 });
    } finally {
      setLoading(false);
    }
  }, [tabValue]);

  // Initialize data
  useEffect(() => {
    fetchEmergencies();
  }, [fetchEmergencies]);

  // Auto-refresh for active emergencies
  useEffect(() => {
    if (tabValue === 1) {
      const interval = setInterval(() => {
        fetchEmergencies();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [tabValue, fetchEmergencies]);

  // Handle status update
  const handleStatusUpdate = async (emergencyId, newStatus) => {
    try {
      await emergencyApi.updateEmergencyStatus(emergencyId, { status: newStatus });
      await fetchEmergencies();
      showSnackbar(`Emergency status updated to ${newStatus}`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update status';
      showSnackbar(errorMsg, 'error');
    }
  };

  // Handle accept emergency
  const handleAcceptEmergency = async (emergencyId) => {
    await handleStatusUpdate(emergencyId, 'acknowledged');
  };

  // Handle resolve emergency
  const handleResolveEmergency = async (emergencyId) => {
    await handleStatusUpdate(emergencyId, 'completed');
  };

  // Get status chip color
  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      acknowledged: 'info',
      dispatched: 'primary',
      en_route: 'secondary',
      arrived: 'success',
      completed: 'default',
      cancelled: 'error'
    };
    return statusColors[status] || 'default';
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    const priorityColors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      critical: 'error'
    };
    return priorityColors[priority] || 'default';
  };

  // Handle row click
  const handleEmergencyClick = (emergency) => {
    setSelectedEmergency(emergency);
    setDetailsOpen(true);
  };

  // Handle dialog close
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEmergency(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter emergencies based on tab
  const filteredEmergencies = emergencies.filter(emergency => {
    if (tabValue === 0) return true; // All emergencies
    if (tabValue === 1) return ['pending', 'acknowledged', 'dispatched', 'en_route', 'arrived'].includes(emergency.status);
    if (tabValue === 2) return emergency.priority === 'critical';
    return true;
  });

  // Render emergency type icon
  const renderTypeIcon = (type) => {
    const typeIcons = {
      sos: <EmergencyIcon />,
      medical: <MedicalIcon />,
      cardiac: <HeartIcon />,
      trauma: <HospitalIcon />,
      respiratory: <MedicalIcon />,
      other: <WarningIcon />
    };
    return typeIcons[type] || <WarningIcon />;
  };

  // Loading skeleton
  if (loading) {
    return (
      <Box sx={{ 
        p: 3,
        width: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Emergency Requests
        </Typography>
        {[...Array(5)].map((_, index) => (
          <Card key={index} sx={{ 
            mb: 2,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="rectangular" width="100%" height={60} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
          Emergency Requests
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Respond to urgent patient emergencies
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmergencyIcon sx={{ fontSize: 40, color: '#ff6b6b', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2">Pending Emergencies</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MedicalIcon sx={{ fontSize: 40, color: '#4ecdc4', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.active}
              </Typography>
              <Typography variant="body2">Active Cases</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#45b7d1', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {emergencies.filter(e => e.status === 'completed').length}
              </Typography>
              <Typography variant="body2">Resolved Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ fontSize: 40, color: '#f7b731', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.critical}
              </Typography>
              <Typography variant="body2">Critical Cases</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        mb: 3
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Emergencies" />
          <Tab label="Active Cases" />
          <Tab label="Critical Priority" />
        </Tabs>
      </Card>

      {/* Emergency List */}
      <Card sx={{ 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {tabValue === 0 && 'All Emergency Requests'}
              {tabValue === 1 && 'Active Emergency Cases'}
              {tabValue === 2 && 'Critical Priority Cases'}
            </Typography>
            <IconButton onClick={fetchEmergencies} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {filteredEmergencies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No emergencies found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All emergency requests have been addressed
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredEmergencies.map((emergency) => {
                // Additional safety check for each emergency
                const safeEmergency = {
                  id: emergency.id || emergency.request_id || `emergency-${Math.random()}`,
                  request_id: emergency.request_id || emergency.id || 'Unknown',
                  patient: emergency.patient || { user: { first_name: 'Unknown', last_name: '', email: '', phone: '' } },
                  emergency_type: emergency.emergency_type || 'other',
                  priority: emergency.priority || 'medium',
                  status: emergency.status || 'pending',
                  location: emergency.location || 'Location not specified',
                  description: emergency.description || 'No description provided',
                  created_at: emergency.created_at,
                  acknowledged_at: emergency.acknowledged_at,
                  medical_notes: emergency.medical_notes || '',
                  response_notes: emergency.response_notes || ''
                };
                
                return (
                  <ListItem
                    key={safeEmergency.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                    onClick={() => handleEmergencyClick(safeEmergency)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: safeEmergency.priority === 'critical' ? 'error.main' : 'primary.main' 
                      }}>
                        {renderTypeIcon(safeEmergency.emergency_type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            {safeEmergency.patient.user.first_name} {safeEmergency.patient.user.last_name}
                          </Typography>
                          <Chip 
                            label={safeEmergency.priority} 
                            color={getPriorityColor(safeEmergency.priority)}
                            size="small"
                          />
                          <Chip 
                            label={safeEmergency.status} 
                            color={getStatusColor(safeEmergency.status)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Type:</strong> {safeEmergency.emergency_type} | 
                            <strong> Location:</strong> {safeEmergency.location}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Time:</strong> {formatTimeAgo(safeEmergency.created_at)}
                          </Typography>
                          {safeEmergency.description && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {safeEmergency.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {safeEmergency.status === 'pending' && (
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptEmergency(safeEmergency.id);
                          }}
                        >
                          Accept
                        </Button>
                      )}
                      {['acknowledged', 'dispatched', 'en_route', 'arrived'].includes(safeEmergency.status) && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveEmergency(safeEmergency.id);
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Emergency Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Emergency Details
          {selectedEmergency && (
            <Typography variant="subtitle1" color="textSecondary">
              ID: {selectedEmergency.request_id || selectedEmergency.id}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedEmergency && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Patient Information</Typography>
                <Typography><strong>Name:</strong> {selectedEmergency.patient?.user?.first_name} {selectedEmergency.patient?.user?.last_name}</Typography>
                <Typography><strong>Email:</strong> {selectedEmergency.patient?.user?.email}</Typography>
                <Typography><strong>Phone:</strong> {selectedEmergency.patient?.user?.phone}</Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Emergency Details</Typography>
                <Typography><strong>Type:</strong> {selectedEmergency.emergency_type}</Typography>
                <Typography><strong>Priority:</strong> {selectedEmergency.priority}</Typography>
                <Typography><strong>Status:</strong> {selectedEmergency.status}</Typography>
                <Typography><strong>Location:</strong> {selectedEmergency.location}</Typography>
                <Typography><strong>Time:</strong> {formatTime(selectedEmergency.created_at)}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Description</Typography>
                <Typography paragraph>
                  {selectedEmergency.description || 'No description provided'}
                </Typography>
                
                {selectedEmergency.medical_notes && (
                  <>
                    <Typography variant="h6" gutterBottom>Medical Notes</Typography>
                    <Typography paragraph>
                      {selectedEmergency.medical_notes}
                    </Typography>
                  </>
                )}
                
                {selectedEmergency.response_notes && (
                  <>
                    <Typography variant="h6" gutterBottom>Response Notes</Typography>
                    <Typography paragraph>
                      {selectedEmergency.response_notes}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          {selectedEmergency?.status === 'pending' && (
            <Button 
              variant="contained" 
              color="error"
              onClick={() => {
                handleAcceptEmergency(selectedEmergency.id || selectedEmergency.request_id);
                handleCloseDetails();
              }}
            >
              Accept Emergency
            </Button>
          )}
          {selectedEmergency && ['acknowledged', 'dispatched', 'en_route', 'arrived'].includes(selectedEmergency.status) && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                handleResolveEmergency(selectedEmergency.id || selectedEmergency.request_id);
                handleCloseDetails();
              }}
            >
              Mark Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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

// Wrap the component with Error Boundary
const EmergencyRequested = () => (
  <EmergencyErrorBoundary>
    <EmergencyRequestedComponent />
  </EmergencyErrorBoundary>
);

export default EmergencyRequested;