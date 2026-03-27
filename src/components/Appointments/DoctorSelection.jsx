import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  Verified,
  AccessTime
} from '@mui/icons-material';

import doctorsApi from '../../api/doctorsApi';

const DoctorSelection = ({ selectedDoctor, onDoctorSelect, loading }) => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialization]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await doctorsApi.getAvailableDoctors();
      
      let doctorsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          doctorsData = response.data;
        } else if (response.data.results) {
          doctorsData = response.data.results;
        }
      }
      
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await doctorsApi.getSpecializations();
      let specializationsData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          specializationsData = response.data;
        } else if (response.data.results) {
          specializationsData = response.data.results;
        }
      }
      
      setSpecializations(specializationsData);
    } catch (err) {
      console.error('Error fetching specializations:', err);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => {
        const fullName = `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.toLowerCase();
        const specialization = doctor.specialization_name?.toLowerCase() || '';
        return fullName.includes(term) || specialization.includes(term);
      });
    }

    // Filter by specialization
    if (selectedSpecialization) {
      filtered = filtered.filter(doctor => 
        doctor.specialization_id?.toString() === selectedSpecialization.toString()
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleDoctorSelect = (doctor) => {
    onDoctorSelect(doctor);
  };

  if (loadingDoctors) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading available doctors...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchDoctors} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Select a Doctor
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose from our qualified healthcare professionals
      </Typography>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search doctors by name or specialization"
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
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Specialization</InputLabel>
            <Select
              value={selectedSpecialization}
              label="Specialization"
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <MenuItem value="">All Specializations</MenuItem>
              {specializations.map((spec) => (
                <MenuItem key={spec.id} value={spec.id}>
                  {spec.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available
      </Typography>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <Alert severity="info">
          No doctors found matching your criteria. Try adjusting your search or filters.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredDoctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: selectedDoctor?.id === doctor.id ? 2 : 1,
                  borderColor: selectedDoctor?.id === doctor.id ? 'primary.main' : 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleDoctorSelect(doctor)}
              >
                <CardContent>
                  {/* Doctor Header */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      src={doctor.profile_picture_url}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {doctor.user?.first_name?.charAt(0)}
                    </Avatar>
                    
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="bold">
                        Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {doctor.specialization_name || 'General Physician'}
                      </Typography>
                      
                      {doctor.is_verified && (
                        <Chip
                          icon={<Verified />}
                          label="Verified"
                          size="small"
                          color="success"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Rating */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Rating
                      value={doctor.rating || 0}
                      readOnly
                      size="small"
                      precision={0.1}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({doctor.reviews_count || 0} reviews)
                    </Typography>
                  </Box>

                  {/* Experience and Fee */}
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Experience:</strong> {doctor.years_of_experience || 0} years
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Consultation Fee:</strong> ₹{doctor.consultation_fee || 500}
                    </Typography>
                  </Box>

                  {/* Availability */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {doctor.consultation_hours_display || 'Available'}
                    </Typography>
                  </Box>

                  {/* Location */}
                  {doctor.address && (
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ ml: 1 }} noWrap>
                        {doctor.address}
                      </Typography>
                    </Box>
                  )}

                  {/* Select Button */}
                  <Button
                    fullWidth
                    variant={selectedDoctor?.id === doctor.id ? "contained" : "outlined"}
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {selectedDoctor?.id === doctor.id ? 'Selected' : 'Select Doctor'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DoctorSelection;