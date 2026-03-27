import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Alert,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add,
  Remove,
  Save,
  Close,
  Medication,
  Person,
  Schedule
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addDays } from 'date-fns';

import prescriptionsApi from '../../api/prescriptionsApi';
import patientsApi from '../../api/patientsApi';
import appointmentsApi from '../../api/appointmentsApi';

const PrescriptionForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = null,
  mode = 'create' // 'create' or 'edit'
}) => {
  const [formData, setFormData] = useState({
    appointment_id: '',
    medication_id: '',
    dosage: '',
    frequency: 'once_daily',
    custom_frequency: '',
    duration: '',
    duration_days: '',
    instructions: '',
    notes: '',
    start_date: new Date(),
    end_date: null,
    refills_allowed: 0,
    is_urgent: false,
    pharmacy_notes: ''
  });

  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  // Initialize form with data
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        ...initialData,
        start_date: new Date(initialData.start_date),
        end_date: initialData.end_date ? new Date(initialData.end_date) : null
      });
    } else if (mode === 'create') {
      setFormData({
        appointment_id: '',
        medication_id: '',
        dosage: '',
        frequency: 'once_daily',
        custom_frequency: '',
        duration: '',
        duration_days: '',
        instructions: '',
        notes: '',
        start_date: new Date(),
        end_date: null,
        refills_allowed: 0,
        is_urgent: false,
        pharmacy_notes: ''
      });
    }
  }, [initialData, mode, open]);

  const fetchData = async () => {
    try {
      const [patientsRes, medicationsRes, appointmentsRes] = await Promise.all([
        patientsApi.getPatients(),
        prescriptionsApi.getMedications(),
        appointmentsApi.getAppointments({ status: 'completed' })
      ]);

      setPatients(patientsRes.data?.results || patientsRes.data || []);
      setMedications(medicationsRes.data?.results || medicationsRes.data || []);
      setAppointments(appointmentsRes.data?.results || appointmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate end date if duration_days is provided
    if (field === 'duration_days' && value) {
      const endDate = addDays(formData.start_date, parseInt(value));
      setFormData(prev => ({
        ...prev,
        end_date: endDate
      }));
    }

    // Clear errors for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.appointment_id) {
      newErrors.appointment_id = 'Appointment is required';
    }
    if (!formData.medication_id) {
      newErrors.medication_id = 'Medication is required';
    }
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }
    if (formData.frequency === 'custom' && !formData.custom_frequency.trim()) {
      newErrors.custom_frequency = 'Custom frequency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    // Filter appointments for this patient
    const patientAppointments = appointments.filter(
      apt => apt.patient?.id === patient.id && apt.status === 'completed'
    );
    if (patientAppointments.length > 0) {
      handleFormChange('appointment_id', patientAppointments[0].id);
    }
  };

  const frequencyOptions = prescriptionsApi.getFrequencyOptions();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Medication sx={{ mr: 1 }} />
              {mode === 'create' ? 'Create New Prescription' : 'Edit Prescription'}
            </Box>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
          {selectedPatient && (
            <Typography variant="subtitle2" color="text.secondary">
              Patient: {selectedPatient.user?.first_name} {selectedPatient.user?.last_name}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Patient Selection */}
            {mode === 'create' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Patient Information
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Autocomplete
                    options={patients}
                    getOptionLabel={(option) => 
                      `${option.user?.first_name || ''} ${option.user?.last_name || ''} (ID: ${option.id})`
                    }
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Select Patient" 
                        required 
                        error={!!errors.patient}
                        helperText={errors.patient}
                      />
                    )}
                    value={selectedPatient}
                    onChange={(event, value) => {
                      handlePatientSelect(value);
                    }}
                  />
                </Grid>

                {/* Appointment Selection */}
                {selectedPatient && appointments.filter(apt => apt.patient?.id === selectedPatient.id).length > 0 && (
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.appointment_id}>
                      <InputLabel>Related Appointment</InputLabel>
                      <Select
                        value={formData.appointment_id}
                        onChange={(e) => handleFormChange('appointment_id', e.target.value)}
                        label="Related Appointment"
                      >
                        {appointments
                          .filter(apt => apt.patient?.id === selectedPatient.id)
                          .map((appointment) => (
                            <MenuItem key={appointment.id} value={appointment.id}>
                              {new Date(appointment.appointment_date).toLocaleDateString()} - {appointment.appointment_time}
                            </MenuItem>
                          ))}
                      </Select>
                      {errors.appointment_id && (
                        <Typography variant="caption" color="error">
                          {errors.appointment_id}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                )}
              </>
            )}

            {/* Medication Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Medication sx={{ mr: 1, verticalAlign: 'middle' }} />
                Medication Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={medications}
                getOptionLabel={(option) => `${option.name} ${option.strength || ''}`}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Medication" 
                    required 
                    error={!!errors.medication_id}
                    helperText={errors.medication_id}
                  />
                )}
                onChange={(event, value) => {
                  handleFormChange('medication_id', value?.id || '');
                }}
                value={medications.find(med => med.id === formData.medication_id) || null}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dosage"
                value={formData.dosage}
                onChange={(e) => handleFormChange('dosage', e.target.value)}
                required
                error={!!errors.dosage}
                helperText={errors.dosage || "e.g., 1 tablet, 5ml"}
                InputProps={{
                  endAdornment: <InputAdornment position="end">per dose</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.frequency}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => handleFormChange('frequency', e.target.value)}
                  label="Frequency"
                >
                  {frequencyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.frequency && (
                  <Typography variant="caption" color="error">
                    {errors.frequency}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {formData.frequency === 'custom' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Frequency"
                  value={formData.custom_frequency}
                  onChange={(e) => handleFormChange('custom_frequency', e.target.value)}
                  required
                  error={!!errors.custom_frequency}
                  helperText={errors.custom_frequency || "e.g., Every 4 hours as needed"}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => handleFormChange('duration', e.target.value)}
                required
                error={!!errors.duration}
                helperText={errors.duration || "e.g., 7 days, 2 weeks"}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (Days)"
                type="number"
                value={formData.duration_days}
                onChange={(e) => handleFormChange('duration_days', e.target.value)}
                helperText="Auto-calculates end date"
                InputProps={{
                  endAdornment: <InputAdornment position="end">days</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Instructions"
                value={formData.instructions}
                onChange={(e) => handleFormChange('instructions', e.target.value)}
                placeholder="e.g., Take with food, Avoid alcohol"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Doctor's Notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Additional notes for patient or pharmacy"
              />
            </Grid>

            {/* Additional Options */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                Schedule & Options
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={(date) => handleFormChange('start_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={(date) => handleFormChange('end_date', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Refills Allowed"
                type="number"
                value={formData.refills_allowed}
                onChange={(e) => handleFormChange('refills_allowed', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 12 }}
                helperText="Maximum 12 refills"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_urgent}
                    onChange={(e) => handleFormChange('is_urgent', e.target.checked)}
                  />
                }
                label="Mark as Urgent"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pharmacy Notes"
                value={formData.pharmacy_notes}
                onChange={(e) => handleFormChange('pharmacy_notes', e.target.value)}
                placeholder="Special instructions for pharmacy"
              />
            </Grid>

            {/* Form Summary */}
            {(formData.medication_id || formData.dosage || formData.frequency !== 'once_daily') && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" gutterBottom>
                    Prescription Summary:
                  </Typography>
                  <Typography variant="body2">
                    {medications.find(med => med.id === formData.medication_id)?.name || 'Medication'} - 
                    {formData.dosage || 'Dosage'} - 
                    {frequencyOptions.find(opt => opt.value === formData.frequency)?.label || 'Frequency'}
                    {formData.duration && ` for ${formData.duration}`}
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !formData.appointment_id || !formData.medication_id || 
                     !formData.dosage || !formData.duration}
            startIcon={<Save />}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Prescription' : 'Update Prescription')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PrescriptionForm;