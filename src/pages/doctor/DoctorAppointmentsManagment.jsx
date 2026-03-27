import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button,
         Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl,
         InputLabel, IconButton, Tooltip, Typography, Box, Card, CardContent, Grid, Alert, Snackbar,
         CircularProgress, Avatar, Divider, CardActions, Stack, TablePagination, Tabs, Tab, Badge,
         RadioGroup, Radio, FormControlLabel, FormLabel, InputAdornment } from '@mui/material';
import { CheckCircle, Cancel, AccessTime, CalendarToday, Person, MedicalServices, Visibility, Refresh,
         FilterList, Search, Check, Close, Download, Phone, Email, WatchLater, Event, Notes, Warning,
         Info, Edit, Delete, ArrowBack, Today, DateRange, ListAlt, Wifi, WifiOff, Sync } from '@mui/icons-material';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { styled } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './DoctorAppointmentsManagement.css';

// Services and hooks
import appointmentsApi from '../../api/appointmentsApi';
import useOptimisticUpdates from '../../hooks/useOptimisticUpdates';
import useRealTimeUpdates from '../../hooks/useRealTimeUpdates';
import notificationService from '../../services/notificationService';
import errorHandlingService from '../../services/errorHandlingService'; 

// Styled Components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'pending' ? theme.palette.warning.light :
    status === 'confirmed' ? theme.palette.success.light :
    status === 'cancelled' ? theme.palette.error.light :
    status === 'completed' ? theme.palette.info.light :
    status === 'scheduled' ? theme.palette.primary.light : theme.palette.grey[300],
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.75rem'
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => ({
  backgroundColor: 
    priority === 'high' ? theme.palette.error.light :
    priority === 'medium' ? theme.palette.warning.light :
    theme.palette.success.light,
  color: 'white',
  fontSize: '0.75rem'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer'
  },
  '&.highlighted': {
    backgroundColor: theme.palette.warning.light + '20',
  },
  '&.today': {
    backgroundColor: theme.palette.success.light + '15',
    borderLeft: `4px solid ${theme.palette.success.main}`
  }
}));

const TimeSlotBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 12px',
  borderRadius: '16px',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontSize: '0.875rem',
  fontWeight: 500
}));

