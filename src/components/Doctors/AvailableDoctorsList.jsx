import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Rating,
  Paper,
  Pagination,
  Tooltip,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  MedicalServices,
  LocationOn,
  Schedule,
  Verified,
  AccessTime,
  Search,
  ClearAll,
  FilterList,
  Refresh,
  Person,
  CalendarToday,
  Phone,
  Email,
  Star as StarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import doctorsApi from '../../api/doctorsApi';

const StyledDoctorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const AvailableDoctorsList = ({ 
  onBookAppointment, 
  onViewProfile, 
  initialFilters = {}, 
  refreshKey,
  showFilters = true,
  itemsPerPage = 6,
  compactView = false
}) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [displayedDoctors, setDisplayedDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [specializationFilter, setSpecializationFilter] = useState(initialFilters?.specialization || '');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'rating');
  const [specializations, setSpecializations] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    minExperience: initialFilters?.minExperience || '',
    maxFee: initialFilters?.maxFee || '',
    status: initialFilters?.status || 'all'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);

  useEffect(() => {
    fetchAvailableDoctors();
    fetchSpecializations();
  }, [refreshKey]);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchTerm, specializationFilter, sortBy, advancedFilters]);

  useEffect(() => {
    // Update displayed doctors based on current page
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedDoctors(filteredDoctors.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(filteredDoctors.length / itemsPerPage));
  }, [filteredDoctors, page, itemsPerPage]);

  // Optimized fetch function using doctorsApi.searchDoctors()
  const fetchAvailableDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching available doctors with filters...');
      
      // Use the searchDoctors method with proper filters
      const filters = {
        is_available: advancedFilters.status === 'all' ? undefined : advancedFilters.status === 'available',
        is_verified: advancedFilters.status === 'verified' || advancedFilters.status === 'available' ? true : undefined,
        search: searchTerm || undefined,
        specialization: specializationFilter || undefined,
        min_experience: advancedFilters.minExperience || undefined,
        max_fee: advancedFilters.maxFee || undefined,
        ordering: getOrderingParam(sortBy)
      };
      
      // Remove undefined values to avoid sending them to the API
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Using filters:', cleanFilters);
      
      const response = await doctorsApi.searchDoctors(cleanFilters);
      console.log('API response:', response.data);
      
      let doctorsData = [];
      
      // Handle different response formats
      if (response.data) {
        if (Array.isArray(response.data)) {
          doctorsData = response.data;
        } else if (Array.isArray(response.data.results)) {
          doctorsData = response.data.results;
        } else if (response.data.doctors && Array.isArray(response.data.doctors)) {
          doctorsData = response.data.doctors;
        } else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          // If it's a single object, wrap it in an array
          doctorsData = [response.data];
        }
      }
      
      console.log('Processed doctors data:', doctorsData.length, 'doctors');
      
      // Format doctor data for consistency
      const formattedDoctors = doctorsData.map(doctor => {
        // Handle both nested user structure and flat structure
        const firstName = doctor.user?.first_name || doctor.first_name || '';
        const lastName = doctor.user?.last_name || doctor.last_name || '';
        const fullName = doctor.full_name || `${firstName} ${lastName}`.trim();
        
        // Handle specialization data
        let specializationName = 'General Physician';
        let specializationId = null;
        
        if (doctor.specialization) {
          if (typeof doctor.specialization === 'object') {
            specializationName = doctor.specialization.name || specializationName;
            specializationId = doctor.specialization.id;
          } else if (typeof doctor.specialization === 'string') {
            specializationName = doctor.specialization;
          }
        } else if (doctor.specialization_name) {
          specializationName = doctor.specialization_name;
        }
        
        // Handle profile picture
        let profilePictureUrl = '';
        if (doctor.user?.profile_picture_url) {
          profilePictureUrl = doctor.user.profile_picture_url;
        } else if (doctor.user?.profile_picture) {
          profilePictureUrl = doctor.user.profile_picture;
        } else if (doctor.profile_picture_url) {
          profilePictureUrl = doctor.profile_picture_url;
        } else if (doctor.profile_picture) {
          profilePictureUrl = doctor.profile_picture;
        }
        
        // Parse numeric values safely
        const rating = parseFloat(doctor.rating) || 0;
        const reviewsCount = parseInt(doctor.reviews_count) || 0;
        const yearsOfExperience = parseInt(doctor.years_of_experience) || 0;
        const consultationFee = parseFloat(doctor.consultation_fee) || 500;
        
        return {
          ...doctor,
          id: doctor.id,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          specialization: doctor.specialization || { id: specializationId, name: specializationName },
          specialization_name: specializationName,
          specialization_id: specializationId,
          profile_picture_url: profilePictureUrl,
          is_available: doctor.is_available !== false,
          is_verified: doctor.is_verified !== false,
          consultation_hours_display: formatConsultationHours(doctor.consultation_hours),
          rating: rating,
          reviews_count: reviewsCount,
          years_of_experience: yearsOfExperience,
          consultation_fee: consultationFee,
          address: doctor.address || '',
          qualification: doctor.qualification || '',
          license_number: doctor.license_number || '',
          bio: doctor.bio || '',
          phone_number: doctor.phone_number || doctor.user?.phone_number || '',
          email: doctor.email || doctor.user?.email || ''
        };
      });
      
      setDoctors(formattedDoctors);
      
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // User-friendly error messages
      if (error.response?.status === 401) {
        setError('Please login to view doctors. Redirecting to login page...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view doctors.');
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setError(`Unable to connect to the backend server. Please make sure:
        
1. The Django backend server is running on http://127.0.0.1:8000
2. Start the backend with: cd backend && python manage.py runserver
3. Check that the API URL in frontend/.env is correct: REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api/

Current API URL: ${error.config?.baseURL || 'Unknown'}`);
      } else if (error.response?.status === 404) {
        setError('Doctors endpoint not found. Please check the API configuration.');
      } else if (error.code === 'ECONNREFUSED') {
        setError('Connection refused. Please make sure the backend server is running on http://127.0.0.1:8000');
      } else {
        setError(`Failed to load doctors: ${error.message}. 

Troubleshooting steps:
1. Check if backend server is running: http://127.0.0.1:8000/api/test/
2. Check browser console for more details
3. Verify API configuration in frontend/.env`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      setSpecializationsLoading(true);
      const response = await doctorsApi.getSpecializations();
      
      console.log('Specializations response:', response.data);
      
      let specializationsData = [];      
      if (response.data) {
        if (Array.isArray(response.data)) {
          specializationsData = response.data;
        } else if (Array.isArray(response.data.results)) {
          specializationsData = response.data.results;
        } else if (typeof response.data === 'object') {
          // If it's an object, convert to array
          specializationsData = Object.values(response.data);
        }
      }
      
      // Filter only active specializations and ensure proper structure
      const formattedSpecializations = specializationsData
        .filter(spec => spec.is_active !== false)
        .map(spec => ({
          id: spec.id,
          name: spec.name || spec.label || 'Unknown',
          is_active: spec.is_active !== false,
          description: spec.description || ''
        }));
      
      setSpecializations(formattedSpecializations);     
    } catch (error) {
      console.error('Error fetching specializations:', error);
      
      // Fallback specializations
      const fallbackSpecializations = [
        { id: 1, name: 'General Physician', is_active: true },
        { id: 2, name: 'Cardiologist', is_active: true },
        { id: 3, name: 'Dermatologist', is_active: true },
        { id: 4, name: 'Pediatrician', is_active: true },
        { id: 5, name: 'Orthopedic', is_active: true },
        { id: 6, name: 'Neurologist', is_active: true },
        { id: 7, name: 'Gynecologist', is_active: true }
      ];
      
      setSpecializations(fallbackSpecializations);
    } finally {
      setSpecializationsLoading(false);
    }
  };

  const formatConsultationHours = (hours) => {
    if (!hours || typeof hours !== 'object' || Object.keys(hours).length === 0) {
      return 'Mon-Fri: 9AM-6PM';
    }
    
    try {
      const days = Object.keys(hours);
      if (days.length === 0) return 'Mon-Fri: 9AM-6PM';
      
      // Get today's day name
      const today = new Date().getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today];
      
      // Check if doctor is available today
      if (hours[todayName]) {
        const dayDisplay = todayName.charAt(0).toUpperCase() + todayName.slice(1);
        return `Today: ${hours[todayName]}`;
      }
      
      // If not available today, show first available day
      const firstDay = days[0];
      const dayDisplay = firstDay.charAt(0).toUpperCase() + firstDay.slice(1);
      return `${dayDisplay}: ${hours[firstDay] || '9AM-6PM'}`;
    } catch {
      return 'Mon-Fri: 9AM-6PM';
    }
  };

  // Convert frontend sortBy to backend ordering param
  const getOrderingParam = (sortByValue) => {
    switch(sortByValue) {
      case 'rating': return '-rating';
      case 'experience': return '-years_of_experience';
      case 'fee_low': return 'consultation_fee';
      case 'fee_high': return '-consultation_fee';
      case 'name_asc': return 'user__first_name,user__last_name';
      case 'name_desc': return '-user__first_name,-user__last_name';
      default: return '-rating';
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    // Additional client-side search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(doctor => {
        const searchFields = [
          doctor.first_name,
          doctor.last_name,
          doctor.full_name,
          doctor.specialization_name,
          doctor.qualification,
          doctor.license_number,
          doctor.bio,
          doctor.address
        ].filter(Boolean);
        
        return searchFields.some(field => 
          field.toString().toLowerCase().includes(term)
        );
      });
    }

    // Specialization filter (client-side)
    if (specializationFilter && Array.isArray(specializations) && specializations.length > 0) {
      filtered = filtered.filter(doctor => {
        if (!doctor.specialization_name) return false;
        
        const doctorSpecId = doctor.specialization_id?.toString();
        const doctorSpecName = doctor.specialization_name.toLowerCase();
        const filterValue = specializationFilter.toLowerCase();
        
        return doctorSpecId === filterValue || 
               doctorSpecName.includes(filterValue) ||
               (doctor.specialization?.name && 
                doctor.specialization.name.toLowerCase().includes(filterValue));
      });
    }

    // Advanced filters (client-side)
    if (advancedFilters.minExperience) {
      const minExp = parseInt(advancedFilters.minExperience);
      if (!isNaN(minExp)) {
        filtered = filtered.filter(doctor => 
          (doctor.years_of_experience || 0) >= minExp
        );
      }
    }

    if (advancedFilters.maxFee) {
      const maxFee = parseFloat(advancedFilters.maxFee);
      if (!isNaN(maxFee)) {
        filtered = filtered.filter(doctor => 
          (doctor.consultation_fee || 0) <= maxFee
        );
      }
    }

    // Status filter (already handled by API, but keeping for client-side fallback)
    if (advancedFilters.status !== 'all') {
      if (advancedFilters.status === 'available') {
        filtered = filtered.filter(doctor => doctor.is_available === true);
      } else if (advancedFilters.status === 'verified') {
        filtered = filtered.filter(doctor => doctor.is_verified === true);
      }
    }

    // Client-side sorting as fallback
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.years_of_experience || 0) - (a.years_of_experience || 0);
        case 'fee_low':
          return (a.consultation_fee || 0) - (b.consultation_fee || 0);
        case 'fee_high':
          return (b.consultation_fee || 0) - (a.consultation_fee || 0);
        case 'name_asc':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'name_desc':
          return (b.full_name || '').localeCompare(a.full_name || '');
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const handleAdvancedFilterChange = (field, value) => {
    const newFilters = { ...advancedFilters, [field]: value };
    setAdvancedFilters(newFilters);
    
    // Trigger new API call when status filter changes
    if (field === 'status') {
      setTimeout(() => fetchAvailableDoctors(), 100);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Debounced API call for search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchAvailableDoctors();
    }, 500);
  };

  const handleSpecializationChange = (value) => {
    setSpecializationFilter(value);
    // Trigger API call for specialization filter
    setTimeout(() => fetchAvailableDoctors(), 100);
  };

  const handleBookAppointment = (doctorId) => {
    if (onBookAppointment) {
      onBookAppointment(doctorId);
    } else {
      navigate(`/patient/book-appointment/${doctorId}`);
    }
  };

  const handleViewProfile = (doctorId) => {
    if (onViewProfile) {
      onViewProfile(doctorId);
    } else {
      navigate(`/patient/doctors/${doctorId}`);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSpecializationFilter('');
    setSortBy('rating');
    setAdvancedFilters({
      minExperience: '',
      maxFee: '',
      status: 'all'
    });
    
    // Refresh with cleared filters
    setTimeout(() => fetchAvailableDoctors(), 100);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRefresh = () => {
    fetchAvailableDoctors();
    fetchSpecializations();
  };

  const hasActiveFilters = () => {
    return searchTerm || 
           specializationFilter || 
           advancedFilters.minExperience || 
           advancedFilters.maxFee || 
           advancedFilters.status !== 'all' ||
           sortBy !== 'rating';
  };

  const renderSkeletonLoader = () => {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid item xs={12} sm={6} md={compactView ? 6 : 4} key={i}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Skeleton variant="circular" width={70} height={70} />
                  <Box flex={1}>
                    <Skeleton variant="text" width="80%" height={30} />
                    <Skeleton variant="text" width="60%" height={25} />
                  </Box>
                </Stack>
                <Stack direction="row" spacing={2} mb={2}>
                  <Box flex={1}>
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </Box>
                  <Box flex={1}>
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </Box>
                </Stack>
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2, borderRadius: 1 }} />
                <Stack direction="row" spacing={2} mt={2}>
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Stack>
              </CardContent>
              <CardActions>
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <Paper elevation={0} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
            Find Your Doctor
          </Typography>
          
          {hasActiveFilters() && (
            <Tooltip title="Clear all filters">
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                startIcon={<ClearAll />}
                size="small"
                color="error"
              >
                Clear All
              </Button>
            </Tooltip>
          )}
        </Stack>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Doctors"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, specialization, or license"
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Specialization</InputLabel>
              <Select
                value={specializationFilter}
                onChange={(e) => handleSpecializationChange(e.target.value)}
                label="Specialization"
                disabled={specializationsLoading || specializations.length === 0}
              >
                <MenuItem value="">All Specializations</MenuItem>
                {specializationsLoading ? (
                  <MenuItem value="" disabled>Loading...</MenuItem>
                ) : (
                  specializations.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Min Experience"
              type="number"
              value={advancedFilters.minExperience}
              onChange={(e) => handleAdvancedFilterChange('minExperience', e.target.value)}
              placeholder="Years"
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: <AccessTime fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
              }}
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Max Fee (₹)"
              type="number"
              value={advancedFilters.maxFee}
              onChange={(e) => handleAdvancedFilterChange('maxFee', e.target.value)}
              placeholder="₹ Max"
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: <MedicalServices fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={advancedFilters.status}
                onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Doctors</MenuItem>
                <MenuItem value="available">Available Now</MenuItem>
                <MenuItem value="verified">Verified Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setTimeout(() => fetchAvailableDoctors(), 100);
                }}
                label="Sort By"
              >
                <MenuItem value="rating">Highest Rating</MenuItem>
                <MenuItem value="experience">Most Experienced</MenuItem>
                <MenuItem value="fee_low">Fee: Low to High</MenuItem>
                <MenuItem value="fee_high">Fee: High to Low</MenuItem>
                <MenuItem value="name_asc">Name A-Z</MenuItem>
                <MenuItem value="name_desc">Name Z-A</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active filters chips */}
        {hasActiveFilters() && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                size="small"
                onDelete={() => handleSearchChange('')}
              />
            )}
            
            {specializationFilter && (
              <Chip
                label={`Specialization: ${specializations.find(s => s.id?.toString() === specializationFilter)?.name || 'Selected'}`}
                size="small"
                onDelete={() => handleSpecializationChange('')}
              />
            )}
            
            {advancedFilters.minExperience && (
              <Chip
                label={`Min Exp: ${advancedFilters.minExperience}yrs`}
                size="small"
                onDelete={() => handleAdvancedFilterChange('minExperience', '')}
              />
            )}
            
            {advancedFilters.maxFee && (
              <Chip
                label={`Max Fee: ₹${advancedFilters.maxFee}`}
                size="small"
                onDelete={() => handleAdvancedFilterChange('maxFee', '')}
              />
            )}
            
            {advancedFilters.status !== 'all' && (
              <Chip
                label={`Status: ${advancedFilters.status}`}
                size="small"
                onDelete={() => handleAdvancedFilterChange('status', 'all')}
              />
            )}
            
            {sortBy !== 'rating' && (
              <Chip
                label={`Sort: ${sortBy.replace('_', ' ')}`}
                size="small"
                onDelete={() => {
                  setSortBy('rating');
                  setTimeout(() => fetchAvailableDoctors(), 100);
                }}
              />
            )}
          </Box>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Loading available doctors...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fetching doctors who are available and verified
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleRefresh}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => navigate('/')}
              >
                Go Home
              </Button>
            </Stack>
          }
        >
          <Typography variant="subtitle1" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2">
            We're having trouble loading the doctors list. This might be due to server issues or network problems.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {renderFilters()}
      
      {/* Results header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Available Doctors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
            {hasActiveFilters() && ' matching your criteria'}
            {advancedFilters.status === 'available' && ' (Available & Verified)'}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh doctors list">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          {doctors.length > 0 && (
            <Chip 
              icon={<Verified fontSize="small" />}
              label={`${doctors.length} verified doctors`} 
              size="small" 
              color="success" 
              variant="outlined"
            />
          )}
        </Stack>
      </Stack>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <MedicalServices sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No doctors found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {hasActiveFilters() 
              ? 'Try adjusting your filters to find more doctors' 
              : 'No verified doctors are currently available. Please check back later.'}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            {hasActiveFilters() && (
              <Button 
                variant="contained" 
                onClick={handleClearFilters}
                startIcon={<ClearAll />}
              >
                Clear All Filters
              </Button>
            )}
            <Button 
              variant="outlined" 
              onClick={handleRefresh}
              startIcon={<Refresh />}
            >
              Refresh List
            </Button>
          </Stack>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {displayedDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={compactView ? 6 : 4} key={doctor.id}>
                <StyledDoctorCard>
                  {/* Doctor verification badge */}
                  {doctor.is_verified && (
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                      <Chip
                        icon={<Verified fontSize="small" />}
                        label="Verified"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                    {/* Doctor Header */}
                    <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                      <Avatar
                        src={doctor.profile_picture_url}
                        sx={{ 
                          width: 70, 
                          height: 70, 
                          fontSize: '1.5rem',
                          border: '3px solid',
                          borderColor: 'primary.light',
                          bgcolor: doctor.profile_picture_url ? 'transparent' : 'primary.main'
                        }}
                        alt={`Dr. ${doctor.full_name}`}
                      >
                        {doctor.first_name?.[0]}{doctor.last_name?.[0] || doctor.full_name?.[0]}
                      </Avatar>
                      
                      <Box flex={1}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                          Dr. {doctor.full_name || 'Unknown Doctor'}
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                          <MedicalServices fontSize="small" color="primary" />
                          <Typography variant="body1" color="primary" fontWeight="medium" noWrap>
                            {doctor.specialization_name}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Rating and Experience */}
                    <Stack direction="row" spacing={3} mb={3} flexWrap="wrap" useFlexGap>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Rating 
                            value={doctor.rating || 0} 
                            readOnly 
                            precision={0.5} 
                            size="small"
                            sx={{ color: '#FFC107' }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {doctor.rating ? doctor.rating.toFixed(1) : 'N/A'}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          ({doctor.reviews_count || 0} reviews)
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {doctor.years_of_experience || 0}+ years
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Experience
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Consultation Fee */}
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        mb: 3, 
                        p: 2, 
                        bgcolor: 'primary.light', 
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #E3F2FD, #BBDEFB)'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="primary.dark" fontWeight="medium">
                          Consultation Fee
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary.dark">
                          ₹{doctor.consultation_fee?.toLocaleString('en-IN') || 500}
                        </Typography>
                      </Stack>
                    </Paper>

                    {/* Contact & Info */}
                    <Stack spacing={2} mb={2}>
                      {doctor.address && (
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <LocationOn fontSize="small" color="action" sx={{ mt: 0.5 }} />
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {doctor.address.length > 60 ? `${doctor.address.substring(0, 60)}...` : doctor.address}
                          </Typography>
                        </Stack>
                      )}
                      
                      {/* Email */}
                      {doctor.email && (
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Email fontSize="small" color="action" sx={{ mt: 0.5 }} />
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {doctor.email}
                          </Typography>
                        </Stack>
                      )}
                      
                      {/* Phone Number */}
                      {doctor.phone_number && (
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Phone fontSize="small" color="action" sx={{ mt: 0.5 }} />
                          <Typography variant="body2">
                            {doctor.phone_number}
                          </Typography>
                        </Stack>
                      )}
                      
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Schedule fontSize="small" color="action" sx={{ mt: 0.5 }} />
                        <Typography variant="body2">
                          {doctor.consultation_hours_display}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Qualifications */}
                    {doctor.qualification && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontStyle: 'italic', 
                          display: 'block',
                          mb: 1 
                        }}
                      >
                        {doctor.qualification.length > 80 
                          ? `${doctor.qualification.substring(0, 80)}...` 
                          : doctor.qualification}
                      </Typography>
                    )}
                    
                    {/* Availability status */}
                    {!doctor.is_available && (
                      <Chip
                        label="Currently Unavailable"
                        color="warning"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                    
                    {/* Contact Actions */}
                    {(doctor.phone_number || doctor.email) && (
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
                        {doctor.phone_number && (
                          <Chip
                            icon={<Phone fontSize="small" />}
                            label={`Call: ${doctor.phone_number}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => window.open(`tel:${doctor.phone_number}`)}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                        {doctor.email && (
                          <Chip
                            icon={<Email fontSize="small" />}
                            label="Email"
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => window.open(`mailto:${doctor.email}`)}
                            sx={{ cursor: 'pointer' }}
                          />
                        )}
                      </Stack>
                    )}
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleViewProfile(doctor.id)}
                      size="medium"
                      startIcon={<Person />}
                      sx={{ mr: 1 }}
                    >
                      Profile
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBookAppointment(doctor.id)}
                      size="medium"
                      startIcon={<CalendarToday />}
                      disabled={!doctor.is_available}
                    >
                      {doctor.is_available ? 'Book Now' : 'Unavailable'}
                    </Button>
                  </CardActions>
                </StyledDoctorCard>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
          
          {/* Summary info */}
          <Paper sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Showing {displayedDoctors.length} of {filteredDoctors.length} doctors
              {advancedFilters.status === 'available' && ' (Available & Verified)'}
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
};

AvailableDoctorsList.defaultProps = {
  onBookAppointment: null,
  onViewProfile: null,
  initialFilters: {},
  refreshKey: 0,
  showFilters: true,
  itemsPerPage: 6,
  compactView: false
};

export default AvailableDoctorsList;