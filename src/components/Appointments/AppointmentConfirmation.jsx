import React from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Person,
  CalendarToday,
  AccessTime,
  MedicalServices,
  Notes,
  Phone,
  Email,
  LocationOn,
  PriorityHigh
} from '@mui/icons-material';
import { formatTimeForDisplay, formatDateForDisplay, getDayName } from '../../utils/dateTimeUtils';
import AppointmentNotification from './AppointmentNotification';
const AppointmentConfirmation = ({ 
  appointmentData, 
  patientProfile, 
  onConfirm, 
  loading, 
  success, 
  createdAppointment 
}) => {
  
  const formatTime = (time) => {
    return formatTimeForDisplay(time);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'success';
      case 'normal': return 'primary';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'primary';
    }
  };

  if (success && createdAppointment) {
    return (
      <Box textAlign="center">
        {/*NOTIFICATION COMPONENT  */}
        <AppointmentNotification 
          appointment={{
            ...createdAppointment,
            doctor: createdAppointment.doctor || appointmentData.doctor,
            patient_name: patientProfile?.user?.first_name + ' ' + patientProfile?.user?.last_name,
            appointment_time: formatTime(appointmentData.time)
          }}
          type="created"
        />
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
          Appointment Booked Successfully!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your appointment has been submitted and is pending doctor confirmation.
        </Typography>

        <Card sx={{ mb: 3, bgcolor: 'success.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appointment Reference: #{createdAppointment.id}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Status:</strong> {createdAppointment.status || 'Pending'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            What happens next?
          </Typography>
          <Typography variant="body2">
            • The doctor will review your appointment request<br/>
            • You'll receive a confirmation notification<br/>
            • Check your appointments page for updates<br/>
            • You'll be redirected automatically in a few seconds
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Confirm Your Appointment
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please review all details before confirming your appointment
      </Typography>

      <Grid container spacing={3}>
        {/* Doctor Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Doctor Information
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={appointmentData.doctor?.profile_picture_url}
                  sx={{ width: 60, height: 60, mr: 2 }}
                >
                  {appointmentData.doctor?.user?.first_name?.charAt(0)}
                </Avatar>
                
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Dr. {appointmentData.doctor?.user?.first_name} {appointmentData.doctor?.user?.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointmentData.doctor?.specialization_name}
                  </Typography>
                  {appointmentData.doctor?.is_verified && (
                    <Chip label="Verified" size="small" color="success" sx={{ mt: 0.5 }} />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Experience:</strong> {appointmentData.doctor?.years_of_experience || 0} years
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Consultation Fee:</strong> ₹{appointmentData.doctor?.consultation_fee || 500}
                </Typography>
                {appointmentData.doctor?.address && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    {appointmentData.doctor.address}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Patient Information
              </Typography>
              
              <Box>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                  {patientProfile?.user?.first_name} {patientProfile?.user?.last_name}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Email fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  {patientProfile?.user?.email}
                </Typography>
                
                {patientProfile?.phone_number && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Phone fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    {patientProfile.phone_number}
                  </Typography>
                )}
                
                {patientProfile?.date_of_birth && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Age:</strong> {new Date().getFullYear() - new Date(patientProfile.date_of_birth).getFullYear()} years
                  </Typography>
                )}
                
                {patientProfile?.blood_group && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Blood Group:</strong> {patientProfile.blood_group}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointment Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                Appointment Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                    <CalendarToday sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Date
                    </Typography>
                    <Typography variant="body2">
                      {appointmentData.date ? getDayName(appointmentData.date) : 'Not specified'}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {appointmentData.date ? formatDateForDisplay(appointmentData.date) : 'Not specified'}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light' }}>
                    <AccessTime sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatTime(appointmentData.time)}
                    </Typography>
                    <Typography variant="body2">
                      Duration: {appointmentData.duration} min
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                    <MedicalServices sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {appointmentData.type.replace('_', ' ')}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${getPriorityColor(appointmentData.priority)}.light` }}>
                    <PriorityHigh sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Priority
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {appointmentData.priority}
                    </Typography>
                    {appointmentData.isUrgent && (
                      <Chip label="Urgent" size="small" color="error" />
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Reason and Notes */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  <Notes sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Reason for Visit
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  {appointmentData.reason}
                </Typography>
                
                {appointmentData.notes && (
                  <>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Additional Notes
                    </Typography>
                    <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      {appointmentData.notes}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Important Information */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Important Information
        </Typography>
        <Typography variant="body2">
          • Please arrive 15 minutes before your appointment time<br/>
          • Bring a valid ID and any relevant medical documents<br/>
          • The doctor will review your request and confirm the appointment<br/>
          • You can reschedule or cancel up to 2 hours before the appointment
        </Typography>
      </Alert>

      {/* Confirmation Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          sx={{ minWidth: 200, py: 1.5 }}
        >
          {loading ? 'Booking Appointment...' : 'Confirm Appointment'}
        </Button>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          By confirming, you agree to our terms and conditions
        </Typography>
      </Box>
    </Box>
  );
};

export default AppointmentConfirmation;