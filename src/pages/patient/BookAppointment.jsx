import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  Notifications,
  Email,
  Sms,
  Smartphone,
  Warning
} from '@mui/icons-material';

// Services
import appointmentsApi from '../../api/appointmentsApi';
import doctorsApi from '../../api/doctorsApi';
import patientsApi from '../../api/patientsApi';
import notificationsApi from '../../api/notificationsApi';
import useOptimisticUpdates from '../../hooks/useOptimisticUpdates';
import notificationService from '../../services/notificationService';

// Components
import DoctorSelection from '../../components/Appointments/DoctorSelection';
import TimeSlotSelection from '../../components/Appointments/TimeSlotSelection';
import AppointmentForm from '../../components/Appointments/AppointmentForm';
import AppointmentConfirmation from '../../components/Appointments/AppointmentConfirmation';

// Utils
import { combineDateAndTime, toISOString, to24HourFormat } from '../../utils/dateTimeUtils';

const steps = ['Select Doctor', 'Choose Date & Time', 'Appointment Details', 'Confirmation'];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({
    doctorNotified: false,
    patientNotified: false,
    channels: {},
    error: null
  });
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationProgress, setNotificationProgress] = useState(false);
  
  // Optimistic updates hook
  const {
    loading,
    error,
    setError,
    optimisticAppointmentOperations
  } = useOptimisticUpdates([], {
    onSuccess: async (result) => {
      console.log('✅ Appointment created successfully:', result);
      const appointment = result.data || result;
      setCreatedAppointment(appointment);
      
      try {
        // Send notifications to doctor using notificationService
        const notificationResults = await sendAppointmentNotifications(appointment);
        setNotificationStatus({
          doctorNotified: true,
          patientNotified: true,
          channels: notificationResults,
          error: null
        });
        
        // Show notification success dialog
        setShowNotificationDialog(true);
        
      } catch (notificationError) {
        console.warn('⚠️ Notifications partially failed:', notificationError);
        setNotificationStatus(prev => ({
          ...prev,
          error: notificationError.message
        }));
        notificationService.showWarning('Appointment booked but notifications failed to send.');
      }
      
      setSuccess(true);
      notificationService.showSuccess('Appointment booked successfully!');
      
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 5000);
    },
    onError: (error) => {
      console.error('❌ Failed to create appointment:', error);
      setError(error.userMessage || error.message || 'Failed to book appointment');
      notificationService.showError('Failed to book appointment. Please try again.');
    }
  });
  
  // Appointment data
  const [appointmentData, setAppointmentData] = useState({
    doctor: null,
    date: null,
    time: null,
    duration: 30,
    type: 'consultation',
    reason: '',
    notes: '',
    priority: 'normal',
    isUrgent: false,
    notifyDoctor: true, // Default to notify doctor
    notificationChannels: ['push', 'email', 'in_app'] // Default channels
  });
  
  const [patientProfile, setPatientProfile] = useState(null);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [doctorNotificationMethods, setDoctorNotificationMethods] = useState([]);

  // Initialize with doctor if provided in URL
  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails(doctorId);
    }
    fetchPatientProfile();
  }, [doctorId]);

  // Fetch doctor details and their notification preferences
  const fetchDoctorDetails = async (id) => {
    try {
      const response = await appointmentsApi.retryOperation(
        () => doctorsApi.getDoctor(id),
        3,
        1000
      );
      const doctor = response.data;
      setAppointmentData(prev => ({
        ...prev,
        doctor: doctor
      }));
      
      // Check doctor's notification preferences
      if (doctor.user) {
        try {
          const prefsResponse = await notificationsApi.getDoctorPreferences(doctor.user.id);
          const availableChannels = [];
          if (prefsResponse.data.sms_enabled && doctor.user.phone_number) {
            availableChannels.push('sms');
          }
          if (prefsResponse.data.push_enabled && doctor.user.fcm_token) {
            availableChannels.push('push');
          }
          if (prefsResponse.data.email_enabled && doctor.user.email) {
            availableChannels.push('email');
          }
          if (prefsResponse.data.in_app_enabled) {
            availableChannels.push('in_app');
          }
          
          setDoctorNotificationMethods(availableChannels);
          setAppointmentData(prev => ({
            ...prev,
            notificationChannels: availableChannels
          }));
        } catch (prefError) {
          console.log('Using default notification channels');
        }
      }
      
      if (doctor) {
        setActiveStep(1);
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError(err.userMessage || 'Failed to load doctor information');
      notificationService.showError('Failed to load doctor information');
    }
  };

  const fetchPatientProfile = async () => {
    try {
      console.log('Fetching patient profile...');
      const response = await patientsApi.getProfile();
      console.log('Patient profile response:', response.data);
      setPatientProfile(response.data);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      
      let errorMessage = 'Please complete your patient profile first';
      if (err.response?.status === 404) {
        errorMessage = 'Patient profile not found. Please create your profile first.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to continue.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      notificationService.showError(errorMessage);
    }
  };

  // Function to send appointment notifications using notificationService
  const sendAppointmentNotifications = async (appointment) => {
    if (!appointmentData.notifyDoctor) {
      console.log('Doctor notifications disabled by user');
      return { success: true, skipped: true };
    }

    setNotificationProgress(true);
    try {
      console.log('📤 Sending appointment notification...');
      
      // Use notificationService to send appointment update
      const notificationResult = await notificationService.notifyAppointmentUpdate(
        appointment,
        'created'
      );
      
      console.log('✅ Notifications sent successfully:', notificationResult);
      
      return { success: true, data: notificationResult };
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      
      // Fallback to direct API call if notificationService fails
      try {
        console.log('Trying direct API fallback...');
        const response = await fetch('/api/notifications/send-appointment/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            appointment_id: appointment.id
          })
        });

        if (response.ok) {
          notificationService.showSuccess('Doctor has been notified!');
          return { success: true, data: await response.json() };
        } else {
          throw new Error('Failed to send notifications via fallback');
        }
      } catch (fallbackError) {
        notificationService.showWarning('Failed to send notification, but appointment was booked.');
        return { success: false, error: error.message };
      }
      
    } finally {
      setNotificationProgress(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const handleDoctorSelect = (doctor) => {
    setAppointmentData(prev => ({
      ...prev,
      doctor: doctor
    }));
    handleNext();
  };

  const handleTimeSlotSelect = (date, time) => {
    const time24Format = to24HourFormat(time);
    setAppointmentData(prev => ({
      ...prev,
      date: date,
      time: time24Format
    }));
    handleNext();
  };

  const handleAppointmentDetailsSubmit = (details) => {
    setAppointmentData(prev => ({
      ...prev,
      ...details
    }));
    handleNext();
  };

  // Validate all required fields
  const validateAppointmentData = () => {
    const errors = [];
    
    if (!appointmentData.doctor) {
      errors.push('Please select a doctor');
    }
    
    if (!appointmentData.date) {
      errors.push('Please select a date');
    }
    
    if (!appointmentData.time) {
      errors.push('Please select a time');
    }
    
    if (!appointmentData.reason || appointmentData.reason.trim() === '') {
      errors.push('Please provide a reason for the appointment');
    }
    
    if (!patientProfile) {
      errors.push('Patient profile not found');
    }
    
    return errors;
  };

  // Check if date is within 6 months
  const isWithinSixMonths = (date) => {
    if (!date) return false;
    
    const selectedDate = new Date(date);
    const today = new Date();
    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);
    
    return selectedDate <= sixMonthsFromNow;
  };

  const handleConfirmAppointment = async () => {
    try {
      setError(null);

      // Validate all required fields
      const validationErrors = validateAppointmentData();
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join(', ');
        notificationService.showError(errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Appointment data:', {
        doctor: appointmentData.doctor?.id,
        date: appointmentData.date,
        time: appointmentData.time,
        patient: patientProfile?.id
      });

      const time24Hour = to24HourFormat(appointmentData.time);
      console.log('24-hour time:', time24Hour);

      // Combine date and time
      let appointmentDateTime;
      try {
        appointmentDateTime = combineDateAndTime(appointmentData.date, time24Hour);
        console.log('Combined datetime:', appointmentDateTime.toISOString());
        
        const now = new Date();
        const sixMonthsFromNow = new Date(now);
        sixMonthsFromNow.setMonth(now.getMonth() + 6);
        
        if (appointmentDateTime > sixMonthsFromNow) {
          const errorMessage = 'Appointment cannot be scheduled more than 6 months';
          notificationService.showWarning(errorMessage);
          throw new Error(errorMessage);
        }
        
        if (appointmentDateTime <= now) {
          const errorMessage = 'Appointment time cannot be in the past';
          notificationService.showWarning(errorMessage);
          throw new Error(errorMessage);
        }
        
      } catch (dateError) {
        console.error('Date validation error:', dateError);
        notificationService.showError(dateError.message);
        throw new Error(dateError.message);
      }

      // Prepare appointment data for API
      const appointmentPayload = {
        patient_id: patientProfile.id,
        doctor_id: appointmentData.doctor.id,
        appointment_date: toISOString(appointmentDateTime),
        duration: appointmentData.duration || 30,
        appointment_type: appointmentData.type || 'consultation',
        reason: appointmentData.reason || 'General consultation',
        symptoms: appointmentData.notes || '',
        priority: appointmentData.priority === 'normal' ? 'medium' : (appointmentData.priority || 'medium'),
        notes: appointmentData.notes || '',
        status: 'scheduled',
        notify_doctor: appointmentData.notifyDoctor,
        notification_channels: appointmentData.notificationChannels
      };

      console.log('Creating appointment with payload:', JSON.stringify(appointmentPayload, null, 2));

      // Use optimistic updates for better UX
      await optimisticAppointmentOperations.createAppointment(
        appointmentPayload,
        () => appointmentsApi.createAppointment(appointmentPayload)
      );

    } catch (err) {
      console.error('Error creating appointment:', err);
      
      let errorMessage = 'Failed to book appointment. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.response.data.appointment_date) {
          errorMessage = `Date/Time Error: ${err.response.data.appointment_date[0]}`;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          const firstError = Object.values(err.response.data)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMessage = firstError;
          }
        }
      }
      
      setError(errorMessage);
      notificationService.showError(errorMessage);
    }
  };

  const handleNotificationDialogClose = () => {
    setShowNotificationDialog(false);
  };

  const handleNotificationChannelToggle = (channel) => {
    setAppointmentData(prev => {
      const newChannels = prev.notificationChannels.includes(channel)
        ? prev.notificationChannels.filter(c => c !== channel)
        : [...prev.notificationChannels, channel];
      
      return {
        ...prev,
        notificationChannels: newChannels
      };
    });
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'sms': return <Sms fontSize="small" />;
      case 'push': return <Smartphone fontSize="small" />;
      case 'email': return <Email fontSize="small" />;
      case 'in_app': return <Notifications fontSize="small" />;
      default: return <Notifications fontSize="small" />;
    }
  };

  const getChannelLabel = (channel) => {
    switch (channel) {
      case 'sms': return 'SMS';
      case 'push': return 'Push';
      case 'email': return 'Email';
      case 'in_app': return 'In-App';
      default: return channel;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DoctorSelection
            selectedDoctor={appointmentData.doctor}
            onDoctorSelect={handleDoctorSelect}
            loading={loading}
          />
        );
      case 1:
        return (
          <TimeSlotSelection
            doctor={appointmentData.doctor}
            selectedDate={appointmentData.date}
            selectedTime={appointmentData.time}
            onTimeSlotSelect={handleTimeSlotSelect}
            loading={loading}
          />
        );
      case 2:
        return (
          <AppointmentForm
            appointmentData={appointmentData}
            onSubmit={handleAppointmentDetailsSubmit}
            loading={loading}
            onNotificationToggle={(value) => setAppointmentData(prev => ({
              ...prev,
              notifyDoctor: value
            }))}
            onChannelToggle={handleNotificationChannelToggle}
            doctorNotificationMethods={doctorNotificationMethods}
          />
        );
      case 3:
        return (
          <AppointmentConfirmation
            appointmentData={appointmentData}
            patientProfile={patientProfile}
            onConfirm={handleConfirmAppointment}
            loading={loading || notificationProgress}
            success={success}
            createdAppointment={createdAppointment}
            notificationStatus={notificationStatus}
            doctorNotificationMethods={doctorNotificationMethods}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (!patientProfile && !loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Profile Required
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please complete your patient profile before booking an appointment.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/patient/profile')}
          >
            Complete Profile
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/patient/doctors')}
          sx={{ mb: 2 }}
        >
          Back to Doctors
        </Button>
        
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Book Appointment
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          Schedule your appointment with our qualified healthcare professionals
        </Typography>
        
        {appointmentData.doctor && doctorNotificationMethods.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Doctor will be notified via: 
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {doctorNotificationMethods.map(channel => (
                <Chip
                  key={channel}
                  size="small"
                  icon={getChannelIcon(channel)}
                  label={getChannelLabel(channel)}
                  color={appointmentData.notificationChannels.includes(channel) ? "primary" : "default"}
                  variant={appointmentData.notificationChannels.includes(channel) ? "filled" : "outlined"}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={({ active, completed }) => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {completed ? <CheckCircle /> : index + 1}
                  </Box>
                )}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Typography variant="body1" fontWeight="bold">
            Error
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            Appointment Booked Successfully!
          </Typography>
          <Typography variant="body2">
            Your appointment has been submitted. {notificationStatus.doctorNotified 
              ? 'The doctor has been notified.' 
              : 'Doctor notification is being sent...'}
          </Typography>
          {notificationStatus.error && (
            <Typography variant="caption" color="warning.main" display="block">
              <Warning fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Note: Some notifications failed to send, but appointment was booked.
            </Typography>
          )}
        </Alert>
      )}

      {/* Step Content */}
      <Paper sx={{ p: 4, minHeight: 400 }}>
        {loading && activeStep !== 3 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading...
            </Typography>
          </Box>
        ) : (
          renderStepContent(activeStep)
        )}
      </Paper>

      {/* Navigation Buttons */}
      {!success && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            variant="outlined"
          >
            Back
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                disabled={
                  loading ||
                  (activeStep === 0 && !appointmentData.doctor) ||
                  (activeStep === 1 && (!appointmentData.date || !appointmentData.time)) ||
                  (activeStep === 2 && !appointmentData.reason)
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Appointment Summary Card */}
      {appointmentData.doctor && (
        <Card sx={{ mt: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appointment Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    <strong>Doctor:</strong> Dr. {appointmentData.doctor.user?.first_name} {appointmentData.doctor.user?.last_name}
                  </Typography>
                </Box>
                <Typography variant="caption" display="block" color="text.secondary">
                  {appointmentData.doctor.specialization_name}
                </Typography>
              </Grid>
              
              {appointmentData.date && (
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CalendarToday sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(appointmentData.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {!isWithinSixMonths(appointmentData.date) && (
                    <Typography variant="caption" color="warning.main" display="block">
                      ⚠️ Max 6 months advance
                    </Typography>
                  )}
                </Grid>
              )}
              
              {appointmentData.time && (
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTime sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Time:</strong> {appointmentData.time}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {/* Notification Settings */}
              {appointmentData.doctor && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Notifications fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Notification Settings
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2">
                        Notify doctor: <strong>{appointmentData.notifyDoctor ? 'Yes' : 'No'}</strong>
                      </Typography>
                      {appointmentData.notifyDoctor && appointmentData.notificationChannels.length > 0 && (
                        <>
                          <Typography variant="body2">via:</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {appointmentData.notificationChannels.map(channel => (
                              <Chip
                                key={channel}
                                size="small"
                                icon={getChannelIcon(channel)}
                                label={getChannelLabel(channel)}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Notification Status Dialog */}
      <Dialog 
        open={showNotificationDialog} 
        onClose={handleNotificationDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Notifications color="primary" />
            <Typography variant="h6">Notifications Sent</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Appointment booked and doctor notified successfully!
          </Alert>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Notification Channels Used:
            </Typography>
            <Grid container spacing={1}>
              {appointmentData.notificationChannels.map(channel => (
                <Grid item key={channel}>
                  <Chip
                    icon={getChannelIcon(channel)}
                    label={getChannelLabel(channel)}
                    color="success"
                    variant="filled"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              The doctor will receive notifications through the selected channels.
              You will also receive a confirmation notification.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotificationDialogClose} color="primary">
            Close
          </Button>
          <Button 
            onClick={() => navigate('/patient/appointments')} 
            variant="contained"
            color="primary"
          >
            View My Appointments
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookAppointment;