import React, { useState } from 'react';
import { Button, Paper, Typography, Box, Alert, TextField, Grid } from '@mui/material';
import appointmentsApi from '../../api/appointmentsApi';
import patientsApi from '../../api/patientsApi';
import doctorsApi from '../../api/doctorsApi';
import { combineDateAndTime, validateAppointmentDateTime, toISOString } from '../../utils/dateTimeUtils';

const AppointmentTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState({
    doctorId: '1',
    date: '2024-12-25',
    time: '10:00',
    reason: 'Test appointment'
  });

  const testPatientProfile = async () => {
    setLoading(true);
    setResult('Testing patient profile...\n');
    
    try {
      const response = await patientsApi.getProfile();
      setResult(prev => prev + `✅ Patient Profile: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      setResult(prev => prev + `❌ Patient Profile Error: ${error.message}\n`);
      setResult(prev => prev + `Status: ${error.response?.status}\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testDoctorDetails = async () => {
    setLoading(true);
    setResult('Testing doctor details...\n');
    
    try {
      const response = await doctorsApi.getDoctor(testData.doctorId);
      setResult(prev => prev + `✅ Doctor Details: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      setResult(prev => prev + `❌ Doctor Details Error: ${error.message}\n`);
      setResult(prev => prev + `Status: ${error.response?.status}\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testAppointmentCreation = async () => {
    setLoading(true);
    setResult('Testing appointment creation...\n');
    
    try {
      // First get patient profile
      const patientResponse = await patientsApi.getProfile();
      setResult(prev => prev + `✅ Got patient profile: ID ${patientResponse.data.id}\n`);
      
      // Use utility function for date/time handling
      let appointmentDateTime;
      try {
        const dateStr = testData.date;
        const timeStr = testData.time;
        
        setResult(prev => prev + `📅 Processing date: ${dateStr}, time: ${timeStr}\n`);
        
        // Use utility function
        appointmentDateTime = combineDateAndTime(dateStr, timeStr);
        
        setResult(prev => prev + `✅ Parsed datetime: ${appointmentDateTime.toISOString()}\n`);
        
        // Validate the appointment
        const validation = validateAppointmentDateTime(dateStr, timeStr);
        if (!validation.isValid) {
          setResult(prev => prev + `❌ Validation error: ${validation.error}\n`);
          return;
        }
        
        setResult(prev => prev + `✅ Validation passed\n`);
        
      } catch (dateError) {
        setResult(prev => prev + `❌ Date parsing error: ${dateError.message}\n`);
        return;
      }
      
      const appointmentPayload = {
        patient_id: patientResponse.data.id,
        doctor_id: parseInt(testData.doctorId),
        appointment_date: toISOString(appointmentDateTime),
        duration: 30,
        appointment_type: 'consultation',
        reason: testData.reason,
        symptoms: '',
        priority: 'medium',
        notes: 'Test appointment from debug component',
        status: 'scheduled'
      };
      
      setResult(prev => prev + `📤 Sending payload: ${JSON.stringify(appointmentPayload, null, 2)}\n`);
      
      const response = await appointmentsApi.createAppointment(appointmentPayload);
      setResult(prev => prev + `✅ Appointment Created: ${JSON.stringify(response.data, null, 2)}\n`);
      
    } catch (error) {
      setResult(prev => prev + `❌ Appointment Creation Error: ${error.message}\n`);
      setResult(prev => prev + `Status: ${error.response?.status}\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testFullFlow = async () => {
    setLoading(true);
    setResult('Testing full appointment booking flow...\n');
    
    try {
      // Step 1: Test patient profile
      setResult(prev => prev + '1. Testing patient profile...\n');
      const patientResponse = await patientsApi.getProfile();
      setResult(prev => prev + `✅ Patient Profile: ID ${patientResponse.data.id}, Name: ${patientResponse.data.user?.first_name} ${patientResponse.data.user?.last_name}\n`);
      
      // Step 2: Test doctor details
      setResult(prev => prev + '2. Testing doctor details...\n');
      const doctorResponse = await doctorsApi.getDoctor(testData.doctorId);
      setResult(prev => prev + `✅ Doctor Details: ID ${doctorResponse.data.id}, Name: Dr. ${doctorResponse.data.user?.first_name} ${doctorResponse.data.user?.last_name}\n`);
      
      // Step 3: Test appointment creation
      setResult(prev => prev + '3. Testing appointment creation...\n');
      
      let appointmentDateTime;
      try {
        const dateStr = testData.date;
        const timeStr = testData.time;
        
        setResult(prev => prev + `   Processing date: ${dateStr}, time: ${timeStr}\n`);
        
        // Use utility function
        appointmentDateTime = combineDateAndTime(dateStr, timeStr);
        
        setResult(prev => prev + `   ✅ Parsed datetime: ${appointmentDateTime.toISOString()}\n`);
        
        // Validate the appointment
        const validation = validateAppointmentDateTime(dateStr, timeStr);
        if (!validation.isValid) {
          setResult(prev => prev + `   ❌ Validation error: ${validation.error}\n`);
          return;
        }
        
        setResult(prev => prev + `   ✅ Validation passed\n`);
        
      } catch (dateError) {
        setResult(prev => prev + `   ❌ Date parsing error: ${dateError.message}\n`);
        return;
      }
      
      const appointmentPayload = {
        patient_id: patientResponse.data.id,
        doctor_id: parseInt(testData.doctorId),
        appointment_date: toISOString(appointmentDateTime),
        duration: 30,
        appointment_type: 'consultation',
        reason: testData.reason,
        symptoms: '',
        priority: 'medium',
        notes: 'Test appointment from debug component'
      };
      
      const appointmentResponse = await appointmentsApi.createAppointment(appointmentPayload);
      setResult(prev => prev + `✅ Appointment Created Successfully!\n`);
      setResult(prev => prev + `   ID: ${appointmentResponse.data.id}\n`);
      setResult(prev => prev + `   Number: ${appointmentResponse.data.appointment_number}\n`);
      setResult(prev => prev + `   Status: ${appointmentResponse.data.status}\n`);
      setResult(prev => prev + `   Date: ${appointmentResponse.data.appointment_date}\n`);
      
    } catch (error) {
      setResult(prev => prev + `❌ Error in flow: ${error.message}\n`);
      setResult(prev => prev + `Status: ${error.response?.status}\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Appointment Booking Debug Tool
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Doctor ID"
            value={testData.doctorId}
            onChange={(e) => setTestData(prev => ({ ...prev, doctorId: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Date"
            type="date"
            value={testData.date}
            onChange={(e) => setTestData(prev => ({ ...prev, date: e.target.value }))}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Time"
            type="time"
            value={testData.time}
            onChange={(e) => setTestData(prev => ({ ...prev, time: e.target.value }))}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Reason"
            value={testData.reason}
            onChange={(e) => setTestData(prev => ({ ...prev, reason: e.target.value }))}
            fullWidth
            size="small"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testPatientProfile} 
          disabled={loading}
          sx={{ mr: 1, mb: 1 }}
        >
          Test Patient Profile
        </Button>
        
        <Button 
          variant="contained" 
          onClick={testDoctorDetails} 
          disabled={loading}
          sx={{ mr: 1, mb: 1 }}
        >
          Test Doctor Details
        </Button>
        
        <Button 
          variant="contained" 
          onClick={testAppointmentCreation} 
          disabled={loading}
          sx={{ mr: 1, mb: 1 }}
        >
          Test Appointment Creation
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          onClick={testFullFlow} 
          disabled={loading}
          sx={{ mr: 1, mb: 1 }}
        >
          Test Full Flow
        </Button>
      </Box>
      
      {result && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
            {result}
          </pre>
        </Alert>
      )}
    </Paper>
  );
};

export default AppointmentTest;