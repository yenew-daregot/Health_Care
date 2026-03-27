import React, { useState } from 'react';
import { Button, Paper, Typography, Box, Alert } from '@mui/material';
import doctorsApi from '../../api/doctorsApi';
import axiosClient from '../../api/axiosClient';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...\n');
    
    try {
      // Test 1: Basic connection
      setResult(prev => prev + '1. Testing basic connection...\n');
      const basicResponse = await axiosClient.get('test/');
      setResult(prev => prev + `✅ Basic connection: ${basicResponse.status}\n`);
      
      // Test 2: Health check
      setResult(prev => prev + '2. Testing health check...\n');
      const healthResponse = await axiosClient.get('health/');
      setResult(prev => prev + `✅ Health check: ${healthResponse.status}\n`);
      
      // Test 3: Public test
      setResult(prev => prev + '3. Testing public endpoint...\n');
      const publicResponse = await doctorsApi.publicTest();
      setResult(prev => prev + `✅ Public test: ${publicResponse.status}\n`);
      
      // Test 4: Check authentication
      setResult(prev => prev + '4. Checking authentication...\n');
      const token = localStorage.getItem('access_token');
      setResult(prev => prev + `Token exists: ${!!token}\n`);
      
      // Test 5: Try doctors endpoint
      setResult(prev => prev + '5. Testing doctors endpoint...\n');
      const doctorsResponse = await doctorsApi.getDoctors();
      setResult(prev => prev + `✅ Doctors endpoint: ${doctorsResponse.status}, Count: ${doctorsResponse.data?.length || doctorsResponse.data?.results?.length || 'unknown'}\n`);
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error.message}\n`);
      setResult(prev => prev + `Status: ${error.response?.status}\n`);
      setResult(prev => prev + `URL: ${error.config?.baseURL}${error.config?.url}\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setResult('Testing direct API call...\n');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/doctors/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
      });
      
      setResult(prev => prev + `Status: ${response.status}\n`);
      
      if (response.ok) {
        const data = await response.json();
        setResult(prev => prev + `✅ Success: ${JSON.stringify(data, null, 2)}\n`);
      } else {
        const errorText = await response.text();
        setResult(prev => prev + `❌ Error: ${errorText}\n`);
      }
    } catch (error) {
      setResult(prev => prev + `❌ Network Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        API Debug Tool
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testConnection} 
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Test API Connection
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testDirectAPI} 
          disabled={loading}
        >
          Test Direct API
        </Button>
      </Box>
      
      {result && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result}
          </pre>
        </Alert>
      )}
    </Paper>
  );
};

export default ApiTest;