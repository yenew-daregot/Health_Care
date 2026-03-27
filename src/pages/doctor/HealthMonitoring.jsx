import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, TextField, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Alert, Chip, Avatar, Tabs, Tab, Select, MenuItem,
  FormControl, InputLabel, Switch, CircularProgress, Tooltip, Badge, Divider, List,
  ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction, FormControlLabel,
  Snackbar, useTheme, useMediaQuery, InputAdornment, TablePagination, Menu
} from '@mui/material';
import {
  Search, Refresh, Add, Visibility, Warning, TrendingUp, TrendingDown, CheckCircle,
  MonitorHeart, Bloodtype, Thermostat, Scale, Favorite, Speed, Person, History,
  Download, FilterList, Assessment, Timeline, NotificationImportant, LocalHospital,
  Analytics, Report
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

import healthApi from '../../api/healthApi';
import patientsApi from '../../api/patientsApi';

const HealthMonitoring = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    patients: true,
    vitals: true,
    alerts: true,
    stats: true
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [vitalDialog, setVitalDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [vitalTypeFilter, setVitalTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [newVital, setNewVital] = useState({
    patient: '',
    vital_type: 'blood_pressure',
    value: '',
    unit: '',
    notes: '',
    recorded_at: new Date(),
    is_manual: true
  });

  // Vital types configuration
  const vitalTypes = [
    {
      id: 'blood_pressure',
      name: 'Blood Pressure',
      unit: 'mmHg',
      normal_range: '120/80',
      min: 50,
      max: 200,
      icon: <MonitorHeart />,
      color: '#f44336'
    },
    {
      id: 'heart_rate',
      name: 'Heart Rate',
      unit: 'bpm',
      normal_range: '60-100',
      min: 40,
      max: 200,
      icon: <Favorite />,
      color: '#e91e63'
    },
    {
      id: 'temperature',
      name: 'Temperature',
      unit: '°C',
      normal_range: '36.5-37.5',
      min: 34,
      max: 42,
      icon: <Thermostat />,
      color: '#ff9800'
    },
    {
      id: 'oxygen_saturation',
      name: 'Oxygen Saturation',
      unit: '%',
      normal_range: '95-100',
      min: 80,
      max: 100,
      icon: <Speed />,
      color: '#2196f3'
    },
    {
      id: 'respiratory_rate',
      name: 'Respiratory Rate',
      unit: 'breaths/min',
      normal_range: '12-20',
      min: 8,
      max: 40,
      icon: <Scale />,
      color: '#4caf50'
    },
    {
      id: 'blood_sugar',
      name: 'Blood Sugar',
      unit: 'mg/dL',
      normal_range: '70-140',
      min: 30,
      max: 500,
      icon: <Bloodtype />,
      color: '#9c27b0'
    }
  ];

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Safe date formatting functions
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

  // Fetch patients with enhanced error handling
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, patients: true }));
      const response = await patientsApi.getPatients();
      const patientsData = response.data?.results || response.data || response;
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showSnackbar('Failed to fetch patients', 'error');
      setPatients([]);
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  }, []);

  // Fetch vitals with comprehensive filtering
  const fetchVitals = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, vitals: true }));
      let params = {
        vital_type: vitalTypeFilter !== 'all' ? vitalTypeFilter : undefined,
        abnormal_only: severityFilter === 'abnormal' ? 'true' : undefined,
      };
      
      // Add time range filter
      const now = new Date();
      let dateFrom = new Date();
      switch (timeRange) {
        case '24h':
          dateFrom.setDate(now.getDate() - 1);
          break;
        case '7d':
          dateFrom.setDate(now.getDate() - 7);
          break;
        case '30d':
          dateFrom.setDate(now.getDate() - 30);
          break;
        case '90d':
          dateFrom.setDate(now.getDate() - 90);
          break;
        default:
          dateFrom.setDate(now.getDate() - 7);
      }
      params.date_from = dateFrom.toISOString();
      
      // If patient is selected, fetch patient-specific vitals
      if (selectedPatient) {
        const response = await healthApi.getPatientVitals(selectedPatient.id, params);
        setVitals(Array.isArray(response.data) ? response.data : []);
      } else {
        // Fetch all vitals with filters
        const response = await healthApi.getVitals(params);
        setVitals(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
      showSnackbar('Failed to fetch vitals', 'error');
      setVitals([]);
    } finally {
      setLoading(prev => ({ ...prev, vitals: false }));
    }
  }, [selectedPatient, timeRange, vitalTypeFilter, severityFilter]);

  // Fetch alerts with filtering
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, alerts: true }));
      let params = {
        patient_id: selectedPatient?.id,
        resolved: severityFilter === 'resolved' ? 'true' : severityFilter === 'unresolved' ? 'false' : undefined,
      };
      
      const response = await healthApi.getAlerts(params);
      setAlerts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      showSnackbar('Failed to fetch alerts', 'error');
      setAlerts([]);
    } finally {
      setLoading(prev => ({ ...prev, alerts: false }));
    }
  }, [selectedPatient, severityFilter]);

  // Fetch comprehensive health statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      if (selectedPatient) {
        const response = await healthApi.getPatientHealthSummary(selectedPatient.id);
        setStats(response.data);
      } else {
        // Fetch system-wide stats
        const response = await healthApi.getHealthStats();
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show error for stats - it's optional
      setStats(null);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [selectedPatient]);

  // Initialize data
  const fetchData = useCallback(async () => {
    await Promise.all([
      fetchPatients(),
      fetchVitals(),
      fetchAlerts(),
      fetchStats()
    ]);
  }, [fetchPatients, fetchVitals, fetchAlerts, fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export data to CSV
  const exportToCSV = async () => {
    try {
      const csvData = filteredVitals.map(vital => ({
        Date: formatTime(vital.recorded_at),
        Patient: getPatientName(vital.patient_id),
        'Vital Type': vitalTypes.find(t => t.id === vital.vital_type)?.name || vital.vital_type,
        Value: vital.value,
        Unit: vital.unit,
        Status: isVitalAbnormal(vital) ? 'Abnormal' : 'Normal',
        Notes: vital.notes || ''
      }));

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health_monitoring_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showSnackbar('Failed to export data', 'error');
    }
  };

  // Enhanced abnormal vital detection
  const isVitalAbnormal = useCallback((vital) => {
    const typeConfig = vitalTypes.find(t => t.id === vital.vital_type);
    if (!typeConfig || !vital.value) return false;

    try {
      // Handle blood pressure specially
      if (vital.vital_type === 'blood_pressure') {
        if (vital.value.includes('/')) {
          const [systolic, diastolic] = vital.value.split('/').map(Number);
          if (isNaN(systolic) || isNaN(diastolic)) return false;
          return systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60;
        }
      }

      const value = parseFloat(vital.value);
      if (isNaN(value)) return false;

      // Define normal ranges
      const ranges = {
        'heart_rate': [60, 100],
        'temperature': [36.5, 37.5],
        'oxygen_saturation': [95, 100],
        'respiratory_rate': [12, 20],
        'blood_sugar': [70, 140]
      };

      if (ranges[vital.vital_type]) {
        const [min, max] = ranges[vital.vital_type];
        return value < min || value > max;
      }
    } catch (error) {
      console.warn('Error checking if vital is abnormal:', error);
    }

    return false;
  }, [vitalTypes]);

  // Get filtered vitals with comprehensive filtering
  const filteredVitals = useMemo(() => {
    let filtered = vitals;
    
    // Filter by selected patient
    if (selectedPatient) {
      filtered = filtered.filter(v => v.patient_id === selectedPatient.id);
    }
    
    // Filter by vital type
    if (vitalTypeFilter !== 'all') {
      filtered = filtered.filter(v => v.vital_type === vitalTypeFilter);
    }
    
    // Filter by severity
    if (severityFilter === 'abnormal') {
      filtered = filtered.filter(v => isVitalAbnormal(v));
    } else if (severityFilter === 'normal') {
      filtered = filtered.filter(v => !isVitalAbnormal(v));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vital => 
        vital.vital_type?.toLowerCase().includes(term) ||
        vital.notes?.toLowerCase().includes(term) ||
        vital.value?.toString().includes(term) ||
        getPatientName(vital.patient_id)?.toLowerCase().includes(term)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  }, [vitals, selectedPatient, vitalTypeFilter, severityFilter, searchTerm, isVitalAbnormal]);

  // Get filtered alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    if (selectedPatient) {
      filtered = filtered.filter(a => a.patient_id === selectedPatient.id);
    }
    
    if (severityFilter === 'resolved') {
      filtered = filtered.filter(a => a.is_resolved);
    } else if (severityFilter === 'unresolved') {
      filtered = filtered.filter(a => !a.is_resolved);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [alerts, selectedPatient, severityFilter]);

  // Add new vital reading with enhanced validation
  const handleAddVital = async () => {
    if (!newVital.patient || !newVital.value) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    // Validate vital value based on type
    const typeConfig = vitalTypes.find(t => t.id === newVital.vital_type);
    if (typeConfig) {
      try {
        if (newVital.vital_type === 'blood_pressure') {
          if (!newVital.value.includes('/')) {
            showSnackbar('Blood pressure must be in format: systolic/diastolic (e.g., 120/80)', 'error');
            return;
          }
          const [systolic, diastolic] = newVital.value.split('/').map(Number);
          if (isNaN(systolic) || isNaN(diastolic) || systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
            showSnackbar('Invalid blood pressure values', 'error');
            return;
          }
        } else {
          const value = parseFloat(newVital.value);
          if (isNaN(value) || value < typeConfig.min || value > typeConfig.max) {
            showSnackbar(`Value must be between ${typeConfig.min} and ${typeConfig.max} ${typeConfig.unit}`, 'error');
            return;
          }
        }
      } catch (error) {
        showSnackbar('Invalid vital value format', 'error');
        return;
      }
    }

    try {
      const vitalData = {
        patient_id: newVital.patient,
        vital_type: newVital.vital_type,
        value: newVital.value,
        unit: newVital.unit || typeConfig?.unit,
        notes: newVital.notes,
        recorded_at: newVital.recorded_at.toISOString(),
        is_manual: newVital.is_manual
      };

      await healthApi.createVital(vitalData);
      
      showSnackbar('Vital reading added successfully', 'success');
      setVitalDialog(false);
      resetVitalForm();
      
      // Refresh data
      await Promise.all([fetchVitals(), fetchAlerts(), fetchStats()]);
      
    } catch (error) {
      console.error('Error adding vital:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to add vital reading';
      showSnackbar(errorMsg, 'error');
    }
  };

  // Update single alert status
  const handleUpdateAlert = async (alertId, resolved = true) => {
    try {
      if (resolved) {
        await healthApi.markAlertResolved(alertId);
        showSnackbar('Alert resolved successfully', 'success');
      }
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      showSnackbar('Failed to update alert', 'error');
    }
  };

  // Reset vital form
  const resetVitalForm = () => {
    setNewVital({
      patient: selectedPatient?.id || '',
      vital_type: 'blood_pressure',
      value: '',
      unit: '',
      notes: '',
      recorded_at: new Date(),
      is_manual: true
    });
  };

  // Handle vital type change
  const handleVitalTypeChange = (type) => {
    const typeConfig = vitalTypes.find(t => t.id === type);
    setNewVital(prev => ({
      ...prev,
      vital_type: type,
      unit: typeConfig?.unit || ''
    }));
  };

  // Get patient name with error handling
  const getPatientName = useCallback((patientId) => {
    if (!patientId) return 'Unknown Patient';
    const patient = patients.find(p => p.id === patientId);
    if (!patient || !patient.user) return 'Unknown Patient';
    return `${patient.user.first_name || ''} ${patient.user.last_name || ''}`.trim() || 'Unknown Patient';
  }, [patients]);

  // Enhanced chart data preparation
  const getChartData = useCallback((vitalType) => {
    const typeVitals = filteredVitals.filter(v => v.vital_type === vitalType);
    
    return typeVitals
      .map(v => {
        try {
          let value;
          if (vitalType === 'blood_pressure' && v.value?.includes('/')) {
            value = parseFloat(v.value.split('/')[0]); // Use systolic for chart
          } else {
            value = parseFloat(v.value);
          }
          
          if (isNaN(value)) return null;
          
          return {
            date: format(new Date(v.recorded_at), 'MMM dd'),
            value: value,
            fullValue: v.value,
            time: format(new Date(v.recorded_at), 'HH:mm'),
            isAbnormal: isVitalAbnormal(v),
            patient: getPatientName(v.patient_id)
          };
        } catch (error) {
          console.warn('Error processing chart data:', error);
          return null;
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredVitals, isVitalAbnormal, getPatientName]);

  // Calculate comprehensive overview stats
  const overviewStats = useMemo(() => {
    const totalReadings = filteredVitals.length;
    const abnormalReadings = filteredVitals.filter(isVitalAbnormal).length;
    const activeAlerts = filteredAlerts.filter(alert => !alert.is_resolved).length;
    const recentVitals = filteredVitals.slice(0, 10);

    return {
      totalReadings,
      abnormalReadings,
      activeAlerts,
      recentVitals,
      abnormalPercentage: totalReadings > 0 ? Math.round((abnormalReadings / totalReadings) * 100) : 0
    };
  }, [filteredVitals, filteredAlerts, isVitalAbnormal]);

  // Handle page changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const isLoading = Object.values(loading).some(Boolean);

  // Get chart data for different vital types
  const bloodPressureData = getChartData('blood_pressure');
  const heartRateData = getChartData('heart_rate');

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        p: isMobile ? 2 : 3,
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header */}
        <Card sx={{ 
          mb: 3, 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Health Monitoring Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Comprehensive patient health tracking and reporting system
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title="Export Data">
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={exportToCSV}
                    disabled={isLoading || filteredVitals.length === 0}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Export
                  </Button>
                </Tooltip>
                <Tooltip title={isLoading ? "Refreshing..." : "Refresh Data"}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchData}
                    disabled={isLoading}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      animation: isLoading ? 'spin 2s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setVitalDialog(true)}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                    }
                  }}
                >
                  Add Vital
                </Button>
              </Box>
            </Box>

            {/* Patient Selector and Filters */}
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Monitor Patient</InputLabel>
                  <Select
                    value={selectedPatient?.id || ''}
                    onChange={(e) => {
                      const patient = patients.find(p => p.id === e.target.value);
                      setSelectedPatient(patient || null);
                    }}
                    label="Monitor Patient"
                    disabled={loading.patients}
                  >
                    <MenuItem value="">All Patients</MenuItem>
                    {patients.map(patient => (
                      <MenuItem key={patient.id} value={patient.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {patient.user?.first_name?.charAt(0)}
                          </Avatar>
                          {patient.user?.first_name} {patient.user?.last_name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search vitals, notes, or values..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={handleFilterClick}
                    size="small"
                  >
                    Filters
                  </Button>
                  
                  {/* Time Range Chips */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {['24h', '7d', '30d', '90d'].map(range => (
                      <Chip
                        key={range}
                        label={range}
                        onClick={() => setTimeRange(range)}
                        color={timeRange === range ? 'primary' : 'default'}
                        variant={timeRange === range ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Selected Patient Info */}
            {selectedPatient && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(102, 126, 234, 0.1)', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    {selectedPatient.user?.first_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Monitoring: {selectedPatient.user?.first_name} {selectedPatient.user?.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedPatient.user?.email} • Last updated: {formatTimeAgo(new Date().toISOString())}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Chip
                      label={`${filteredVitals.length} readings`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Vital Type Filter
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <Select
                value={vitalTypeFilter}
                onChange={(e) => setVitalTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {vitalTypes.map(type => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      {type.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" gutterBottom>
              Status Filter
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="normal">Normal Only</MenuItem>
                <MenuItem value="abnormal">Abnormal Only</MenuItem>
                <MenuItem value="resolved">Resolved Alerts</MenuItem>
                <MenuItem value="unresolved">Unresolved Alerts</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Menu>

        {/* Tabs */}
        <Card sx={{ 
          mb: 3, 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment />
                    Overview
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={filteredAlerts.filter(a => !a.is_resolved).length} color="error">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotificationImportant />
                      Alerts
                    </Box>
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline />
                    Trends
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History />
                    History
                  </Box>
                } 
              />
            </Tabs>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && tabValue === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {!isLoading && (
          <>
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {overviewStats.totalReadings}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Readings
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Last {timeRange}
                          </Typography>
                        </Box>
                        <MonitorHeart sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {overviewStats.abnormalReadings}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Abnormal Readings
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {overviewStats.abnormalPercentage}% of total
                          </Typography>
                        </Box>
                        <Warning sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {overviewStats.activeAlerts}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Active Alerts
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Requiring attention
                          </Typography>
                        </Box>
                        <NotificationImportant sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    borderRadius: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {patients.length}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Patients Monitored
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Total in system
                          </Typography>
                        </Box>
                        <LocalHospital sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recent Vital Readings */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Vital Readings
                      </Typography>
                      {overviewStats.recentVitals.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {overviewStats.recentVitals.map((vital) => (
                                <TableRow key={vital.id} hover>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                        {getPatientName(vital.patient_id)?.charAt(0)}
                                      </Avatar>
                                      {getPatientName(vital.patient_id)}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {vitalTypes.find(t => t.id === vital.vital_type)?.icon}
                                      {vitalTypes.find(t => t.id === vital.vital_type)?.name}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      sx={{
                                        color: isVitalAbnormal(vital) ? 'error.main' : 'success.main',
                                        fontWeight: 'medium'
                                      }}
                                    >
                                      {vital.value} {vital.unit}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {formatTimeAgo(vital.recorded_at)}
                                  </TableCell>
                                  <TableCell>
                                    {isVitalAbnormal(vital) ? (
                                      <Chip
                                        label="Abnormal"
                                        color="error"
                                        size="small"
                                        icon={<Warning />}
                                      />
                                    ) : (
                                      <Chip
                                        label="Normal"
                                        color="success"
                                        size="small"
                                        icon={<CheckCircle />}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <IconButton size="small">
                                      <Visibility />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">
                          No vital readings found for the selected time range.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Alerts Tab */}
            {tabValue === 1 && (
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Health Alerts
                  </Typography>

                  {filteredAlerts.length === 0 ? (
                    <Alert severity="info">
                      No alerts found.
                    </Alert>
                  ) : (
                    <List>
                      {filteredAlerts.map((alert, index) => (
                        <React.Fragment key={alert.id}>
                          <ListItem
                            alignItems="flex-start"
                            sx={{
                              bgcolor: alert.is_resolved ? 'action.hover' : 'transparent',
                              borderLeft: alert.is_resolved ? '4px solid #4caf50' : 
                                        alert.severity === 'high' ? '4px solid #f44336' :
                                        alert.severity === 'medium' ? '4px solid #ff9800' : 
                                        '4px solid #2196f3',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: alert.is_resolved ? 'success.main' : 'warning.main' }}>
                                <Warning />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle1">
                                    {alert.title}
                                  </Typography>
                                  {!alert.is_resolved && (
                                    <Chip
                                      label={alert.severity}
                                      size="small"
                                      color={
                                        alert.severity === 'high' ? 'error' :
                                        alert.severity === 'medium' ? 'warning' : 'info'
                                      }
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.primary">
                                    {alert.message}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Patient: {getPatientName(alert.patient_id)} • {formatTimeAgo(alert.created_at)}
                                  </Typography>
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {!alert.is_resolved && (
                                  <Tooltip title="Mark as Resolved">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleUpdateAlert(alert.id, true)}
                                    >
                                      <CheckCircle />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="View Details">
                                  <IconButton size="small">
                                    <Visibility />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < filteredAlerts.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trends Tab */}
            {tabValue === 2 && (
              <Grid container spacing={3}>
                {/* Blood Pressure Chart */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Blood Pressure Trend
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        {bloodPressureData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bloodPressureData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis label={{ value: 'mmHg', angle: -90, position: 'insideLeft' }} />
                              <RechartsTooltip 
                                formatter={(value) => [`${value} mmHg`, 'Blood Pressure']}
                                labelFormatter={(label) => `Date: ${label}`}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                name="Systolic"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <Alert severity="info">
                            No blood pressure data available.
                          </Alert>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Heart Rate Chart */}
                <Grid item xs={12} lg={6}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Heart Rate Trend
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        {heartRateData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={heartRateData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis label={{ value: 'bpm', angle: -90, position: 'insideLeft' }} />
                              <RechartsTooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#82ca9d"
                                name="Heart Rate"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <Alert severity="info">
                            No heart rate data available.
                          </Alert>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Vital Distribution */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Vital Distribution
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        {vitalTypes.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={vitalTypes.map(type => ({
                                name: type.name,
                                readings: filteredVitals.filter(v => v.vital_type === type.id).length
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar dataKey="readings" fill="#8884d8" name="Readings" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <Alert severity="info">
                            No vital distribution data available.
                          </Alert>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* History Tab */}
            {tabValue === 3 && (
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Vital History
                  </Typography>
                  
                  {filteredVitals.length === 0 ? (
                    <Alert severity="info">
                      No vital readings found.
                    </Alert>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date & Time</TableCell>
                              <TableCell>Patient</TableCell>
                              <TableCell>Vital Type</TableCell>
                              <TableCell>Value</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Notes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredVitals
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((vital) => (
                              <TableRow key={vital.id} hover>
                                <TableCell>
                                  <Typography variant="body2">
                                    {formatTime(vital.recorded_at)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {getPatientName(vital.patient_id)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {vitalTypes.find(t => t.id === vital.vital_type)?.icon}
                                    {vitalTypes.find(t => t.id === vital.vital_type)?.name}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    sx={{
                                      color: isVitalAbnormal(vital) ? 'error.main' : 'success.main',
                                      fontWeight: 'medium'
                                    }}
                                  >
                                    {vital.value} {vital.unit}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {isVitalAbnormal(vital) ? (
                                    <Chip
                                      label="Abnormal"
                                      color="error"
                                      size="small"
                                    />
                                  ) : (
                                    <Chip
                                      label="Normal"
                                      color="success"
                                      size="small"
                                    />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
                                    {vital.notes || 'No notes'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredVitals.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Add Vital Dialog */}
        <Dialog
          open={vitalDialog}
          onClose={() => {
            setVitalDialog(false);
            resetVitalForm();
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Vital Reading</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={newVital.patient}
                    onChange={(e) => setNewVital(prev => ({
                      ...prev,
                      patient: e.target.value
                    }))}
                    label="Patient"
                  >
                    <MenuItem value="">Select Patient</MenuItem>
                    {patients.map(patient => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.user?.first_name} {patient.user?.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Vital Type</InputLabel>
                  <Select
                    value={newVital.vital_type}
                    onChange={(e) => handleVitalTypeChange(e.target.value)}
                    label="Vital Type"
                  >
                    {vitalTypes.map(type => (
                      <MenuItem key={type.id} value={type.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          {type.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={newVital.value}
                  onChange={(e) => setNewVital(prev => ({
                    ...prev,
                    value: e.target.value
                  }))}
                  required
                  helperText={`Normal range: ${vitalTypes.find(t => t.id === newVital.vital_type)?.normal_range}`}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date"
                  value={newVital.recorded_at}
                  onChange={(date) => setNewVital(prev => ({
                    ...prev,
                    recorded_at: date
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newVital.is_manual}
                      onChange={(e) => setNewVital(prev => ({
                        ...prev,
                        is_manual: e.target.checked
                      }))}
                    />
                  }
                  label="Manual Reading"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={newVital.notes}
                  onChange={(e) => setNewVital(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Any additional notes..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setVitalDialog(false);
              resetVitalForm();
            }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddVital}
              disabled={!newVital.patient || !newVital.value}
            >
              Add Reading
            </Button>
          </DialogActions>
        </Dialog>

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
    </LocalizationProvider>
  );
};

export default HealthMonitoring;