const DoctorAppointmentsManagment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial filter from navigation state
  const [initialFilter, setInitialFilter] = useState('all');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  
  // Optimistic updates hook
  const {
    data: appointments,
    setData: setAppointments,
    loading,
    error,
    setError,
    optimisticAppointmentOperations
  } = useOptimisticUpdates([], {
    onSuccess: (result) => {
      console.log('✅ Operation successful:', result);
    },
    onError: (error) => {
      console.error('❌ Operation failed:', error);
    }
  });

  // Real-time updates hook
  const {
    connectionStatus,
    isConnected,
    lastUpdate
  } = useRealTimeUpdates({
    onAppointmentUpdate: (type, appointment) => {
      console.log(`📡 Real-time update: ${type}`, appointment);
      
      // Update local state with real-time data
      setAppointments(prevAppointments => {
        const updatedAppointments = prevAppointments.map(apt => 
          apt.id === appointment.id ? appointment : apt
        );
        
        // If it's a new appointment, add it
        if (type === 'created' && !prevAppointments.find(apt => apt.id === appointment.id)) {
          return [appointment, ...updatedAppointments];
        }
        
        return updatedAppointments;
      });
    },
    onConnectionChange: (status) => {
      console.log(`🔌 Connection status: ${status}`);
    }
  });
  
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  
  // Initialize from location state
  useEffect(() => {
    console.log('📍 Location state:', location.state);
    
    if (location.state) {
      if (location.state.initialFilter) {
        setInitialFilter(location.state.initialFilter);
        // Find the corresponding tab index
        const tabIndex = tabs.findIndex(tab => tab.filter === location.state.initialFilter);
        if (tabIndex !== -1) {
          setTabValue(tabIndex);
          console.log(`📊 Setting tab to ${tabIndex} for filter: ${location.state.initialFilter}`);
        }
        
        // Set status filter based on initial filter
        if (location.state.initialFilter !== 'today' && 
            location.state.initialFilter !== 'upcoming' && 
            location.state.initialFilter !== 'all') {
          setStatusFilter(location.state.initialFilter);
        }
      }
      if (location.state.selectedAppointmentId) {
        setSelectedAppointmentId(location.state.selectedAppointmentId);
        console.log(`🎯 Selected appointment ID: ${location.state.selectedAppointmentId}`);
      }
      if (location.state.appointment) {
        setSelectedAppointment(location.state.appointment);
        console.log('📋 Appointment data received:', location.state.appointment);
      }
    }
  }, [location.state]);

  // Time slots for rescheduling
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const statuses = [
    { value: 'all', label: 'All Appointments', color: 'default' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'confirmed', label: 'Confirmed', color: 'success' },
    { value: 'scheduled', label: 'Scheduled', color: 'primary' },
    { value: 'completed', label: 'Completed', color: 'info' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const tabs = [
    { label: 'Today', filter: 'today' },
    { label: 'Upcoming', filter: 'upcoming' },
    { label: 'Pending', filter: 'pending' },
    { label: 'Completed', filter: 'completed' },
    { label: 'All', filter: 'all' }
  ];

  // Fetch appointments with error handling and retry
  const fetchAppointments = useCallback(async () => {
    try {
      console.log('🔍 Fetching appointments...');
      console.log(`📋 Current tab filter: ${tabs[tabValue]?.filter}`);
      console.log(`📍 Initial filter from navigation: ${initialFilter}`);
      
      let apiParams = {};
      
      // Based on current tab, fetch appropriate appointments
      const currentFilter = tabs[tabValue]?.filter;
      
      // Set API parameters based on current filter
      if (currentFilter === 'today') {
        apiParams.date = new Date().toISOString().split('T')[0];
      } else if (currentFilter === 'pending') {
        apiParams.status = 'pending';
      } else if (currentFilter === 'completed') {
        apiParams.status = 'completed';
      } else if (currentFilter === 'upcoming') {
        apiParams.upcoming = true;
      }
      
      // Add status filter if set
      if (statusFilter !== 'all') {
        apiParams.status = statusFilter;
      }
      
      console.log('📡 API Parameters:', apiParams);
      
      // Use retry mechanism for failed requests
      const response = await appointmentsApi.retryOperation(
        () => appointmentsApi.getDoctorAppointments(apiParams),
        3,
        1000
      );
      
      console.log('✅ Appointments API response:', response);
      
      let appointmentsData = [];
      
      if (response && Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response && Array.isArray(response)) {
        appointmentsData = response;
      } else if (response?.data?.results) {
        appointmentsData = response.data.results;
      } else if (response?.data?.appointments) {
        appointmentsData = response.data.appointments;
      } else if (response?.data) {
        appointmentsData = response.data;
      }
      
      // Sort by date and time
      appointmentsData.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.appointment_time || '00:00'}`);
        const dateB = new Date(`${b.appointment_date}T${b.appointment_time || '00:00'}`);
        return dateA - dateB;
      });
      
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
      setTotalCount(appointmentsData.length);
      
      // If we have a selected appointment ID, find and select it
      if (selectedAppointmentId && appointmentsData.length > 0) {
        const foundAppointment = appointmentsData.find(app => 
          app.id.toString() === selectedAppointmentId.toString()
        );
        if (foundAppointment) {
          setSelectedAppointment(foundAppointment);
          console.log('🎯 Found selected appointment:', foundAppointment);
          // Auto-open details dialog if appointment is found
          setTimeout(() => {
            setDialogOpen(true);
          }, 500);
        }
      }
      
    } catch (err) {
      console.error('❌ Error fetching appointments:', err);
      
      // Error is already handled by errorHandlingService
      setError(err.userMessage || err.message || 'Failed to load appointments');
      
      // Mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using mock data for development');
        const mockData = getMockAppointments();
        setAppointments(mockData);
        setFilteredAppointments(mockData);
        setTotalCount(mockData.length);
      }
    }
  }, [tabValue, statusFilter, initialFilter, selectedAppointmentId, setAppointments]);

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Auto-open dialog if selected appointment is set from navigation
  useEffect(() => {
    if (selectedAppointment && selectedAppointmentId) {
      setDialogOpen(true);
    }
  }, [selectedAppointment, selectedAppointmentId]);

  useEffect(() => {
    filterAppointments();
  }, [statusFilter, searchTerm, dateFilter, appointments, tabValue]);

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => 
        app.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => {
        const patientName = getPatientName(app).toLowerCase();
        const patientEmail = app.patient?.user?.email?.toLowerCase() || '';
        const patientPhone = app.patient?.phone_number?.toLowerCase() || '';
        
        return (
          patientName.includes(term) ||
          patientEmail.includes(term) ||
          patientPhone.includes(term) ||
          (app.reason && app.reason.toLowerCase().includes(term)) ||
          (app.notes && app.notes.toLowerCase().includes(term)) ||
          (app.appointment_type && app.appointment_type.toLowerCase().includes(term))
        );
      });
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(app => app.appointment_date === dateFilter);
    }

    // Apply tab filter
    const currentTabFilter = tabs[tabValue]?.filter;
    if (currentTabFilter && currentTabFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      
      switch(currentTabFilter) {
        case 'today':
          filtered = filtered.filter(app => app.appointment_date === today);
          break;
        case 'upcoming':
          filtered = filtered.filter(app => app.appointment_date >= today && 
                                          app.status !== 'cancelled' && 
                                          app.status !== 'completed');
          break;
        case 'pending':
          filtered = filtered.filter(app => app.status === 'pending');
          break;
        case 'completed':
          filtered = filtered.filter(app => app.status === 'completed');
          break;
      }
    }

    setFilteredAppointments(filtered);
    setTotalCount(filtered.length);
  };

  // Add pagination handler functions
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const handleLabRequest = (appointment) => {
    // Navigate to lab request page with appointment context
    navigate('/doctor/lab-requests', {
      state: {
        appointmentId: appointment.id,
        patientId: appointment.patient?.id,
        patientName: `${appointment.patient?.user?.first_name || ''} ${appointment.patient?.user?.last_name || ''}`.trim(),
        appointmentDate: appointment.appointment_date,
        appointmentReason: appointment.reason
      }
    });
  };

  const handleAction = (type, appointment) => {
    setSelectedAppointment(appointment);
    setActionType(type);
    
    if (type === 'reschedule') {
      setSelectedDate(appointment.appointment_date);
      setTimeSlot(appointment.appointment_time || '');
      setNotes(appointment.notes || '');
      setRescheduleDialogOpen(true);
    } else if (type === 'cancel') {
      setCancelReason('');
      setActionDialogOpen(true);
    } else {
      setActionDialogOpen(true);
    }
  };

  const confirmAction = async () => {
    try {
      if (!selectedAppointment) return;

      let apiCall;
      let successMessage = '';
      
      switch (actionType) {
        case 'confirm':
          apiCall = () => appointmentsApi.updateStatus(selectedAppointment.id, { 
            status: 'confirmed' 
          });
          successMessage = 'Appointment confirmed successfully!';
          break;

        case 'cancel':
          if (!cancelReason.trim()) {
            notificationService.showError('Please provide a cancellation reason');
            return;
          }
          apiCall = () => appointmentsApi.cancelAppointment(selectedAppointment.id, {
            cancellation_reason: cancelReason
          });
          successMessage = 'Appointment cancelled successfully!';
          break;

        case 'complete':
          apiCall = () => appointmentsApi.updateStatus(selectedAppointment.id, { 
            status: 'completed' 
          });
          successMessage = 'Appointment marked as completed!';
          break;
          
        default:
          throw new Error('Unknown action type');
      }

      // Use optimistic updates for better UX
      if (actionType === 'confirm') {
        await optimisticAppointmentOperations.updateStatus(
          selectedAppointment.id,
          'confirmed',
          apiCall
        );
      } else if (actionType === 'cancel') {
        await optimisticAppointmentOperations.cancelAppointment(
          selectedAppointment.id,
          cancelReason,
          apiCall
        );
      } else if (actionType === 'complete') {
        await optimisticAppointmentOperations.updateStatus(
          selectedAppointment.id,
          'completed',
          apiCall
        );
      }

      setActionDialogOpen(false);
      setCancelReason('');
      
      // Refresh the appointments list
      fetchAppointments();
      
      notificationService.showSuccess(successMessage);

    } catch (err) {
      console.error(`❌ Error ${actionType}ing appointment:`, err);
      // Error is already handled by optimistic operations
    }
  };

  const handleReschedule = async () => {
    try {
      if (!selectedAppointment || !selectedDate || !timeSlot) {
        notificationService.showWarning('Please select date and time slot');
        return;
      }

      const rescheduleData = {
        appointment_date: selectedDate,
        appointment_time: timeSlot,
        notes: notes,
        reschedule_reason: `Rescheduled by doctor on ${new Date().toLocaleDateString()}`
      };

      // Use optimistic updates
      await optimisticAppointmentOperations.updateAppointment(
        selectedAppointment.id,
        rescheduleData,
        () => appointmentsApi.updateAppointment(selectedAppointment.id, rescheduleData)
      );
      
      setRescheduleDialogOpen(false);
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setTimeSlot('');
      setNotes('');
      
      fetchAppointments();
      notificationService.showSuccess('Appointment rescheduled successfully!');
      
    } catch (err) {
      console.error('❌ Error rescheduling appointment:', err);
      // Error is already handled by optimistic operations
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    // Clear any selected appointment when changing tabs
    setSelectedAppointment(null);
    setSelectedAppointmentId(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getPatientName = (appointment) => {
    if (appointment.patient?.user) {
      return `${appointment.patient.user.first_name || ''} ${appointment.patient.user.last_name || ''}`.trim();
    } else if (appointment.patient_name) {
      return appointment.patient_name;
    } else if (appointment.patient?.full_name) {
      return appointment.patient.full_name;
    } else if (appointment.patient?.name) {
      return appointment.patient.name;
    }
    return 'Unknown Patient';
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'Date not set';
    
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      return format(date, 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending': return <AccessTime color="warning" />;
      case 'confirmed': return <CheckCircle color="success" />;
      case 'cancelled': return <Cancel color="error" />;
      case 'completed': return <Check color="info" />;
      case 'scheduled': return <CalendarToday color="primary" />;
      default: return <CalendarToday />;
    }
  };

  const getActionButtons = (appointment) => {
    const buttons = [];
    const status = appointment.status?.toLowerCase();
    
    if (status === 'pending') {
      buttons.push(
        <Button
          key="confirm"
          size="small"
          variant="contained"
          color="success"
          startIcon={<Check />}
          onClick={(e) => {
            e.stopPropagation();
            handleAction('confirm', appointment);
          }}
          sx={{ mr: 1 }}
        >
          Confirm
        </Button>
      );
      buttons.push(
        <Button
          key="cancel"
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Close />}
          onClick={(e) => {
            e.stopPropagation();
            handleAction('cancel', appointment);
          }}
        >
          Cancel
        </Button>
      );
    } else if (status === 'confirmed' || status === 'scheduled') {
      buttons.push(
        <Button
          key="complete"
          size="small"
          variant="contained"
          color="primary"
          startIcon={<Check />}
          onClick={(e) => {
            e.stopPropagation();
            handleAction('complete', appointment);
          }}
          sx={{ mr: 1 }}
        >
          Complete
        </Button>
      );
      buttons.push(
        <Button
          key="lab-request"
          size="small"
          variant="outlined"
          color="secondary"
          startIcon={<MedicalServices />}
          onClick={(e) => {
            e.stopPropagation();
            handleLabRequest(appointment);
          }}
          sx={{ mr: 1 }}
        >
          Lab Request
        </Button>
      );
      buttons.push(
        <Button
          key="reschedule"
          size="small"
          variant="outlined"
          color="warning"
          startIcon={<Edit />}
          onClick={(e) => {
            e.stopPropagation();
            handleAction('reschedule', appointment);
          }}
          sx={{ mr: 1 }}
        >
          Reschedule
        </Button>
      );
    }
    
    return buttons;
  };

  const getMockAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    return [
      {
        id: 1,
        patient: {
          user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com'
          },
          phone_number: '+1234567890',
          date_of_birth: '1985-05-15',
          gender: 'Male',
          blood_group: 'O+'
        },
        appointment_date: today,
        appointment_time: '10:00 AM',
        status: 'pending',
        appointment_type: 'Consultation',
        priority: 'medium',
        reason: 'Routine checkup',
        notes: 'Patient has mild fever',
        duration: 30,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        patient: {
          user: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com'
          },
          phone_number: '+0987654321',
          date_of_birth: '1990-08-22',
          gender: 'Female',
          blood_group: 'A+'
        },
        appointment_date: tomorrow,
        appointment_time: '02:30 PM',
        status: 'confirmed',
        appointment_type: 'Follow-up',
        priority: 'low',
        reason: 'Follow-up visit',
        notes: 'Post-surgery checkup',
        duration: 20,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        patient: {
          user: {
            first_name: 'Robert',
            last_name: 'Johnson',
            email: 'robert@example.com'
          },
          phone_number: '+1122334455',
          date_of_birth: '1978-11-30',
          gender: 'Male',
          blood_group: 'B+'
        },
        appointment_date: today,
        appointment_time: '03:00 PM',
        status: 'scheduled',
        appointment_type: 'Emergency',
        priority: 'high',
        reason: 'Severe headache and dizziness',
        notes: 'Patient needs immediate attention',
        duration: 45,
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: appointments.length,
      today: appointments.filter(a => a.appointment_date === today && a.status !== 'cancelled').length,
      pending: appointments.filter(a => a.status === 'pending').length,
      completed: appointments.filter(a => a.status === 'completed').length
    };
  };

  const stats = calculateStats();

  if (loading && appointments.length === 0) {
    return (
      <div className="doctor-appointments">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading appointments...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <div className="doctor-appointments">
      <Box sx={{ padding: 3 }}>
        {/* Header */}
        <Box className="appointments-header" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Appointments Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {initialFilter !== 'all' ? `Showing ${initialFilter} appointments` : 'Manage and respond to patient appointments'}
            </Typography>
            {selectedAppointmentId && (
              <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                Selected appointment loaded
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Connection Status Indicator */}
            <Tooltip title={`Real-time updates: ${connectionStatus}`}>
              <Chip
                icon={isConnected ? <Wifi /> : <WifiOff />}
                label={isConnected ? 'Connected' : 'Offline'}
                color={isConnected ? 'success' : 'default'}
                variant="outlined"
                size="small"
              />
            </Tooltip>
            
            {/* Last Update Indicator */}
            {lastUpdate && (
              <Tooltip title={`Last update: ${lastUpdate.timestamp.toLocaleTimeString()}`}>
                <Chip
                  icon={<Sync />}
                  label={`${lastUpdate.type} update`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
            )}
            
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/doctor/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card primary">
              <CardContent>
                <Typography variant="h6" className="stat-number">{stats.total}</Typography>
                <Typography variant="body2" className="stat-label">Total Appointments</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card success">
              <CardContent>
                <Typography variant="h6" className="stat-number">{stats.today}</Typography>
                <Typography variant="body2" className="stat-label">Today's Appointments</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card warning">
              <CardContent>
                <Typography variant="h6" className="stat-number">{stats.pending}</Typography>
                <Typography variant="body2" className="stat-label">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="stat-card info">
              <CardContent>
                <Typography variant="h6" className="stat-number">{stats.completed}</Typography>
                <Typography variant="body2" className="stat-label">Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card className="main-content-card" sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className="appointments-tabs"
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index} 
                className={`tab-button ${tabValue === index ? 'selected' : ''}`}
                label={
                  <Badge 
                    badgeContent={
                      tab.filter === 'today' ? stats.today :
                      tab.filter === 'pending' ? stats.pending :
                      tab.filter === 'completed' ? stats.completed : 0
                    } 
                    className="tab-badge"
                    color={
                      tab.filter === 'today' ? 'success' :
                      tab.filter === 'pending' ? 'warning' :
                      tab.filter === 'completed' ? 'info' : 'default'
                    }
                  >
                    {tab.label}
                  </Badge>
                } 
              />
            ))}
          </Tabs>
          
          <CardContent>
            {/* Filters */}
            <Grid container spacing={2} alignItems="center" className="filters-section" sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    {statuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        <StatusChip 
                          size="small" 
                          label={status.label}
                          status={status.value}
                          sx={{ mr: 1 }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Patient name, email, or reason"
                  className="filter-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Filter by Date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  className="filter-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" className="action-buttons">
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => fetchAppointments()}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => showSnackbar('Export feature coming soon!', 'info')}
                    disabled={filteredAppointments.length === 0}
                  >
                    Export
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Appointments Table */}
            <TableContainer component={Paper} variant="outlined" className="table-container">
              <Table size="medium">
                <TableHead className="table-header">
                  <TableRow>
                    <TableCell className="table-header-cell">Patient</TableCell>
                    <TableCell className="table-header-cell">Date & Time</TableCell>
                    <TableCell className="table-header-cell">Type</TableCell>
                    <TableCell className="table-header-cell">Status</TableCell>
                    <TableCell className="table-header-cell">Priority</TableCell>
                    <TableCell className="table-header-cell">Reason</TableCell>
                    <TableCell className="table-header-cell" align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" className="empty-state" sx={{ py: 4 }}>
                        <CalendarToday className="empty-icon" />
                        <Typography variant="h6" className="empty-title" gutterBottom>
                          No appointments found
                        </Typography>
                        <Typography variant="body2" className="empty-subtitle">
                          {statusFilter !== 'all' ? `No ${statusFilter} appointments` : 'No appointments available'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppointments
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((appointment) => {
                        const isTodayAppointment = appointment.appointment_date === new Date().toISOString().split('T')[0];
                        const isPending = appointment.status?.toLowerCase() === 'pending';
                        const isSelected = appointment.id.toString() === selectedAppointmentId?.toString();
                        
                        return (
                          <StyledTableRow 
                            key={appointment.id}
                            className={`table-row ${
                              isTodayAppointment ? 'today' : ''
                            } ${
                              isPending ? 'pending' : ''
                            } ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => handleViewDetails(appointment)}
                          >
                            <TableCell className="table-cell">
                              <Box className="patient-cell">
                                <Avatar className="patient-avatar">
                                  {getPatientName(appointment).charAt(0)}
                                </Avatar>
                                <Box className="patient-info">
                                  <Typography variant="subtitle2" className="patient-name" fontWeight="medium">
                                    {getPatientName(appointment)}
                                    {isSelected && (
                                      <Chip 
                                        size="small" 
                                        label="Selected" 
                                        color="primary" 
                                        sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center" className="patient-contact">
                                    <Typography variant="caption" className="contact-item">
                                      <Email sx={{ fontSize: 12, mr: 0.5 }} />
                                      {appointment.patient?.user?.email || 'No email'}
                                    </Typography>
                                    {appointment.patient?.phone_number && (
                                      <Typography variant="caption" className="contact-item">
                                        <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                                        {appointment.patient.phone_number}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell className="table-cell">
                              <Box className="date-time-cell">
                                <Typography variant="body2" className="date-text" fontWeight="medium" color="primary">
                                  {getFormattedDate(appointment.appointment_date)}
                                </Typography>
                                {appointment.appointment_time && (
                                  <Box className="time-badge">
                                    <WatchLater sx={{ fontSize: 14, mr: 0.5 }} />
                                    {appointment.appointment_time}
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell className="table-cell">
                              <Chip 
                                size="small" 
                                label={appointment.appointment_type || 'Consultation'}
                                icon={<MedicalServices fontSize="small" />}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell className="table-cell">
                              <Box display="flex" alignItems="center">
                                {getStatusIcon(appointment.status)}
                                <StatusChip 
                                  size="small" 
                                  label={appointment.status?.toUpperCase() || 'UNKNOWN'}
                                  status={appointment.status?.toLowerCase()}
                                  className={`status-chip ${appointment.status?.toLowerCase() || ''}`}
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell className="table-cell">
                              <PriorityChip 
                                size="small" 
                                label={appointment.priority || 'normal'}
                                priority={appointment.priority || 'normal'}
                                className={`priority-chip ${appointment.priority || 'low'}`}
                              />
                            </TableCell>
                            <TableCell className="table-cell">
                              <Tooltip title={appointment.reason || 'No reason provided'}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {appointment.reason || 'No reason provided'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell className="table-cell" align="center">
                              <Box onClick={(e) => e.stopPropagation()}>
                                <Stack direction="row" spacing={1} justifyContent="center" className="actions-cell">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    className="action-button"
                                    onClick={() => handleViewDetails(appointment)}
                                  >
                                    <Visibility />
                                  </IconButton>
                                  {getActionButtons(appointment)}
                                </Stack>
                              </Box>
                            </TableCell>
                          </StyledTableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredAppointments.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredAppointments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                className="pagination-container"
              />
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => {
            setDialogOpen(false);
            setSelectedAppointmentId(null);
          }}
          maxWidth="md"
          fullWidth
          className="dialog-overlay"
          PaperProps={{ className: 'dialog-content' }}
        >
          {selectedAppointment && (
            <>
              <DialogTitle className="dialog-title">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Appointment Details</Typography>
                  <StatusChip 
                    label={selectedAppointment.status?.toUpperCase() || 'UNKNOWN'}
                    status={selectedAppointment.status?.toLowerCase()}
                  />
                </Box>
              </DialogTitle>
              <DialogContent dividers className="dialog-body">
                <Grid container spacing={3}>
                  {/* Patient Info */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Patient Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Full Name
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {getPatientName(selectedAppointment)}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              Contact Information
                            </Typography>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" display="flex" alignItems="center">
                                <Email sx={{ fontSize: 16, mr: 1 }} />
                                {selectedAppointment.patient?.user?.email || 'No email'}
                              </Typography>
                              {selectedAppointment.patient?.phone_number && (
                                <Typography variant="body2" display="flex" alignItems="center">
                                  <Phone sx={{ fontSize: 16, mr: 1 }} />
                                  {selectedAppointment.patient.phone_number}
                                </Typography>
                              )}
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">
                              Demographics
                            </Typography>
                            <Grid container spacing={1}>
                              {selectedAppointment.patient?.date_of_birth && (
                                <Grid item xs={6}>
                                  <Typography variant="body2">
                                    <strong>DOB:</strong> {selectedAppointment.patient.date_of_birth}
                                  </Typography>
                                </Grid>
                              )}
                              {selectedAppointment.patient?.gender && (
                                <Grid item xs={6}>
                                  <Typography variant="body2">
                                    <strong>Gender:</strong> {selectedAppointment.patient.gender}
                                  </Typography>
                                </Grid>
                              )}
                              {selectedAppointment.patient?.blood_group && (
                                <Grid item xs={12}>
                                  <Typography variant="body2">
                                    <strong>Blood Group:</strong> {selectedAppointment.patient.blood_group}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Appointment Details */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Appointment Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Date
                            </Typography>
                            <Typography variant="body1">
                              {getFormattedDate(selectedAppointment.appointment_date)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Time
                            </Typography>
                            <Typography variant="body1">
                              {selectedAppointment.appointment_time || 'Not specified'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Type
                            </Typography>
                            <Typography variant="body1">
                              {selectedAppointment.appointment_type || 'Consultation'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                            <Typography variant="body1">
                              {selectedAppointment.duration || '30'} minutes
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Priority
                            </Typography>
                            <PriorityChip 
                              label={selectedAppointment.priority || 'normal'}
                              priority={selectedAppointment.priority || 'normal'}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Reason and Notes */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                          <Notes sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Visit Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Reason for Visit
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Typography variant="body1">
                                {selectedAppointment.reason || 'No reason provided'}
                              </Typography>
                            </Paper>
                          </Grid>
                          {selectedAppointment.notes && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Additional Notes
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="body1">
                                  {selectedAppointment.notes}
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => {
                  setDialogOpen(false);
                  setSelectedAppointmentId(null);
                }}>Close</Button>
                {selectedAppointment.status?.toLowerCase() === 'pending' && (
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<Check />}
                    onClick={() => {
                      setDialogOpen(false);
                      handleAction('confirm', selectedAppointment);
                    }}
                  >
                    Confirm Appointment
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog 
          open={actionDialogOpen} 
          onClose={() => setActionDialogOpen(false)}
          className="dialog-overlay"
          PaperProps={{ className: 'dialog-content' }}
        >
          <DialogTitle className="dialog-title">
            {actionType === 'confirm' && 'Confirm Appointment'}
            {actionType === 'cancel' && 'Cancel Appointment'}
            {actionType === 'complete' && 'Mark as Complete'}
          </DialogTitle>
          <DialogContent className="dialog-body">
            {selectedAppointment && (
              <>
                <Typography variant="body1" paragraph>
                  {actionType === 'confirm' && 
                    `Confirm appointment with ${getPatientName(selectedAppointment)} on ${getFormattedDate(selectedAppointment.appointment_date)}?`}
                  
                  {actionType === 'cancel' && 
                    `Cancel appointment with ${getPatientName(selectedAppointment)}?`}
                  
                  {actionType === 'complete' && 
                    `Mark appointment with ${getPatientName(selectedAppointment)} as completed?`}
                </Typography>
                
                {actionType === 'cancel' && (
                  <TextField
                    autoFocus
                    fullWidth
                    multiline
                    rows={3}
                    label="Cancellation Reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    required
                    className="form-input"
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={confirmAction}
              variant="contained"
              color={
                actionType === 'confirm' ? 'success' :
                actionType === 'cancel' ? 'error' : 'primary'
              }
              disabled={actionType === 'cancel' && !cancelReason.trim()}
            >
              {actionType === 'confirm' && 'Confirm'}
              {actionType === 'cancel' && 'Cancel Appointment'}
              {actionType === 'complete' && 'Mark Complete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog 
          open={rescheduleDialogOpen} 
          onClose={() => setRescheduleDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          className="dialog-overlay"
          PaperProps={{ className: 'dialog-content' }}
        >
          <DialogTitle className="dialog-title">
            Reschedule Appointment
          </DialogTitle>
          <DialogContent dividers className="dialog-body">
            {selectedAppointment && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Patient: {getPatientName(selectedAppointment)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current: {getFormattedDate(selectedAppointment.appointment_date)} at {selectedAppointment.appointment_time}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth className="form-group">
                    <FormLabel className="form-label">Select New Date</FormLabel>
                    <TextField
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                      className="form-input"
                    />
                  </FormControl>
                </Grid>
          
                <Grid item xs={12}>
                  <FormControl fullWidth className="form-group">
                    <FormLabel className="form-label">Select Time Slot</FormLabel>
                    <RadioGroup
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                    >
                      <Grid container spacing={1} className="time-slots-grid">
                        {timeSlots.map((slot) => (
                          <Grid item xs={6} key={slot}>
                            <FormControlLabel
                              value={slot}
                              control={<Radio size="small" />}
                              label={
                                <Box className={`time-slot-option ${timeSlot === slot ? 'selected' : ''}`}>
                                  {slot}
                                </Box>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Grid>
                              
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes for rescheduling..."
                    className="form-textarea"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleReschedule}
              variant="contained"
              color="primary"
              disabled={!timeSlot}
            >
              Reschedule Appointment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            className="custom-snackbar"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="toast-container"
        />
      </Box>
    </div>
  );
};

export default DoctorAppointmentsManagment;