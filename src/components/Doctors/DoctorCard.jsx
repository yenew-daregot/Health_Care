import React from 'react';
import { 
  Card, 
  CardContent, 
  Avatar, 
  Typography, 
  Button, 
  Chip, 
  Stack, 
  Box,
  Rating,
  CardActions
} from '@mui/material';
import { 
  Verified, 
  Star, 
  LocationOn, 
  Schedule, 
  Paid,
  AccessTime,
  MedicalServices
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

//hover effects like in AvailableDoctorsList
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const DoctorCard = ({ 
  doctor, 
  onBookAppointment, 
  onViewProfile, 
  compact = false,
  showDetails = true 
}) => {
  const navigate = useNavigate();

  // Default handlers if not provided
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

  if (compact) {
    return (
      <StyledCard>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              src={doctor.user?.profile_picture}
              sx={{ width: 60, height: 60 }}
            >
              {doctor.user?.first_name?.[0]}{doctor.user?.last_name?.[0]}
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                </Typography>
                {doctor.is_verified && (
                  <Chip
                    icon={<Verified />}
                    label="Verified"
                    color="success"
                    size="small"
                  />
                )}
              </Stack>
              <Typography color="primary" variant="body2">
                {doctor.specialization?.name || 'General Physician'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {doctor.years_of_experience || 0}+ years exp.
              </Typography>
            </Box>
          </Stack>
          
          <CardActions sx={{ pt: 2, pb: 0, px: 0 }}>
            <Button 
              fullWidth
              variant="outlined" 
              size="small"
              onClick={() => handleViewProfile(doctor.id)}
            >
              Profile
            </Button>
            <Button 
              fullWidth
              variant="contained" 
              size="small"
              onClick={() => handleBookAppointment(doctor.id)}
            >
              Book Now
            </Button>
          </CardActions>
        </CardContent>
      </StyledCard>
    );
  }
  // Full version with details
  return (
    <StyledCard>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Doctor Header */}
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar
            src={doctor.user?.profile_picture}
            sx={{ width: 70, height: 70 }}
          >
            {doctor.user?.first_name?.[0]}{doctor.user?.last_name?.[0]}
          </Avatar>
          
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography variant="h6" fontWeight="bold">
                Dr. {doctor.user?.first_name} {doctor.user?.last_name}
              </Typography>
              {doctor.is_verified && (
                <Chip
                  icon={<Verified />}
                  label="Verified"
                  color="success"
                  size="small"
                />
              )}
            </Stack>
            
            <Typography variant="body1" color="primary" fontWeight="medium">
              {doctor.specialization?.name || 'General Physician'}
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center" mt={1}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Star fontSize="small" color="warning" />
                <Typography variant="body2">
                  <strong>{doctor.rating || '4.5'}</strong>
                  <Typography variant="caption" color="text.secondary" ml={0.5}>
                    ({doctor.reviews_count || 0} reviews)
                  </Typography>
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">
                  {doctor.years_of_experience || 0}+ years
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        {/* Additional Details if showDetails is true */}
        {showDetails && (
          <>
            {/* Consultation Fee */}
            <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Paid fontSize="small" color="success" />
                  <Typography variant="body2">Consultation Fee:</Typography>
                </Stack>
                <Typography variant="h6" color="success.main">
                  ₹{doctor.consultation_fee || 500}
                </Typography>
              </Stack>
            </Box>

            {/* Clinic Info */}
            <Stack spacing={1} mb={2}>
              {doctor.address && (
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <LocationOn fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Typography variant="body2" noWrap>
                    {doctor.address}
                  </Typography>
                </Stack>
              )}
              
              {doctor.consultation_hours && (
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Schedule fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Typography variant="body2">
                    {Object.keys(doctor.consultation_hours).length > 0 ? 
                      `${Object.keys(doctor.consultation_hours)[0]}, 9AM-6PM` : 
                      'Mon-Fri, 9AM-6PM'}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* License Number */}
            {doctor.license_number && (
              <Typography variant="caption" color="text.secondary">
                License: {doctor.license_number}
              </Typography>
            )}
          </>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleViewProfile(doctor.id)}
          size="small"
        >
          View Profile
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={() => handleBookAppointment(doctor.id)}
          size="small"
        >
          Book Appointment
        </Button>
      </CardActions>
    </StyledCard>
  );
};

// Default props
DoctorCard.defaultProps = {
  onBookAppointment: null,
  onViewProfile: null,
  compact: false,
  showDetails: true
};

export default DoctorCard;