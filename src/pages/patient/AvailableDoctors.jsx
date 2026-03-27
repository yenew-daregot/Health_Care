import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  FilterList, 
  Refresh, 
  MedicalServices,
  AccessTime,
  VerifiedUser,
  Star,
  People,
  ClearAll
} from '@mui/icons-material';
import AvailableDoctorsList from '../../components/Doctors/AvailableDoctorsList';
import ApiTest from '../../components/Debug/ApiTest';
import doctorsApi from '../../api/doctorsApi';

const AvailableDoctors = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    minExperience: '',
    maxFee: '',
    availability: 'all',
    sortBy: 'rating'
  });
  const [specializations, setSpecializations] = useState([]);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    availableDoctors: 0,
    verifiedDoctors: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Fetch specializations and stats on component mount
  useEffect(() => {
    fetchSpecializations();
    fetchStats();
  }, []);
  
  const fetchSpecializations = async () => {
    try {
      setLoadingSpecializations(true);
      const response = await doctorsApi.getSpecializations();
      
      let specializationsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          specializationsData = response.data;
        } else if (Array.isArray(response.data.results)) {
          specializationsData = response.data.results;
        } else if (typeof response.data === 'object') {
          specializationsData = Object.values(response.data);
        }
      }
      
      // Filter active specializations
      const activeSpecializations = specializationsData
        .filter(spec => spec.is_active !== false)
        .map(spec => ({
          id: spec.id,
          name: spec.name || 'Unknown',
          description: spec.description || ''
        }));
      
      setSpecializations(activeSpecializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      // Use fallback specializations
      setSpecializations([
        { id: 1, name: 'General Physician' },
        { id: 2, name: 'Cardiologist' },
        { id: 3, name: 'Dermatologist' },
        { id: 4, name: 'Pediatrician' },
        { id: 5, name: 'Orthopedic' },
        { id: 6, name: 'Neurologist' },
        { id: 7, name: 'Gynecologist' }
      ]);
    } finally {
      setLoadingSpecializations(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await doctorsApi.getPublicStats();
      if (response.data) {
        setStats({
          totalDoctors: response.data.total_doctors || response.data.totalDoctors || 0,
          availableDoctors: response.data.available_doctors || response.data.availableDoctors || 0,
          verifiedDoctors: response.data.verified_doctors || response.data.verifiedDoctors || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to getStats if public stats fails (for admin users)
      try {
        const fallbackResponse = await doctorsApi.getStats();
        if (fallbackResponse.data) {
          setStats({
            totalDoctors: fallbackResponse.data.total_doctors || fallbackResponse.data.totalDoctors || 0,
            availableDoctors: fallbackResponse.data.available_doctors || fallbackResponse.data.availableDoctors || 0,
            verifiedDoctors: fallbackResponse.data.verified_doctors || fallbackResponse.data.verifiedDoctors || 0
          });
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback stats:', fallbackError);
      }
    } finally {
      setLoadingStats(false);
    }
  };
  
  const handleBookAppointment = (doctorId) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };
  
  const handleViewProfile = (doctorId) => {
    navigate(`/patient/doctors/${doctorId}`);
  };
  
  const handleFilterChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchSpecializations();
    fetchStats();
  };
  
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    
    // Update filters based on tab selection
    const newFilters = { ...filters };
    
    switch(newValue) {
      case 0: // All doctors
        newFilters.availability = 'all';
        newFilters.sortBy = 'rating';
        break;
      case 1: // Available now
        newFilters.availability = 'available';
        newFilters.sortBy = 'rating';
        break;
      case 2: // Verified only
        newFilters.availability = 'verified';
        newFilters.sortBy = 'rating';
        break;
      case 3: // Top rated
        newFilters.availability = 'all';
        newFilters.sortBy = 'rating';
        break;
      case 4: // Most experienced
        newFilters.availability = 'all';
        newFilters.sortBy = 'experience';
        break;
      default:
        break;
    }
    
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      minExperience: '',
      maxFee: '',
      availability: 'all',
      sortBy: 'rating'
    });
    setActiveTab(0);
  };
  
  const hasActiveFilters = () => {
    return filters.search || 
           filters.specialization || 
           filters.minExperience || 
           filters.maxFee || 
           filters.availability !== 'all' ||
           filters.sortBy !== 'rating';
  };
  
  // Map frontend filter names to backend API filter names
  const mapFiltersToApi = (frontendFilters) => {
    const apiFilters = {};
    
    // Basic filters
    if (frontendFilters.search) apiFilters.search = frontendFilters.search;
    if (frontendFilters.specialization) apiFilters.specialization = frontendFilters.specialization;
    
    // Status filter mapping
    if (frontendFilters.availability === 'available') {
      apiFilters.is_available = true;
      apiFilters.is_verified = true;
    } else if (frontendFilters.availability === 'verified') {
      apiFilters.is_verified = true;
    }
    // 'all' means no status filters
    
    // Experience filter
    if (frontendFilters.minExperience) {
      apiFilters.min_experience = parseInt(frontendFilters.minExperience);
    }
    
    // Fee filter
    if (frontendFilters.maxFee) {
      apiFilters.max_fee = parseFloat(frontendFilters.maxFee);
    }
    
    // Sort mapping
    switch(frontendFilters.sortBy) {
      case 'rating':
        apiFilters.ordering = '-rating';
        break;
      case 'experience':
        apiFilters.ordering = '-years_of_experience';
        break;
      case 'fee_low':
        apiFilters.ordering = 'consultation_fee';
        break;
      case 'fee_high':
        apiFilters.ordering = '-consultation_fee';
        break;
      case 'name_asc':
        apiFilters.ordering = 'user__first_name';
        break;
      case 'name_desc':
        apiFilters.ordering = '-user__first_name';
        break;
      default:
        apiFilters.ordering = '-rating';
    }
    
    return apiFilters;
  };
  
  const getActiveFiltersDisplay = () => {
    const activeFilters = [];
    
    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`);
    }
    
    if (filters.specialization) {
      const specName = specializations.find(s => s.id?.toString() === filters.specialization)?.name || 'Selected';
      activeFilters.push(`Specialization: ${specName}`);
    }
    
    if (filters.minExperience) {
      activeFilters.push(`Min Exp: ${filters.minExperience} yrs`);
    }
    
    if (filters.maxFee) {
      activeFilters.push(`Max Fee: ₹${filters.maxFee}`);
    }
    
    if (filters.availability !== 'all') {
      activeFilters.push(`Status: ${filters.availability}`);
    }
    
    if (filters.sortBy !== 'rating') {
      const sortLabels = {
        'experience': 'Most Experienced',
        'fee_low': 'Fee: Low to High',
        'fee_high': 'Fee: High to Low',
        'name_asc': 'Name A-Z',
        'name_desc': 'Name Z-A'
      };
      activeFilters.push(`Sort: ${sortLabels[filters.sortBy] || filters.sortBy}`);
    }
    
    return activeFilters;
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Debug Component - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <ApiTest />
      )}
      
      {/* Header Section */}
      <Stack direction={{ xs: 'column', md: 'row' }} 
             justifyContent="space-between" 
             alignItems={{ xs: 'flex-start', md: 'center' }} 
             spacing={2} 
             mb={4}>
        <Box>
          <Typography variant="h3" gutterBottom fontWeight="bold" color="primary.main">
            Find Your Doctor
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="normal">
            Connect with expert healthcare professionals
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            size="large"
            disabled={loadingSpecializations || loadingStats}
          >
            {loadingSpecializations || loadingStats ? 'Refreshing...' : 'Refresh List'}
          </Button>
          
          {hasActiveFilters() && (
            <Button
              variant="text"
              color="error"
              onClick={handleClearFilters}
              startIcon={<ClearAll />}
              size="large"
            >
              Clear All
            </Button>
          )}
        </Stack>
      </Stack>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, position: 'relative' }}>
            {loadingStats && (
              <CircularProgress size={20} sx={{ position: 'absolute', top: 10, right: 10 }} />
            )}
            <Stack direction="row" alignItems="center" spacing={2}>
              <MedicalServices sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalDoctors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Doctors
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'success.light', position: 'relative' }}>
            {loadingStats && (
              <CircularProgress size={20} sx={{ position: 'absolute', top: 10, right: 10 }} />
            )}
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccessTime sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.dark">
                  {stats.availableDoctors}
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Available Now
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'info.light', position: 'relative' }}>
            {loadingStats && (
              <CircularProgress size={20} sx={{ position: 'absolute', top: 10, right: 10 }} />
            )}
            <Stack direction="row" alignItems="center" spacing={2}>
              <VerifiedUser sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="info.dark">
                  {stats.verifiedDoctors}
                </Typography>
                <Typography variant="body2" color="info.dark">
                  Verified Doctors
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { py: 2, fontWeight: 500 }
          }}
        >
          <Tab icon={<People />} label="All Doctors" />
          <Tab icon={<AccessTime />} label="Available Now" />
          <Tab icon={<VerifiedUser />} label="Verified Only" />
          <Tab icon={<Star />} label="Top Rated" />
        </Tabs>
      </Paper>
      
      {/* Info Banner */}
      <Alert 
        severity="info" 
        icon={<MedicalServices />}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} 
               justifyContent="space-between" 
               alignItems={{ xs: 'flex-start', md: 'center' }}
               spacing={1}>
          <Box>
            <Typography variant="body1" fontWeight="medium">
              Quality Healthcare at Your Fingertips
            </Typography>
            <Typography variant="body2">
              All doctors are verified with valid medical licenses. Book appointments 24/7.
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip 
              label="100% Verified" 
              size="small" 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label="Secure Booking" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label="24/7 Support" 
              size="small" 
              color="info" 
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Alert>
      
      {/* Loading state for specializations */}
      {loadingSpecializations ? (
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center', borderRadius: 2 }}>
          <CircularProgress size={30} sx={{ mr: 2 }} />
          <Typography variant="body1" display="inline">
            Loading specializations...
          </Typography>
        </Paper>
      ) : null}
      
      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterList fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              Active Filters:
            </Typography>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {getActiveFiltersDisplay().map((filterText, index) => (
                <Chip
                  key={index}
                  label={filterText}
                  size="small"
                  onDelete={() => {
                    // Determine which filter to clear based on text
                    if (filterText.includes('Search:')) {
                      handleFilterChange({ search: '' });
                    } else if (filterText.includes('Specialization:')) {
                      handleFilterChange({ specialization: '' });
                    } else if (filterText.includes('Min Exp:')) {
                      handleFilterChange({ minExperience: '' });
                    } else if (filterText.includes('Max Fee:')) {
                      handleFilterChange({ maxFee: '' });
                    } else if (filterText.includes('Status:')) {
                      handleFilterChange({ availability: 'all' });
                      setActiveTab(0);
                    } else if (filterText.includes('Sort:')) {
                      handleFilterChange({ sortBy: 'rating' });
                    }
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}
      
      {/* Doctors List */}
      <Box sx={{ position: 'relative' }}>
        <AvailableDoctorsList
          key={refreshKey}
          onBookAppointment={handleBookAppointment}
          onViewProfile={handleViewProfile}
          initialFilters={mapFiltersToApi(filters)} // Convert filters for API
          showFilters={false} // We're handling filters in this parent component
          refreshKey={refreshKey}
        />
      </Box>
      
      {/* Footer Note */}
      <Paper elevation={0} sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Note:</strong> All doctors listed are registered medical practitioners. 
          Consultation fees are indicative and may vary. Bookings are confirmed subject to 
          doctor's availability. For emergencies, please visit the nearest hospital.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AvailableDoctors;