import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Avatar,
  Chip,
  Rating,
  Divider,
  Stack,
  Paper,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  Phone,
  Email,
  LocationOn,
  Schedule,
  Star,
  Verified,
  MedicalServices,
  AccessTime,
  Paid,
  School,
  Work,
  CalendarToday,
  Person,
  EventAvailable,
  Reviews,
  Share,
  Bookmark,
  BookmarkBorder,
  Chat,
  VideoCall,
  Language,
  LocalHospital,
  Assignment,
  Security
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import appointmentsApi from '../../api/appointmentsApi';
import doctorsApi from '../../api/doctorsApi';
import chatApi from '../../api/chatApi';
import patientsApi from '../../api/patientsApi';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));
//patient's view of doctor profile with a different name
const PatientDoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctorStats, setDoctorStats] = useState({
    totalAppointments: 0,
    patientSatisfaction: 0
  });
  const [patientProfile, setPatientProfile] = useState(null);

  useEffect(() => {
    fetchDoctorDetails();
    fetchAvailableSlots();
    fetchDoctorStats();
    fetchPatientProfile();
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching doctor details for ID:', doctorId);
      const response = await doctorsApi.getDoctor(doctorId);
      console.log('Doctor details response:', response.data);
      
      if (!response.data) {
        throw new Error('Doctor not found');
      }
      
      // Process doctor data
      const doctorData = response.data;
      setDoctor(doctorData);
      
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to load doctor profile';
      if (error.response?.status === 404) {
        errorMessage = 'Doctor not found';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      console.log('Fetching slots for doctor:', doctorId, 'date:', dateStr);
      const response = await appointmentsApi.getAvailableSlots(doctorId, dateStr);
      console.log('Slots response:', response.data);
      
      let slots = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          slots = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          slots = response.data.results;
        } else if (response.data.available_slots && Array.isArray(response.data.available_slots)) {
          slots = response.data.available_slots;
        } else if (response.data.slots && Array.isArray(response.data.slots)) {
          slots = response.data.slots;
        }
      }
      
      // Get next 3 available slots
      const nextSlots = slots
        .filter(slot => slot.is_available !== false)
        .slice(0, 3)
        .map(slot => ({
          ...slot,
          time: slot.start_time || slot.time,
          duration: slot.duration || 30
        }));
      
      setAvailableSlots(nextSlots);
      
    } catch (error) {
      console.error('Error fetching slots:', error);
      console.error('Error response:', error.response?.data);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchDoctorStats = async () => {
    try {
      // This would be a custom endpoint you need to create
      // For now, use placeholder data
      setDoctorStats({
        totalAppointments: 1250,
        patientSatisfaction: 96
      });
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    }
  };

  const fetchPatientProfile = async () => {
    try {
      const response = await patientsApi.getProfile();
      setPatientProfile(response.data);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
    }
  };

  const handleBookAppointment = () => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  const handleVideoConsultation = () => {
    navigate(`/patient/video-consultation/${doctorId}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked);
      // TODO: Implement bookmark API call
      console.log(`${isBookmarked ? 'Removing' : 'Adding'} bookmark for doctor ${doctorId}`);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setIsBookmarked(!isBookmarked); // Revert on error
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      const doctorName = getDoctorName();
      navigator.share({
        title: doctorName,
        text: `Check out ${doctorName}'s profile on MediConnect`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleChatWithDoctor = async () => {
    try {
      if (!patientProfile) {
        alert('Please complete your patient profile first to chat with doctors.');
        return;
      }

      console.log('Starting chat with doctor:', doctorId, 'patient:', patientProfile.id);
      
      // Find or create chat room
      const response = await chatApi.findOrCreateChatRoom({
        patient_id: patientProfile.id,
        doctor_id: doctorId,
        room_type: 'consultation'
      });

      if (response.data) {
        console.log('Chat room created/found:', response.data);
        // Navigate to messages page with the chat selected
        navigate('/patient/messages', { 
          state: { selectedChatId: response.data.id } 
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const handleContactClick = (type) => {
    if (type === 'phone' && doctor?.user?.phone_number) {
      window.location.href = `tel:${doctor.user.phone_number}`;
    } else if (type === 'email' && doctor?.user?.email) {
      window.location.href = `mailto:${doctor.user.email}`;
    }
  };
  const getDoctorName = () => {
    if (!doctor) return 'Doctor';
    return `Dr. ${doctor.full_name || 
      `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.trim()}`;
  };

  const getSpecializationName = () => {
    if (!doctor) return 'General Physician';
    return doctor.specialization?.name || doctor.specialization_name || 'General Physician';
  };

  const getProfilePicture = () => {
    if (!doctor) return '';
    return doctor.user?.profile_picture_url || 
           doctor.user?.profile_picture || 
           doctor.profile_picture_url || 
           doctor.profile_picture;
  };

  const getConsultationHours = () => {
    if (!doctor?.consultation_hours || typeof doctor.consultation_hours !== 'object') {
      return 'Mon-Fri: 9AM-6PM';
    }
    
    try {
      const hours = doctor.consultation_hours;
      const days = Object.keys(hours);
      if (days.length === 0) return 'Mon-Fri: 9AM-6PM';
      
      const firstDay = days[0];
      const dayDisplay = firstDay.charAt(0).toUpperCase() + firstDay.slice(1);
      return `${dayDisplay}: ${hours[firstDay] || '9AM-6PM'}`;
    } catch {
      return 'Mon-Fri: 9AM-6PM';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Loading doctor profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !doctor) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Doctor not found'}
        </Alert>
        
        <Button
          variant="contained"
          onClick={() => navigate('/patient/doctors')}
        >
          Browse Doctors
        </Button>
      </Container>
    );
  }

  const doctorName = getDoctorName();
  const specialization = getSpecializationName();
  const profilePicture = getProfilePicture();
  const consultationHours = getConsultationHours();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Doctor Header */}
      <ProfileSection>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box display="flex" justifyContent="center">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  doctor.is_verified ? (
                    <Chip
                      icon={<Verified />}
                      label="Verified"
                      color="success"
                      size="small"
                      sx={{ height: 24 }}
                    />
                  ) : null
                }
              >
                <Avatar
                  src={profilePicture}
                  sx={{ 
                    width: 200, 
                    height: 200,
                    fontSize: '3rem',
                    border: '4px solid',
                    borderColor: 'primary.main',
                    bgcolor: profilePicture ? 'transparent' : 'primary.main'
                  }}
                  alt={doctorName}
                >
                  {doctor.user?.first_name?.[0]}{doctor.user?.last_name?.[0] || doctor.full_name?.[0]}
                </Avatar>
              </Badge>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h4" fontWeight="bold">
                {doctorName}
              </Typography>
              
              <Typography variant="h5" color="primary">
                {specialization}
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Rating 
                  value={parseFloat(doctor.rating) || 0} 
                  readOnly 
                  precision={0.1} 
                  size="large" 
                />
                <Typography variant="body1">
                  <strong>{doctor.rating ? parseFloat(doctor.rating).toFixed(1) : '4.5'}</strong> 
                  ({doctor.reviews_count || 0} reviews)
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTime color="action" />
                  <Typography>{doctor.years_of_experience || '10+'}+ years experience</Typography>
                </Stack>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Paid color="success" />
                  <Typography fontWeight="bold" color="success.main">
                    ₹{doctor.consultation_fee?.toLocaleString('en-IN') || 500} consultation fee
                  </Typography>
                </Stack>
              </Stack>
              
              {/* Doctor stats */}
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<LocalHospital />}
                  label={`${doctorStats.totalAppointments.toLocaleString()}+ Consultations`}
                  variant="outlined"
                />
                <Chip
                  icon={<Security />}
                  label={`${doctorStats.patientSatisfaction}% Satisfaction`}
                  variant="outlined"
                  color="success"
                />
                {doctor.license_number && (
                  <Chip
                    icon={<Assignment />}
                    label={`License: ${doctor.license_number}`}
                    variant="outlined"
                    color="info"
                  />
                )}
              </Stack>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleBookAppointment}
                startIcon={<CalendarToday />}
                disabled={!doctor.is_available}
              >
                {doctor.is_available ? 'Book Appointment' : 'Currently Unavailable'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleVideoConsultation}
                startIcon={<VideoCall />}
              >
                Video Consultation
              </Button>
              
              <Stack direction="row" spacing={1} justifyContent="center">
                <IconButton 
                  onClick={toggleBookmark} 
                  color={isBookmarked ? "primary" : "default"}
                  title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
                <IconButton 
                  onClick={handleShare} 
                  color="primary"
                  title="Share profile"
                >
                  <Share />
                </IconButton>
                <IconButton 
                  onClick={handleChatWithDoctor} 
                  color="primary"
                  title="Send message"
                >
                  <Chat />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </ProfileSection>

      {/* Quick Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <Phone color="primary" fontSize="large" />
                <Typography variant="body1" fontWeight="medium">
                  Contact
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {doctor.user?.phone_number || doctor.phone_number || 'Not available'}
                </Typography>
                {doctor.user?.phone_number && (
                  <Button 
                    size="small" 
                    onClick={() => handleContactClick('phone')}
                  >
                    Call Now
                  </Button>
                )}
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <Email color="primary" fontSize="large" />
                <Typography variant="body1" fontWeight="medium">
                  Email
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {doctor.user?.email || doctor.email || 'Not available'}
                </Typography>
                {doctor.user?.email && (
                  <Button 
                    size="small" 
                    onClick={() => handleContactClick('email')}
                  >
                    Send Email
                  </Button>
                )}
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <LocationOn color="primary" fontSize="large" />
                <Typography variant="body1" fontWeight="medium">
                  Address
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {doctor.address || 'Address not specified'}
                </Typography>
                {doctor.address && (
                  <Button 
                    size="small"
                    onClick={() => {
                      const address = encodeURIComponent(doctor.address);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                    }}
                  >
                    View on Map
                  </Button>
                )}
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <Schedule color="primary" fontSize="large" />
                <Typography variant="body1" fontWeight="medium">
                  Consultation Hours
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {consultationHours}
                </Typography>
              </Stack>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Rest of the component remains similar but with data from the corrected doctor object */}
      {/* Tabs Section */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<Person />} iconPosition="start" />
          <Tab label="Qualifications" icon={<School />} iconPosition="start" />
          <Tab label="Availability" icon={<EventAvailable />} iconPosition="start" />
          <Tab label="Reviews" icon={<Reviews />} iconPosition="start" />
        </Tabs>
        
        {/* Tab content - Updated to use correct data properties */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Stack spacing={3}>
              {/* About Section */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  About
                </Typography>
                <Typography variant="body1" paragraph>
                  {doctor.bio || `${doctorName} is a highly experienced ${specialization} with ${doctor.years_of_experience || '10+'} years of practice. Specializing in comprehensive patient care with a focus on preventive medicine and evidence-based treatments.`}
                </Typography>
              </Box>
              
              <Divider />
              
              {/* Specializations */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Specializations & Services
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={specialization} color="primary" />
                  <Chip label="General Consultation" />
                  <Chip label="Follow-up Care" />
                  <Chip label="Health Checkup" />
                  <Chip label="Chronic Disease Management" />
                  <Chip label={`${specialization} Specialist`} color="secondary" />
                </Stack>
              </Box>
              
              <Divider />
              
              {/* Languages */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Languages Spoken
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label="English" />
                  <Chip label="Hindi" />
                  <Chip label="Local Language" />
                </Stack>
              </Box>
            </Stack>
          )}
          
          {tabValue === 1 && (
            <Stack spacing={3}>
              {/* Education & Qualifications */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Education & Qualifications
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={doctor.qualification || "Medical Degree"}
                      secondary={doctor.qualification ? "" : "University of Medical Sciences"}
                    />
                  </ListItem>
                  {doctor.license_number && (
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Medical License"
                        secondary={`License Number: ${doctor.license_number}`}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
              
              <Divider />
              
              {/* Experience */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Professional Experience
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${doctor.years_of_experience || '10+'}+ Years Experience`}
                      secondary="Practicing medicine"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MedicalServices color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Specialization"
                      secondary={specialization}
                    />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          )}
          
          {tabValue === 2 && (
            <Stack spacing={3}>
              {/* Available Slots */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Next Available Slots
                </Typography>
                {loadingSlots ? (
                  <CircularProgress />
                ) : availableSlots.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableSlots.map((slot, index) => (
                          <TableRow key={index}>
                            <TableCell>Today</TableCell>
                            <TableCell>{slot.time}</TableCell>
                            <TableCell>{slot.duration} mins</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={handleBookAppointment}
                              >
                                Book Now
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info">
                    No available slots at the moment. Please check back later or book for another day.
                  </Alert>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={handleBookAppointment}
                    startIcon={<CalendarToday />}
                  >
                    View Full Schedule & Book
                  </Button>
                </Box>
              </Box>
              
              <Divider />
              
              {/* Regular Schedule */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Regular Schedule
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {consultationHours}
                </Typography>
              </Box>
              
              <Divider />
              
              {/* Booking Info */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Booking Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Consultation Fee"
                      secondary={`₹${doctor.consultation_fee?.toLocaleString('en-IN') || 500}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Wait Time"
                      secondary="10-15 minutes"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Cancellation Policy"
                      secondary="Free cancellation up to 24 hours before appointment"
                    />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          )}
          
          {tabValue === 3 && (
            <Stack spacing={3}>
              {/* Rating Summary */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Patient Reviews
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Typography variant="h2" color="primary">
                      {doctor.rating ? parseFloat(doctor.rating).toFixed(1) : '4.5'}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Stack spacing={1}>
                      <Rating 
                        value={parseFloat(doctor.rating) || 0} 
                        readOnly 
                        precision={0.1} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        Based on {doctor.reviews_count || 0} reviews
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider />
              
              {/* Sample Reviews - In real app, fetch from API */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Reviews
                </Typography>
                {doctor.reviews_count > 0 ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((review) => (
                      <Card key={review} variant="outlined">
                        <CardContent>
                          <Stack spacing={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight="medium">
                                Anonymous Patient
                              </Typography>
                              <Rating value={4.5} readOnly size="small" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              2 weeks ago
                            </Typography>
                            <Typography variant="body1">
                              Dr. {doctor.user?.last_name || 'Doctor'} was very professional and took time to understand my concerns. The diagnosis was accurate and treatment effective.
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    No reviews yet. Be the first to review this doctor!
                  </Alert>
                )}
              </Box>
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => {/* Implement review functionality */}}
              >
                {doctor.reviews_count > 0 ? 'View All Reviews' : 'Write a Review'}
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>

      {/* CTA Section */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Ready to Book Your Appointment?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
          Get expert medical care from {doctorName}. Book your appointment now for in-clinic or video consultation.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            size="large"
            onClick={handleBookAppointment}
            startIcon={<CalendarToday />}
            disabled={!doctor.is_available}
          >
            {doctor.is_available ? 'Book Appointment Now' : 'Currently Unavailable'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/patient/doctors')}
          >
            Browse More Doctors
          </Button>
          <Button
            variant="text"
            size="large"
            onClick={() => navigate('/patient/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default PatientDoctorProfile;