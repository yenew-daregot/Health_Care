import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Chip, IconButton, Tooltip, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, 
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, Alert as MuiAlert, 
  LinearProgress, Badge, Tabs, Tab, List, ListItem, ListItemText, ListItemIcon, 
  Avatar, Stack, useTheme, useMediaQuery, Breadcrumbs, Link, Skeleton, Snackbar 
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon, Refresh as RefreshIcon,
  Visibility as ViewIcon, Edit as EditIcon, LocationOn as LocationIcon,
  AccessTime as TimeIcon, Person as PersonIcon, LocalHospital as HospitalIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon,
  DirectionsCar as CarIcon, Phone as PhoneIcon, Message as MessageIcon,
  Map as MapIcon, Download as DownloadIcon, Emergency as EmergencyIcon,
  MedicalServices as MedicalIcon, Favorite as HeartIcon, LocalPharmacy as PharmacyIcon,
  WifiOff as OfflineIcon, ErrorOutline as ErrorIcon, Info as InfoIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import './emergencyRequest.css';
import EmergencyErrorBoundary from '../../components/ErrorBoundary/EmergencyErrorBoundary';

// Custom SnackbarAlert component for Snackbar 
const SnackbarAlert = React.forwardRef(function SnackbarAlert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EmergencyRequestsComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State management
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    responded: 0,
    averageResponseTime: 0
  });
  const [tabValue, setTabValue] = useState(0);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [useMockData, setUseMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'default' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'acknowledged', label: 'Acknowledged', color: 'info' },
    { value: 'dispatched', label: 'Dispatched', color: 'primary' },
    { value: 'en_route', label: 'En Route', color: 'secondary' },
    { value: 'arrived', label: 'Arrived', color: 'success' },
    { value: 'completed', label: 'Completed', color: 'default' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' },
  ];

  // Priority options
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical', color: 'error' },
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'medium', label: 'Medium', color: 'info' },
    { value: 'low', label: 'Low', color: 'success' },
  ];

  // Emergency type options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'sos', label: 'SOS', icon: <EmergencyIcon /> },
    { value: 'medical', label: 'Medical', icon: <MedicalIcon /> },
    { value: 'cardiac', label: 'Cardiac', icon: <HeartIcon /> },
    { value: 'trauma', label: 'Trauma', icon: <HospitalIcon /> },
    { value: 'respiratory', label: 'Respiratory', icon: <PharmacyIcon /> },
    { value: 'other', label: 'Other', icon: <WarningIcon /> },
  ];

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

  // Show snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  // Mock data generator for development
  const getMockEmergencies = () => {
    const mockEmergencies = [];
    const statuses = ['pending', 'acknowledged', 'dispatched', 'en_route', 'arrived', 'completed', 'cancelled'];
    const priorities = ['critical', 'high', 'medium', 'low'];
    const types = ['sos', 'medical', 'cardiac', 'trauma', 'respiratory', 'other'];
    
    for (let i = 1; i <= 25; i++) {
      try {
        const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const acknowledgedAt = Math.random() > 0.3 ? new Date(createdAt.getTime() + Math.random() * 30 * 60 * 1000) : null;
        
        const createdAtISO = createdAt && !isNaN(createdAt.getTime()) ? createdAt.toISOString() : new Date().toISOString();
        const acknowledgedAtISO = acknowledgedAt && !isNaN(acknowledgedAt.getTime()) ? acknowledgedAt.toISOString() : null;
        const dispatchedAtISO = acknowledgedAt && Math.random() > 0.5 ? 
          new Date(acknowledgedAt.getTime() + Math.random() * 15 * 60 * 1000).toISOString() : null;
        const completedAtISO = Math.random() > 0.7 ? 
          new Date(createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000).toISOString() : null;
        
        mockEmergencies.push({
          id: `EMG-${1000 + i}`,
          request_id: `EMG-${1000 + i}`,
          patient: {
            user: {
              first_name: `Patient${i}`,
              last_name: `Test${i}`,
              email: `patient${i}@example.com`,
              phone: `+1-555-01${i.toString().padStart(2, '0')}`
            }
          },
          emergency_type: types[Math.floor(Math.random() * types.length)],
          location: `Street ${i}, City ${Math.floor(Math.random() * 5)}`,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          created_at: createdAtISO,
          acknowledged_at: acknowledgedAtISO,
          dispatched_at: dispatchedAtISO,
          completed_at: completedAtISO,
          description: `Emergency situation ${i} - Patient experiencing ${['chest pain', 'shortness of breath', 'severe headache', 'injury', 'allergic reaction'][Math.floor(Math.random() * 5)]}`,
          medical_notes: Math.random() > 0.5 ? `Patient has allergies to ${['penicillin', 'aspirin', 'ibuprofen'][Math.floor(Math.random() * 3)]}` : null,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          response_notes: Math.random() > 0.6 ? `Responded within ${Math.floor(Math.random() * 30)} minutes. Patient stable.` : null
        });
      } catch (err) {
        console.error('Error generating mock emergency data:', err);
        continue;
      }
    }
    return mockEmergencies;
  };

  // Calculate stats from emergencies data
  const calculateStats = (emergenciesData) => {
    const activeEmergencies = emergenciesData.filter(e => 
      ['pending', 'acknowledged', 'dispatched', 'en_route', 'arrived'].includes(e.status)
    ).length;
    
    const criticalEmergencies = emergenciesData.filter(e => e.priority === 'critical').length;
    const respondedEmergencies = emergenciesData.filter(e => e.acknowledged_at).length;
    
    // Calculate average response time
    const respondedTimes = emergenciesData
      .filter(e => e.acknowledged_at && e.created_at)
      .map(e => {
        try {
          const created = new Date(e.created_at);
          const acknowledged = new Date(e.acknowledged_at);
          
          if (isNaN(created.getTime()) || isNaN(acknowledged.getTime())) {
            return null;
          }
          
          return (acknowledged - created) / 60000; // Convert to minutes
        } catch (err) {
          console.warn('Error calculating response time for emergency:', e.id, err);
          return null;
        }
      })
      .filter(time => time !== null && time >= 0);
    
    const averageResponseTime = respondedTimes.length > 0 
      ? Math.round(respondedTimes.reduce((a, b) => a + b, 0) / respondedTimes.length)
      : 0;

    return {
      total: emergenciesData.length,
      active: activeEmergencies,
      critical: criticalEmergencies,
      responded: respondedEmergencies,
      averageResponseTime
    };
  };
  // Fetch emergencies with enhanced error handling
  const fetchEmergencies = useCallback(async (retry = false) => {
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      setLoading(false);
      showSnackbar('You are offline. Data may not be up to date.', 'warning');
      return;
    }

    try {
      setLoading(true);
      if (!retry) setError(null);
      
      const response = await adminApi.getAdminEmergencies({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        type: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined,
        page: page + 1,
        limit: rowsPerPage
      });
      
      let emergenciesData = [];
      let statsData = {};
      
      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results)) {
          emergenciesData = response.data.results;
          statsData = response.data.stats || calculateStats(emergenciesData);
          
          if (response.data.count !== undefined) {
            setStats({ ...statsData, total: response.data.count });
          } else {
            setStats(statsData);
          }
        } else if (Array.isArray(response.data)) {
          emergenciesData = response.data;
          statsData = calculateStats(emergenciesData);
          setStats(statsData);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          emergenciesData = response.data.data;
          statsData = response.data.stats || calculateStats(emergenciesData);
          setStats(statsData);
        } else {
          console.error('Unexpected response structure:', response.data);
          throw new Error('Unexpected response structure from server');
        }
        
        // Validate and clean emergency data
        emergenciesData = emergenciesData.map(emergency => ({
          ...emergency,
          created_at: emergency.created_at && emergency.created_at !== 'Invalid Date' ? emergency.created_at : null,
          acknowledged_at: emergency.acknowledged_at && emergency.acknowledged_at !== 'Invalid Date' ? emergency.acknowledged_at : null,
          dispatched_at: emergency.dispatched_at && emergency.dispatched_at !== 'Invalid Date' ? emergency.dispatched_at : null,
          completed_at: emergency.completed_at && emergency.completed_at !== 'Invalid Date' ? emergency.completed_at : null,
          patient: emergency.patient || { user: { first_name: 'Unknown', last_name: '', email: '', phone: '' } },
          emergency_type: emergency.emergency_type || 'other',
          priority: emergency.priority || 'medium',
          status: emergency.status || 'pending',
          location: emergency.location || 'Location not specified',
          description: emergency.description || 'No description provided'
        }));
        
        setEmergencies(emergenciesData);
        setRetryCount(0); 
        setUseMockData(false);
        setLastUpdated(new Date());
        setError(null);
        
        if (emergenciesData.length > 0) {
          showSnackbar(`Loaded ${emergenciesData.length} emergencies`, 'success');
        }
      } else {
        throw new Error('Empty response from server');
      }
      
    } catch (err) {
      console.error('Error fetching emergencies:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to fetch emergencies from server';
      
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        showSnackbar('Session expired. Please login again', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      if (err.response?.status === 404) {
        showSnackbar('Emergency endpoint not found. Using demo data.', 'warning');
        setUseMockData(true);
        const mockData = getMockEmergencies();
        setEmergencies(mockData);
        setStats(calculateStats(mockData));
        return;
      }
      
      if (err.message.includes('Network Error') || err.message.includes('timeout')) {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          showSnackbar(`Network error. Retrying... (${retryCount + 1}/3)`, 'warning');
          setTimeout(() => fetchEmergencies(true), 2000 * retryCount);
          return;
        } else {
          showSnackbar('Failed to connect to server. Using demo data.', 'warning');
          setUseMockData(true);
          const mockData = getMockEmergencies();
          setEmergencies(mockData);
          setStats(calculateStats(mockData));
        }
      } else {
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, searchTerm, filterStatus, filterPriority, filterType, page, rowsPerPage, retryCount, navigate]);

  // Handle status update
  const handleStatusUpdate = async (emergencyId, newStatus) => {
    try {
      if (useMockData) {
        showSnackbar('Using mock data - status update simulated', 'info');
        setEmergencies(prev => prev.map(emergency => 
          emergency.id === emergencyId || emergency.request_id === emergencyId
            ? { ...emergency, status: newStatus, acknowledged_at: newStatus === 'acknowledged' ? new Date().toISOString() : emergency.acknowledged_at }
            : emergency
        ));
      } else {
        await adminApi.updateEmergencyStatus(emergencyId, { status: newStatus });
        await fetchEmergencies();
      }
      showSnackbar(`Emergency status updated to ${newStatus}`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update status';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    }
  };

  // Handle assign team
  const handleAssignTeam = async (emergencyId, teamMemberId) => {
    try {
      if (useMockData) {
        showSnackbar('Using mock data - team assignment simulated', 'info');
      } else {
        await adminApi.assignEmergencyTeam(emergencyId, { team_member_id: teamMemberId });
        await fetchEmergencies();
      }
      showSnackbar('Team assigned successfully', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to assign team';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    }
  };
  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showSnackbar('Back online. Refreshing data...', 'success');
      fetchEmergencies();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showSnackbar('You are offline. Some features may not work.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchEmergencies]);

  // Initialize data
  useEffect(() => {
    fetchEmergencies();
  }, [fetchEmergencies]);

  // Auto-refresh for active emergencies
  useEffect(() => {
    if (tabValue === 1 && !useMockData) {
      const interval = setInterval(() => {
        fetchEmergencies();
      }, 30000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [tabValue, useMockData, fetchEmergencies]);

  // Filter emergencies based on tab
  const filteredEmergencies = useMemo(() => {
    let filtered = emergencies;
    
    if (tabValue === 1) {
      filtered = filtered.filter(e => 
        ['pending', 'acknowledged', 'dispatched', 'en_route', 'arrived'].includes(e.status)
      );
    } else if (tabValue === 2) {
      filtered = filtered.filter(e => e.priority === 'critical');
    } else if (tabValue === 3) {
      filtered = filtered.filter(e => {
        if (!e.created_at) return false;
        try {
          let date;
          if (typeof e.created_at === 'string') {
            if (e.created_at === 'Invalid Date' || e.created_at === 'null' || e.created_at === 'undefined') {
              return false;
            }
            date = parseISO(e.created_at);
          } else if (e.created_at instanceof Date) {
            date = e.created_at;
          } else {
            return false;
          }
          
          if (isNaN(date.getTime())) {
            return false;
          }
          
          const hoursAgo = (new Date() - date) / (1000 * 60 * 60);
          return hoursAgo < 24;
        } catch (err) {
          console.warn('Error filtering by date:', e.created_at, err);
          return false;
        }
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        (e.patient?.user?.first_name?.toLowerCase() || '').includes(term) ||
        (e.patient?.user?.last_name?.toLowerCase() || '').includes(term) ||
        (e.request_id?.toLowerCase() || '').includes(term) ||
        (e.location?.toLowerCase() || '').includes(term) ||
        (e.patient?.user?.email?.toLowerCase() || '').includes(term)
      );
    }
    
    return filtered;
  }, [emergencies, tabValue, searchTerm]);

  // Get status chip color
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'default';
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return priorityOption?.color || 'default';
  };

  // Handle row click
  const handleRowClick = (emergency) => {
    setSelectedEmergency(emergency);
    setDetailsOpen(true);
  };

  // Handle dialog close
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEmergency(null);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  // Export to CSV
  const handleExportCSV = async () => {
    try {
      if (useMockData) {
        showSnackbar('Exporting mock data', 'info');
        const headers = ['ID', 'Patient Name', 'Type', 'Location', 'Priority', 'Status', 'Created', 'Response Time'];
        const csvData = emergencies.map(e => [
          e.request_id,
          `${e.patient?.user?.first_name} ${e.patient?.user?.last_name}`,
          e.emergency_type,
          e.location,
          e.priority,
          e.status,
          formatTime(e.created_at),
          e.acknowledged_at && e.created_at ? (() => {
            try {
              const acknowledgedDate = new Date(e.acknowledged_at);
              const createdDate = new Date(e.created_at);
              if (isNaN(acknowledgedDate.getTime()) || isNaN(createdDate.getTime())) {
                return 'Invalid';
              }
              return `${Math.round((acknowledgedDate - createdDate) / 60000)}m`;
            } catch (err) {
              return 'Error';
            }
          })() : 'N/A'
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvData].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `emergencies_mock_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const response = await adminApi.exportEmergencyReport({
          format: 'csv',
          report_type: 'emergencies_summary',
          start_date: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          end_date: format(new Date(), 'yyyy-MM-dd')
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `emergencies_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        showSnackbar('Data exported successfully', 'success');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to export data';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    }
  };

  // Render status chip with animation for active emergencies
  const renderStatusChip = (status) => {
    const isActive = ['pending', 'acknowledged', 'dispatched', 'en_route'].includes(status);
    return (
      <Chip
        label={statusOptions.find(opt => opt.value === status)?.label || status}
        color={getStatusColor(status)}
        size="small"
        variant="outlined"
        sx={{
          animation: isActive ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 }
          }
        }}
      />
    );
  };

  // Render priority chip with critical indicator
  const renderPriorityChip = (priority) => (
    <Chip
      label={priorityOptions.find(opt => opt.value === priority)?.label || priority}
      color={getPriorityColor(priority)}
      size="small"
      sx={{
        fontWeight: priority === 'critical' ? 'bold' : 'normal',
        boxShadow: priority === 'critical' ? '0 0 8px rgba(244, 67, 54, 0.5)' : 'none'
      }}
    />
  );

  // Render emergency type icon
  const renderTypeIcon = (type) => {
    const typeOption = typeOptions.find(opt => opt.value === type);
    return typeOption?.icon || <WarningIcon />;
  };

  // Dashboard stats cards
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
  // Loading skeleton state
  if (loading && page === 0) {
    return (
      <Box sx={{ 
        ml: { xs: 0, md: '235px' },
        p: isMobile ? 2 : 3,
        width: { xs: '100%', md: 'calc(100% - 235px)' }
      }}>
        <Skeleton variant="text" width="60%" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 4 }} />
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      ml: { xs: 0, md: '235px' },
      p: isMobile ? 2 : 3,
      width: { xs: '100%', md: 'calc(100% - 235px)' }
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Typography color="text.primary">Emergency Requests</Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Emergency Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor and respond to emergency requests
              {useMockData && ' (Using Demo Data)'}
              {lastUpdated && ` • Last updated: ${formatTimeAgo(lastUpdated.toISOString())}`}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} alignItems="center">
            {!isOnline && (
              <Chip
                icon={<OfflineIcon />}
                label="Offline"
                color="warning"
                variant="outlined"
                size="small"
              />
            )}
            {useMockData && (
              <Chip
                icon={<InfoIcon />}
                label="Demo Mode"
                color="info"
                variant="outlined"
                size="small"
              />
            )}
            <Tooltip title="Export Data">
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                onClick={handleExportCSV}
                disabled={loading}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title={loading ? "Refreshing..." : "Refresh Data"}>
              <IconButton 
                onClick={() => fetchEmergencies()} 
                disabled={loading}
                sx={{
                  animation: loading ? 'spin 2s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Emergencies"
            value={stats.total || 0}
            icon={<EmergencyIcon sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Now"
            value={stats.active || 0}
            icon={<WarningIcon sx={{ color: 'warning.main' }} />}
            color="warning"
            subtitle="Requiring attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Cases"
            value={stats.critical || 0}
            icon={<HospitalIcon sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Response Time"
            value={`${stats.averageResponseTime || 0}m`}
            icon={<TimeIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <MuiAlert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorIcon />
            <Box>
              <Typography variant="body2">{error}</Typography>
              {!isOnline && (
                <Typography variant="caption">
                  Please check your internet connection and try again.
                </Typography>
              )}
            </Box>
          </Box>
          {retryCount > 0 && (
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => fetchEmergencies()}
              sx={{ mt: 1 }}
            >
              Retry Now
            </Button>
          )}
        </MuiAlert>
      )}
      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by patient name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box display="flex" gap={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Chip
                          label={option.label}
                          size="small"
                          color={option.color}
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    label="Priority"
                  >
                    {priorityOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Chip
                          label={option.label}
                          size="small"
                          color={option.color}
                          sx={{ mr: 1 }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    {typeOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center">
                          {option.icon && (
                            <Box sx={{ mr: 1, display: 'flex' }}>
                              {option.icon}
                            </Box>
                          )}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  startIcon={<FilterIcon />}
                  variant="outlined"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterType('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="All Emergencies" />
          <Tab 
            label={
              <Badge 
                badgeContent={stats.active || 0} 
                color="error"
                sx={{ '& .MuiBadge-badge': { top: -5, right: -15 } }}
              >
                Active
              </Badge>
            } 
          />
          <Tab label="Critical" />
          <Tab label="Recent (24h)" />
        </Tabs>
      </Paper>
      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Response Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmergencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No emergency requests found
                    </Typography>
                    {searchTerm && (
                      <Button 
                        size="small" 
                        onClick={() => setSearchTerm('')}
                        sx={{ mt: 1 }}
                      >
                        Clear search
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmergencies.map((emergency) => {
                  // Additional safety check for each emergency
                  const safeEmergency = {
                    id: emergency.id || emergency.request_id || `emergency-${Math.random()}`,
                    request_id: emergency.request_id || emergency.id || 'Unknown',
                    patient: emergency.patient || { user: { first_name: 'Unknown', last_name: '', email: '', phone: '' } },
                    emergency_type: emergency.emergency_type || 'other',
                    priority: emergency.priority || 'medium',
                    status: emergency.status || 'pending',
                    location: emergency.location || 'Location not specified',
                    created_at: emergency.created_at,
                    acknowledged_at: emergency.acknowledged_at
                  };
                  
                  return (
                    <TableRow
                      key={safeEmergency.id}
                      hover
                      onClick={() => handleRowClick(safeEmergency)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          transform: 'scale(1.002)',
                          transition: 'transform 0.1s',
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {safeEmergency.request_id}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {safeEmergency.patient.user.first_name} {safeEmergency.patient.user.last_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {safeEmergency.patient.user.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {renderTypeIcon(safeEmergency.emergency_type)}
                          <Typography variant="body2">
                            {safeEmergency.emergency_type.toUpperCase()}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon fontSize="small" color="primary" />
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {safeEmergency.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        {renderPriorityChip(safeEmergency.priority)}
                      </TableCell>
                      
                      <TableCell>
                        {renderStatusChip(safeEmergency.status)}
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title={formatTime(safeEmergency.created_at)}>
                          <Typography variant="body2">
                            {formatTimeAgo(safeEmergency.created_at)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell>
                        {safeEmergency.acknowledged_at && safeEmergency.created_at ? (
                          <Tooltip title={`Acknowledged: ${formatTime(safeEmergency.acknowledged_at)}`}>
                            <Typography variant="body2" color="success.main" fontWeight="medium">
                              {(() => {
                                try {
                                  const acknowledgedDate = new Date(safeEmergency.acknowledged_at);
                                  const createdDate = new Date(safeEmergency.created_at);
                                  
                                  if (isNaN(acknowledgedDate.getTime()) || isNaN(createdDate.getTime())) {
                                    return 'Invalid';
                                  }
                                  
                                  const diffMinutes = Math.round((acknowledgedDate - createdDate) / 60000);
                                  return `${diffMinutes}m`;
                                } catch (err) {
                                  console.warn('Error calculating response time:', err);
                                  return 'Error';
                                }
                              })()}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="warning.main" fontWeight="medium">
                            Waiting...
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(safeEmergency);
                              }}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Could open status update dialog here
                              }}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={emergencies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Emergency Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="div">
              Emergency Details - {selectedEmergency?.request_id || 'N/A'}
            </Typography>
            <IconButton
              onClick={handleCloseDetails}
              sx={{ color: 'white' }}
            >
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedEmergency && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Patient Information
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {selectedEmergency.patient?.user?.first_name || 'Unknown'} {selectedEmergency.patient?.user?.last_name || ''}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {selectedEmergency.patient?.user?.email || 'No email'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {selectedEmergency.patient?.user?.phone || 'No phone'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Emergency Details
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {renderTypeIcon(selectedEmergency.emergency_type)}
                      <Typography sx={{ color: 'white' }}>
                        Type: {selectedEmergency.emergency_type?.toUpperCase() || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationIcon />
                      <Typography sx={{ color: 'white' }}>
                        Location: {selectedEmergency.location || 'Not specified'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TimeIcon />
                      <Typography sx={{ color: 'white' }}>
                        Created: {formatTime(selectedEmergency.created_at)}
                      </Typography>
                    </Box>
                    {selectedEmergency.acknowledged_at && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CheckCircleIcon />
                        <Typography sx={{ color: 'white' }}>
                          Acknowledged: {formatTime(selectedEmergency.acknowledged_at)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Status & Priority
                    </Typography>
                    <Box display="flex" gap={2} mb={2}>
                      {renderStatusChip(selectedEmergency.status)}
                      {renderPriorityChip(selectedEmergency.priority)}
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                      Description: {selectedEmergency.description || 'No description provided'}
                    </Typography>
                    
                    {selectedEmergency.medical_notes && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        Medical Notes: {selectedEmergency.medical_notes}
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                      Quick Actions
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Button
                        startIcon={<PhoneIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => {
                          if (selectedEmergency.patient?.user?.phone) {
                            window.open(`tel:${selectedEmergency.patient.user.phone}`);
                          }
                        }}
                        disabled={!selectedEmergency.patient?.user?.phone}
                      >
                        Call
                      </Button>
                      <Button
                        startIcon={<MessageIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => {
                          if (selectedEmergency.patient?.user?.email) {
                            window.open(`mailto:${selectedEmergency.patient.user.email}`);
                          }
                        }}
                        disabled={!selectedEmergency.patient?.user?.email}
                      >
                        Email
                      </Button>
                      <Button
                        startIcon={<MapIcon />}
                        variant="contained"
                        size="small"
                        onClick={() => {
                          if (selectedEmergency.latitude && selectedEmergency.longitude) {
                            window.open(`https://maps.google.com/?q=${selectedEmergency.latitude},${selectedEmergency.longitude}`);
                          } else if (selectedEmergency.location) {
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedEmergency.location)}`);
                          }
                        }}
                      >
                        Map
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails} sx={{ color: 'white' }}>
            Close
          </Button>
          {selectedEmergency && selectedEmergency.status === 'pending' && (
            <Button
              variant="contained"
              onClick={() => {
                handleStatusUpdate(selectedEmergency.id || selectedEmergency.request_id, 'acknowledged');
                handleCloseDetails();
              }}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Acknowledge
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <SnackbarAlert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </SnackbarAlert>
      </Snackbar>
    </Box>
  );
};

const EmergencyRequestsWithErrorBoundary = () => (
  <EmergencyErrorBoundary>
    <EmergencyRequestsComponent />
  </EmergencyErrorBoundary>
);

export default EmergencyRequestsWithErrorBoundary;