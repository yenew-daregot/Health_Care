import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  LocalHospital,
  Phone,
  Navigation,
  AccessTime,
  LocationOn,
  ExpandMore,
  ExpandLess,
  DirectionsCar,
  Warning,
  CheckCircle,
  Info,
  Star,
  Bed,
  Emergency
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import googleMapsService from '../../services/googleMapsService';

const HospitalCard = styled(Card)(({ theme, recommended }) => ({
  transition: 'all 0.3s ease',
  border: recommended ? `2px solid ${theme.palette.success.main}` : `1px solid ${theme.palette.divider}`,
  boxShadow: recommended ? theme.shadows[4] : theme.shadows[1],
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 'bold',
  ...(status === 'available' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(status === 'limited' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(status === 'unavailable' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  })
}));

const EnhancedHospitalCard = ({ hospital, onNavigate, onCall, currentLocation }) => {
  const [expanded, setExpanded] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleGetDirections = async () => {
    if (!currentLocation || !hospital.location) return;

    setRouteLoading(true);
    try {
      const route = await googleMapsService.calculateRoute(
        currentLocation,
        hospital.location,
        {
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'BEST_GUESS'
          }
        }
      );
      setRouteInfo(route);
    } catch (error) {
      console.error('Failed to get route:', error);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleNavigate = () => {
    if (hospital.route_info?.navigation_url) {
      window.open(hospital.route_info.navigation_url, '_blank');
    } else if (hospital.location) {
      const url = googleMapsService.generateNavigationURL(hospital.location, currentLocation);
      window.open(url, '_blank');
    }
    if (onNavigate) onNavigate(hospital);
  };

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
    if (onCall) onCall(hospital, phoneNumber);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle color="success" />;
      case 'limited':
        return <Warning color="warning" />;
      case 'unavailable':
        return <Emergency color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const formatWaitTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <HospitalCard recommended={hospital.emergency_info?.recommended}>
      <CardContent>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <LocalHospital color="primary" />
              <Typography variant="h6" fontWeight="bold">
                {hospital.name}
              </Typography>
              {hospital.emergency_info?.recommended && (
                <Chip 
                  label="RECOMMENDED" 
                  color="success" 
                  size="small" 
                  variant="filled"
                />
              )}
            </Stack>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {hospital.address}
            </Typography>

            {hospital.rating && (
              <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                <Typography variant="body2">
                  {hospital.rating} rating
                </Typography>
              </Stack>
            )}
          </Box>

          <StatusChip 
            label={hospital.emergency_info?.status || 'available'}
            status={hospital.emergency_info?.status || 'available'}
            icon={getStatusIcon(hospital.emergency_info?.status)}
            size="small"
          />
        </Stack>

        {/* Key Information */}
        <Stack spacing={1} mb={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <DirectionsCar fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight="medium">
                {hospital.distance?.text || 'Distance unknown'}
              </Typography>
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTime fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight="medium">
                {hospital.travel_time?.text || hospital.estimated_travel_time?.text || 'ETA unknown'}
              </Typography>
            </Stack>
          </Stack>

          {hospital.arrival_time && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Arrival: {hospital.arrival_time.text}
              </Typography>
            </Stack>
          )}

          {hospital.current_wait_time > 0 && (
            <Alert severity="info" sx={{ py: 0.5 }}>
              <Typography variant="body2">
                Current wait time: {formatWaitTime(hospital.current_wait_time)}
              </Typography>
            </Alert>
          )}

          {hospital.is_on_diversion && (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              <Typography variant="body2">
                Emergency department on diversion
              </Typography>
            </Alert>
          )}
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Navigation />}
            onClick={handleNavigate}
            size="small"
            fullWidth
          >
            Navigate
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Phone />}
            onClick={() => handleCall(hospital.emergency_phone || hospital.phone_number)}
            size="small"
            fullWidth
          >
            Call
          </Button>
          
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
            sx={{ minWidth: 'auto' }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>

        {/* Route Information */}
        {routeLoading && (
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>Getting route information...</Typography>
            <LinearProgress />
          </Box>
        )}

        {routeInfo && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Route:</strong> {routeInfo.distance.text} • {routeInfo.durationInTraffic?.text || routeInfo.duration.text}
              {routeInfo.durationInTraffic && (
                <span> (with traffic)</span>
              )}
            </Typography>
          </Alert>
        )}

        {/* Expandable Details */}
        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            {/* Hospital Capabilities */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Capabilities
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {hospital.has_emergency_department && (
                  <Chip label="Emergency Dept" size="small" variant="outlined" />
                )}
                {hospital.has_trauma_center && (
                  <Chip 
                    label={`Trauma ${hospital.trauma_level || 'Center'}`} 
                    size="small" 
                    variant="outlined" 
                    color="error"
                  />
                )}
                {hospital.hospital_type && (
                  <Chip 
                    label={hospital.hospital_type.replace('_', ' ')} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Box>

            {/* Capacity Information */}
            {(hospital.bed_capacity || hospital.icu_beds) && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Capacity
                </Typography>
                <Stack direction="row" spacing={2}>
                  {hospital.bed_capacity && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Bed fontSize="small" />
                      <Typography variant="body2">
                        {hospital.bed_capacity} beds
                      </Typography>
                    </Stack>
                  )}
                  {hospital.icu_beds && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Emergency fontSize="small" />
                      <Typography variant="body2">
                        {hospital.icu_beds} ICU
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}

            {/* Contact Information */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contact
              </Typography>
              <Stack spacing={0.5}>
                {hospital.phone_number && (
                  <Typography variant="body2">
                    Main: {hospital.phone_number}
                  </Typography>
                )}
                {hospital.emergency_phone && hospital.emergency_phone !== hospital.phone_number && (
                  <Typography variant="body2">
                    Emergency: {hospital.emergency_phone}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Route Details */}
            {hospital.travel_time?.with_traffic && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Travel Time
                </Typography>
                <Typography variant="body2">
                  With traffic: {hospital.travel_time.with_traffic}
                </Typography>
              </Box>
            )}

            {/* Additional Actions */}
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleGetDirections}
                disabled={routeLoading || !currentLocation}
                startIcon={<DirectionsCar />}
              >
                Get Route
              </Button>
              
              {hospital.route_info?.share_url && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: hospital.name,
                        text: `${hospital.name} - ${hospital.address}`,
                        url: hospital.route_info.share_url
                      });
                    } else {
                      navigator.clipboard.writeText(hospital.route_info.share_url);
                    }
                  }}
                >
                  Share
                </Button>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </CardContent>
    </HospitalCard>
  );
};

export default EnhancedHospitalCard;