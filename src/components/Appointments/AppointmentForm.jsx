import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Alert,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  MedicalServices,
  Notes,
  PriorityHigh,
  AccessTime,
  CheckCircle
} from '@mui/icons-material';

const AppointmentForm = ({ appointmentData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    type: appointmentData.type || 'consultation',
    reason: appointmentData.reason || '',
    notes: appointmentData.notes || '',
    priority: appointmentData.priority || 'normal',
    isUrgent: appointmentData.isUrgent || false,
    duration: appointmentData.duration || 30
  });

  const [errors, setErrors] = useState({});

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'follow_up', label: 'Follow-up Visit' },
    { value: 'checkup', label: 'Regular Checkup' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'second_opinion', label: 'Second Opinion' },
    { value: 'prescription_renewal', label: 'Prescription Renewal' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'success' },
    { value: 'normal', label: 'Normal', color: 'primary' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'urgent', label: 'Urgent', color: 'error' }
  ];

  const durations = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for your appointment';
    }
    
    if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Please provide more details (at least 10 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault(); // Prevent default if event is provided
    
    if (validateForm()) {
      console.log('Submitting form data:', formData);
      onSubmit(formData);
    } else {
      console.log('Form validation failed:', errors);
    }
  };

  // Auto-submit when form is complete (alternative approach)
  const handleBlur = (field) => {
    // If the reason field is filled and has no errors, auto-submit
    if (field === 'reason' && formData.reason.trim().length >= 10 && !errors.reason) {
      console.log('Auto-submitting form...');
      handleSubmit();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Appointment Details
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Please provide details about your appointment
      </Typography>

      {/* Appointment Summary */}
      <Card sx={{ mb: 3, bgcolor: 'info.light' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Appointment Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Doctor:</strong> Dr. {appointmentData.doctor?.user?.first_name} {appointmentData.doctor?.user?.last_name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Specialization:</strong> {appointmentData.doctor?.specialization_name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Date:</strong> {appointmentData.date ? new Date(appointmentData.date).toLocaleDateString() : 'Not selected'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Time:</strong> {appointmentData.time || 'Not selected'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Wrap form in a form element */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Appointment Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Appointment Type</InputLabel>
              <Select
                value={formData.type}
                label="Appointment Type"
                onChange={(e) => handleChange('type', e.target.value)}
                startAdornment={<MedicalServices sx={{ mr: 1, color: 'action.active' }} />}
              >
                {appointmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Duration */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={formData.duration}
                label="Duration"
                onChange={(e) => handleChange('duration', e.target.value)}
                startAdornment={<AccessTime sx={{ mr: 1, color: 'action.active' }} />}
              >
                {durations.map((duration) => (
                  <MenuItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Reason for Visit */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason for Visit *"
              multiline
              rows={3}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              onBlur={() => handleBlur('reason')}
              error={!!errors.reason}
              helperText={errors.reason || 'Please describe your symptoms or reason for the appointment (minimum 10 characters)'}
              placeholder="e.g., Experiencing chest pain, routine checkup, follow-up for previous treatment..."
              required
            />
          </Grid>

          {/* Additional Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional information you'd like the doctor to know..."
              InputProps={{
                startAdornment: <Notes sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          {/* Priority */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => handleChange('priority', e.target.value)}
                startAdornment={<PriorityHigh sx={{ mr: 1, color: 'action.active' }} />}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    <Box display="flex" alignItems="center">
                      <Chip
                        label={priority.label}
                        color={priority.color}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {priority.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Urgent Toggle */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isUrgent}
                    onChange={(e) => handleChange('isUrgent', e.target.checked)}
                    color="error"
                  />
                }
                label="Mark as Urgent"
              />
              <Typography variant="caption" display="block" color="text.secondary">
                Urgent appointments may be prioritized by the doctor
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Urgent Warning */}
        {formData.isUrgent && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Urgent Appointment Request
            </Typography>
            <Typography variant="body2">
              You've marked this appointment as urgent. The doctor will be notified and may prioritize your request.
              For immediate medical emergencies, please call emergency services or visit the nearest hospital.
            </Typography>
          </Alert>
        )}

        {/* Form Actions */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please review your appointment details before proceeding
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Chip
              label={`${formData.duration} min appointment`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={formData.type.replace('_', ' ')}
              color="secondary"
              variant="outlined"
            />
            {formData.isUrgent && (
              <Chip
                label="Urgent"
                color="error"
                variant="filled"
              />
            )}
          </Box>

          {/* SUBMIT BUTTON - This was missing! */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading || !formData.reason || formData.reason.trim().length < 10}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Saving...' : 'Continue to Confirmation'}
          </Button>

          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Click continue to review your appointment before final booking
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default AppointmentForm;