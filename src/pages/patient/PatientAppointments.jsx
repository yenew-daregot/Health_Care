import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  CalendarToday,
  AccessTime,
  Person,
  MoreVert,
  Edit,
  Cancel,
  Visibility,
  Phone,
  VideoCall
} from '@mui/icons-material';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

import appointmentsApi from '../../api/appointmentsApi';
import patientsApi from '../../api/patientsApi';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [patientProfile, setPatientProfile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);

  const tabs = [
    { label: 'Upcoming', filter: 'upcoming' },
    { label: 'Today', filter: 'today' },
    { label: 'Past', filter: 'past' },
    { label: 'All', filter: 'all' }
  ];

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  useEffect(() => {
    if (patientProfile) {
      fetchAppointments();
    }
  }, [patientProfile, tabValue]);

  const fetchPatientProfile = async () => {
    try {
      const response = await patientsApi.getProfile();
      setPatientProfile(response.data);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      setError('Please complete your patient profile first');
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentsApi.getPatientAppointments(patientProfile.id);
      
      let appointmentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          appointmentsData = response.data;
        } else if (response.data.results) {
          appointmentsData = response.data.results;
        }
      }

      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const currentTab = tabs[tabValue];
    const today = new Date();
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      
      switch (currentTab.filter) {
        case 'upcoming':
          return appointmentDate >= today && appointment.status !== 'cancelled';
        case 'today':
          return isToday(appointmentDate) && appointment.status !== 'cancelled';
        case 'past':
          return isPast(appointmentDate) || appointment.status === 'completed';
        case 'all':
        default:
          return true;
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd, yyyy');
  };

  const formatTime = (time) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  const handleMenuClick = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async () => {
    try {
      await appointmentsApi.cancelAppointment(selectedAppointment.id, {
        reason: 'Cancelled by patient'
      });
      
      setCancelDialog(false);
      handleMenuClose();
      fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const handleReschedule = (appointment) => {
    navigate(`/patient/book-appointment/${appointment.doctor.id}`, {
      state: { reschedule: true, originalAppointment: appointment }
    });
  };

  const filteredAppointments = getFilteredAppointments();

  if (!patientProfile && !loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6" gutterBottom>
            Profile Required
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please complete your patient profile to view appointments.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/patient/profile')}>
            Complete Profile
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your healthcare appointments
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/patient/doctors')}
          size="large"
        >
          Book New Appointment
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={fetchAppointments} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading appointments...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No appointments found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {tabs[tabValue].filter === 'upcoming' 
                  ? "You don't have any upcoming appointments"
                  : `No ${tabs[tabValue].filter} appointments found`
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/patient/doctors')}
              >
                Book Your First Appointment
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredAppointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Card sx={{ '&:hover': { boxShadow: 4 } }}>
                    <CardContent>
                      <Grid container spacing={3} alignItems="center">
                        {/* Doctor Info */}
                        <Grid item xs={12} sm={4}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={appointment.doctor?.profile_picture_url}
                              sx={{ width: 50, height: 50, mr: 2 }}
                            >
                              {appointment.doctor?.user?.first_name?.charAt(0)}
                            </Avatar>
                            
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                Dr. {appointment.doctor?.user?.first_name} {appointment.doctor?.user?.last_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.doctor?.specialization_name}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Date & Time */}
                        <Grid item xs={12} sm={3}>
                          <Box>
                            <Box display="flex" alignItems="center" mb={1}>
                              <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2" fontWeight="bold">
                                {formatAppointmentDate(appointment.appointment_date)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                              <AccessTime fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {formatTime(appointment.appointment_time)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Status & Type */}
                        <Grid item xs={12} sm={3}>
                          <Box>
                            <Chip
                              label={appointment.status}
                              color={getStatusColor(appointment.status)}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.appointment_type || 'Consultation'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={12} sm={2}>
                          <Box display="flex" justifyContent="flex-end">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, appointment)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Reason */}
                      {appointment.reason && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Reason:</strong> {appointment.reason}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          // View details
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedAppointment?.status === 'pending' && (
          <MenuItem onClick={() => {
            handleReschedule(selectedAppointment);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Reschedule
          </MenuItem>
        )}
        
        {selectedAppointment?.status !== 'cancelled' && selectedAppointment?.status !== 'completed' && (
          <MenuItem onClick={() => {
            setCancelDialog(true);
            handleMenuClose();
          }}>
            <Cancel sx={{ mr: 1 }} />
            Cancel
          </MenuItem>
        )}
        
        {selectedAppointment?.status === 'confirmed' && (
          <>
            <MenuItem onClick={handleMenuClose}>
              <Phone sx={{ mr: 1 }} />
              Call Doctor
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <VideoCall sx={{ mr: 1 }} />
              Video Call
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment with Dr. {selectedAppointment?.doctor?.user?.first_name} {selectedAppointment?.doctor?.user?.last_name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            Keep Appointment
          </Button>
          <Button onClick={handleCancelAppointment} color="error" variant="contained">
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientAppointments;