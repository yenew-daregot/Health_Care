import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Fab,
  Tooltip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
  Badge,
  TextField
} from '@mui/material';
import {
  Emergency,
  Phone,
  Refresh,
  Warning,
  CheckCircle,
  LocalHospital,
  ContactPhone,
  MyLocation,
  Speed,
  Security,
  Info,
  Add,
  Edit,
  Delete,
  Call,
  Navigation,
  Map as MapIcon,
  DirectionsCar,
  AccessTime,
  LocationOn,
  ExpandMore,
  Visibility,
  VisibilityOff,
  Share,
  Route,
  Traffic,
  GpsFixed,
  GpsNotFixed,
  Satellite,
  Terrain,
  Layers,
  Fullscreen,
  FullscreenExit,
  Timeline,
  Update,
  NotificationImportant
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { blue, red, green, orange } from '@mui/material/colors';
import emergencyApi from '../../api/emergencyApi';
import googleMapsService from '../../services/googleMapsService';
import EnhancedHospitalCard from '../../components/Emergency/EnhancedHospitalCard';
import './EmergencySOS.css';

// Enhanced styled components with animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
  50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8); }
`;

const EmergencyButton = styled(Button)(({ theme, active }) => ({
  minHeight: 200,
  borderRadius: 20,
  fontSize: '1.5rem',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: theme.shadows[8],
  transition: 'all 0.3s ease',
  animation: !active ? `${pulse} 2s infinite` : `${glow} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[12],
  },
  '&:disabled': {
    animation: 'none',
  }
}));

const LocationCard = styled(Card)(({ theme, status }) => ({
  background: status === 'active' 
    ? `linear-gradient(135deg, ${green[50]} 0%, ${green[100]} 100%)`
    : status === 'error'
    ? `linear-gradient(135deg, ${red[50]} 0%, ${red[100]} 100%)`
    : `linear-gradient(135deg, ${blue[50]} 0%, ${blue[100]} 100%)`,
  border: `1px solid ${
    status === 'active' ? green[200] : 
    status === 'error' ? red[200] : blue[200]
  }`,
}));

const MapContainer = styled(Box)(({ theme }) => ({
  height: 400,
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  position: 'relative',
  border: `1px solid ${theme.palette.divider}`,
  '& .gm-style': {
    borderRadius: theme.shape.borderRadius,
  }
}));

const MapControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const RouteCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${orange[50]} 0%, ${orange[100]} 100%)`,
  border: `1px solid ${orange[200]}`,
}));

const ContactCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const EmergencySOS = () => {
  // State management
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [manualLocationDialog, setManualLocationDialog] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [hospitalsWithRoutes, setHospitalsWithRoutes] = useState([]);
  const [emergencyTimer, setEmergencyTimer] = useState(0);
  const [emergencyGuide, setEmergencyGuide] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Google Maps integration state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapVisible, setMapVisible] = useState(true);
  const [mapType, setMapType] = useState('roadmap');
  const [trafficLayer, setTrafficLayer] = useState(true);
  const [routeVisible, setRouteVisible] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [autoRefreshLocation, setAutoRefreshLocation] = useState(true);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const locationWatchId = useRef(null);
  const refreshIntervalId = useRef(null);

  // Load data on component mount
  useEffect(() => {
    console.log('🔍 Enhanced EmergencySOS component mounted');
    
    loadEmergencyContacts();
    loadEmergencyGuide();
    getCurrentLocation();
    checkActiveEmergency();
    initializeGoogleMaps();
    
    return () => {
      // Cleanup
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
      if (refreshIntervalId.current) {
        clearInterval(refreshIntervalId.current);
      }
    };
  }, []);

  // Emergency timer effect
  useEffect(() => {
    let interval;
    if (isEmergencyActive) {
      interval = setInterval(() => {
        setEmergencyTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEmergencyActive]);

  // Auto-refresh location effect
  useEffect(() => {
    if (autoRefreshLocation && currentLocation) {
      refreshIntervalId.current = setInterval(() => {
        getCurrentLocation(false); // Silent refresh
      }, 30000); // Every 30 seconds
      
      return () => {
        if (refreshIntervalId.current) {
          clearInterval(refreshIntervalId.current);
        }
      };
    }
  }, [autoRefreshLocation, currentLocation]);

  // Initialize Google Maps
  const initializeGoogleMaps = async () => {
    try {
      const initialized = await googleMapsService.initialize();
      if (initialized) {
        setMapLoaded(true);
        console.log('✅ Google Maps initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error);
      showSnackbar('Google Maps failed to load. Some features may be limited.', 'warning');
    }
  };

  // Load emergency contacts
  const loadEmergencyContacts = async () => {
    try {
      console.log('📞 Loading emergency contacts...');
      const response = await emergencyApi.getContacts();
      console.log('✅ Emergency contacts response:', response.data);
      setEmergencyContacts(response.data?.results || response.data || []);
    } catch (error) {
      console.error('❌ Failed to load emergency contacts:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      showSnackbar('Failed to load emergency contacts', 'error');
    }
  };

  // Load emergency guide
  const loadEmergencyGuide = async () => {
    try {
      const response = await emergencyApi.getEmergencyGuide();
      setEmergencyGuide(response.data);
    } catch (error) {
      console.error('Failed to load emergency guide:', error);
    }
  };

  // Check for active emergency
  const checkActiveEmergency = async () => {
    try {
      const response = await emergencyApi.getActiveEmergencies();
      const activeEmergencies = response.data?.results || response.data || [];
      if (activeEmergencies.length > 0) {
        setActiveEmergency(activeEmergencies[0]);
        setIsEmergencyActive(true);
      }
    } catch (error) {
      console.error('Failed to check active emergencies:', error);
    }
  };

  // Enhanced location tracking with continuous monitoring
  const getCurrentLocation = useCallback(async (showNotification = true) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    if (showNotification) {
      setLocationLoading(true);
      setLocationError(null);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000 // 30 seconds cache
    };

    const handleSuccess = async (position) => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date().toISOString()
      };
      
      setCurrentLocation(location);
      setLocationAccuracy(position.coords.accuracy);
      setLocationLoading(false);
      
      if (showNotification) {
        showSnackbar(`Location updated (±${Math.round(position.coords.accuracy)}m accuracy)`, 'success');
      }
      
      // Update map if loaded
      if (mapInstance && mapLoaded) {
        updateMapLocation(location);
      }
      
      // Load nearby hospitals with enhanced route information
      await loadNearbyHospitalsWithRoutes(location);
    };

    const handleError = (error) => {
      let errorMessage = 'Unable to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred while getting location.';
          break;
      }
      
      setLocationLoading(false);
      setLocationError(errorMessage);
      if (showNotification) {
        showSnackbar(errorMessage, 'warning');
      }
    };

    // Start continuous location monitoring
    if (autoRefreshLocation && !locationWatchId.current) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }
  }, [mapInstance, mapLoaded, autoRefreshLocation]);

  // Load nearby hospitals with enhanced route information
  const loadNearbyHospitalsWithRoutes = async (location) => {
    if (!mapLoaded) {
      // Fallback to basic hospital loading
      try {
        const response = await emergencyApi.getNearbyHospitals(
          location.latitude, 
          location.longitude
        );
        setNearbyHospitals(response.data?.results || response.data || []);
      } catch (error) {
        console.error('Failed to load nearby hospitals:', error);
      }
      return;
    }

    try {
      setRouteLoading(true);
      const hospitalsWithRoutes = await googleMapsService.findNearestHospitalsWithRoutes(
        { lat: location.latitude, lng: location.longitude },
        15000 // 15km radius
      );
      
      // Enhance hospital data with emergency-specific information
      const enhancedHospitals = hospitalsWithRoutes.map(hospital => ({
        ...hospital,
        emergency_info: {
          recommended: hospital.eta && hospital.route ? 
            (hospital.route.durationInTraffic?.value || hospital.route.duration.value) < 900 : false, // < 15 minutes
          status: hospital.isOpen ? 'available' : 'limited',
          wait_time: Math.floor(Math.random() * 60) + 15, // Mock wait time
        },
        travel_time: hospital.route ? {
          text: hospital.route.durationInTraffic?.text || hospital.route.duration.text,
          value: hospital.route.durationInTraffic?.value || hospital.route.duration.value,
          with_traffic: hospital.route.durationInTraffic?.text
        } : null,
        arrival_time: hospital.route ? {
          text: googleMapsService.calculateArrivalTime(
            hospital.route.durationInTraffic?.value || hospital.route.duration.value
          )
        } : null,
        route_info: hospital.route ? {
          navigation_url: googleMapsService.generateNavigationURL(hospital.location, location),
          share_url: googleMapsService.generateNavigationURL(hospital.location, location)
        } : null
      }));
      
      setHospitalsWithRoutes(enhancedHospitals);
      setNearbyHospitals(enhancedHospitals);
      
      // Update map with hospital markers
      if (mapInstance) {
        updateMapWithHospitals(enhancedHospitals);
      }
      
    } catch (error) {
      console.error('Failed to load hospitals with routes:', error);
      showSnackbar('Failed to load hospital route information', 'warning');
    } finally {
      setRouteLoading(false);
    }
  };

  // Update map location and center
  const updateMapLocation = (location) => {
    if (!mapInstance) return;
    
    const position = new window.google.maps.LatLng(location.latitude, location.longitude);
    mapInstance.setCenter(position);
    
    // Add/update user location marker
    if (window.userLocationMarker) {
      window.userLocationMarker.setPosition(position);
    } else {
      window.userLocationMarker = new window.google.maps.Marker({
        position: position,
        map: mapInstance,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      });
    }
    
    // Add accuracy circle
    if (window.accuracyCircle) {
      window.accuracyCircle.setMap(null);
    }
    
    window.accuracyCircle = new window.google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#4285F4',
      fillOpacity: 0.15,
      map: mapInstance,
      center: position,
      radius: location.accuracy
    });
  };

  // Update map with hospital markers
  const updateMapWithHospitals = (hospitals) => {
    if (!mapInstance) return;
    
    // Clear existing hospital markers
    if (window.hospitalMarkers) {
      window.hospitalMarkers.forEach(marker => marker.setMap(null));
    }
    window.hospitalMarkers = [];
    
    hospitals.forEach((hospital, index) => {
      const marker = new window.google.maps.Marker({
        position: hospital.location,
        map: mapInstance,
        title: hospital.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#EA4335"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
              <path d="M12 10V14M10 12H14" stroke="#EA4335" stroke-width="1"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });
      
      // Add click listener for hospital selection
      marker.addListener('click', () => {
        setSelectedHospital(hospital);
        showHospitalRoute(hospital);
      });
      
      window.hospitalMarkers.push(marker);
    });
  };

  // Show route to selected hospital
  const showHospitalRoute = async (hospital) => {
    if (!currentLocation || !hospital.location || !mapInstance) return;
    
    setRouteLoading(true);
    try {
      const route = await googleMapsService.calculateRoute(
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        hospital.location,
        {
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'BEST_GUESS'
          }
        }
      );
      
      setRouteInfo(route);
      
      // Display route on map
      if (window.directionsRenderer) {
        window.directionsRenderer.setMap(null);
      }
      
      window.directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
      
      window.directionsRenderer.setMap(mapInstance);
      
      // Create directions request
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route({
        origin: { lat: currentLocation.latitude, lng: currentLocation.longitude },
        destination: hospital.location,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS
        }
      }, (result, status) => {
        if (status === 'OK') {
          window.directionsRenderer.setDirections(result);
        }
      });
      
    } catch (error) {
      console.error('Failed to show route:', error);
      showSnackbar('Failed to calculate route', 'error');
    } finally {
      setRouteLoading(false);
    }
  };

  // Initialize map when container is ready
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: currentLocation ? 
          { lat: currentLocation.latitude, lng: currentLocation.longitude } :
          { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        mapTypeId: mapType,
        styles: [
          {
            featureType: 'poi.medical',
            elementType: 'geometry',
            stylers: [{ color: '#ffeaa7' }]
          },
          {
            featureType: 'poi.medical',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d63031' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
      });
      
      // Add traffic layer
      const trafficLayerInstance = new window.google.maps.TrafficLayer();
      if (trafficLayer) {
        trafficLayerInstance.setMap(map);
      }
      window.trafficLayerInstance = trafficLayerInstance;
      
      setMapInstance(map);
      
      if (currentLocation) {
        updateMapLocation(currentLocation);
      }
    }
  }, [mapLoaded, mapRef.current, currentLocation, mapType, trafficLayer]);

  // Handle emergency alert with enhanced location data
  const handleEmergencyAlert = async () => {
    setConfirmDialog({ open: false, type: null });
    setLoading(true);

    try {
      // Get the most accurate location data
      let locationData = currentLocation;
      if (!locationData) {
        // Try to get location one more time
        await getCurrentLocation();
        locationData = currentLocation;
      }

      const emergencyData = {
        emergency_type: 'medical',
        priority: 'critical',
        description: 'Emergency assistance needed - SOS alert triggered with enhanced location data',
        location: locationData ? (
          locationData.manual ? locationData.address : 'GPS location with high accuracy'
        ) : 'Location unavailable',
        latitude: locationData && !locationData.manual ? locationData.latitude : null,
        longitude: locationData && !locationData.manual ? locationData.longitude : null,
        location_notes: locationData ? (
          locationData.manual ? 'Manual location entry' : 
          `GPS accuracy: ±${Math.round(locationData.accuracy)}m, Speed: ${locationData.speed || 0}m/s, Heading: ${locationData.heading || 'N/A'}°`
        ) : 'Location services unavailable',
        medical_notes: 'Emergency SOS with enhanced location tracking - requires immediate assessment',
        // Enhanced location metadata
        location_metadata: locationData ? {
          accuracy: locationData.accuracy,
          altitude: locationData.altitude,
          altitudeAccuracy: locationData.altitudeAccuracy,
          heading: locationData.heading,
          speed: locationData.speed,
          timestamp: locationData.timestamp,
          source: locationData.manual ? 'manual' : 'gps'
        } : null,
        // Nearby hospitals for responder reference
        nearby_hospitals: nearbyHospitals.slice(0, 3).map(hospital => ({
          name: hospital.name,
          address: hospital.address,
          distance: hospital.distance?.text,
          eta: hospital.eta,
          phone: hospital.phone_number || hospital.emergency_phone
        }))
      };

      console.log('🚨 Sending enhanced emergency data:', emergencyData);
      const response = await emergencyApi.createEmergency(emergencyData);
      
      setActiveEmergency(response.data);
      setIsEmergencyActive(true);
      setEmergencyTimer(0);
      
      showSnackbar('🚨 Emergency alert sent with enhanced location data! Help is on the way.', 'success');
      
      // Send SOS alert as well
      try {
        await emergencyApi.sendSOSAlert({
          emergency_id: response.data.id,
          location: locationData,
          message: 'SOS - Emergency assistance needed with precise location',
          nearby_hospitals: nearbyHospitals.slice(0, 3)
        });
      } catch (sosError) {
        console.error('⚠️ SOS alert failed:', sosError);
      }
      
    } catch (error) {
      console.error('❌ Emergency alert failed:', error);
      
      let errorMessage = 'Failed to send emergency alert. Please try again or call emergency services directly.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please ensure you have a patient profile.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle quick SOS
  const handleQuickSOS = async () => {
    setConfirmDialog({ open: false, type: null });
    setLoading(true);

    try {
      console.log('🚨 Sending Quick SOS...');
      const response = await emergencyApi.sendQuickSOS();
      console.log('✅ Quick SOS response:', response.data);
      
      setIsEmergencyActive(true);
      setEmergencyTimer(0);
      showSnackbar('🚨 Quick SOS sent! Help is on the way.', 'success');
    } catch (error) {
      console.error('❌ Quick SOS failed:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Failed to send Quick SOS. Please try the full emergency alert.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please ensure you have a patient profile.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Format timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle map type
  const toggleMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextType = types[(currentIndex + 1) % types.length];
    setMapType(nextType);
    
    if (mapInstance) {
      mapInstance.setMapTypeId(nextType);
    }
  };

  // Toggle traffic layer
  const toggleTrafficLayer = () => {
    setTrafficLayer(!trafficLayer);
    
    if (window.trafficLayerInstance) {
      window.trafficLayerInstance.setMap(trafficLayer ? null : mapInstance);
    }
  };

  // Predefined emergency contacts
  const predefinedContacts = [
    { 
      id: 'emergency', 
      name: 'Emergency Services', 
      phone_number: '911', 
      type: 'Emergency',
      description: 'Police, Fire, Medical Emergency'
    },
    { 
      id: 'poison', 
      name: 'Poison Control', 
      phone_number: '1-800-222-1222', 
      type: 'Emergency',
      description: 'Poison Control Center'
    },
    { 
      id: 'crisis', 
      name: 'Crisis Hotline', 
      phone_number: '988', 
      type: 'Support',
      description: 'Mental Health Crisis Support'
    },
  ];

  const allContacts = [...emergencyContacts, ...predefinedContacts];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="error.main" gutterBottom>
          <Emergency sx={{ fontSize: 'inherit', mr: 2 }} />
          Enhanced Emergency SOS
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Advanced emergency response with Google Maps integration
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
          <Chip 
            icon={mapLoaded ? <CheckCircle /> : <Warning />}
            label={mapLoaded ? 'Maps Ready' : 'Maps Loading'}
            color={mapLoaded ? 'success' : 'warning'}
            size="small"
          />
          <Chip 
            icon={currentLocation ? <GpsFixed /> : <GpsNotFixed />}
            label={currentLocation ? `GPS Active (±${Math.round(locationAccuracy || 0)}m)` : 'GPS Inactive'}
            color={currentLocation ? 'success' : 'error'}
            size="small"
          />
          <Chip 
            icon={<LocalHospital />}
            label={`${nearbyHospitals.length} Hospitals Found`}
            color="info"
            size="small"
          />
        </Stack>
      </Box>

      {/* Emergency Status Banner */}
      {isEmergencyActive && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, fontSize: '1.1rem' }}
          icon={<CheckCircle fontSize="large" />}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" component="div">
                🚨 Emergency Active - Help is on the way!
              </Typography>
              <Typography variant="body2">
                Emergency responders have been notified • Time elapsed: {formatTimer(emergencyTimer)}
              </Typography>
            </Box>
            {activeEmergency && (
              <Chip 
                label={`ID: ${activeEmergency.request_id || activeEmergency.id}`}
                color="success"
                variant="outlined"
              />
            )}
          </Stack>
        </Alert>
      )}

      {/* Main Emergency Buttons */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <EmergencyButton
            fullWidth
            variant="contained"
            color="error"
            size="large"
            onClick={() => setConfirmDialog({ open: true, type: 'emergency' })}
            disabled={loading}
            active={isEmergencyActive}
            startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <Emergency />}
          >
            {loading ? 'SENDING ALERT...' : isEmergencyActive ? '✅ HELP COMING' : '🚨 EMERGENCY SOS'}
          </EmergencyButton>
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Enhanced alert with precise GPS location and nearby hospitals
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <EmergencyButton
            fullWidth
            variant="contained"
            color="warning"
            size="large"
            onClick={() => setConfirmDialog({ open: true, type: 'quick' })}
            disabled={loading || isEmergencyActive}
            sx={{ minHeight: 120 }}
            startIcon={<Speed />}
          >
            🚨 Quick SOS
          </EmergencyButton>
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Fast alert without detailed location
          </Typography>
        </Grid>
      </Grid>

      {/* Enhanced Location Status */}
      <LocationCard 
        status={currentLocation ? 'active' : locationError ? 'error' : 'inactive'}
        sx={{ mb: 3 }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                {currentLocation ? <GpsFixed color="success" /> : <GpsNotFixed color="error" />}
                <Typography variant="h6" fontWeight="medium">
                  {currentLocation ? '📍 Enhanced GPS Active' : '📍 GPS Unavailable'}
                </Typography>
                {locationLoading && <CircularProgress size={20} />}
              </Stack>
              
              {currentLocation ? (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Lat: {currentLocation.latitude.toFixed(6)}, Lng: {currentLocation.longitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accuracy: ±{Math.round(currentLocation.accuracy)}m • 
                    {currentLocation.speed && ` Speed: ${Math.round(currentLocation.speed * 3.6)}km/h •`}
                    Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                  </Typography>
                  {currentLocation.altitude && (
                    <Typography variant="body2" color="text.secondary">
                      Altitude: {Math.round(currentLocation.altitude)}m
                      {currentLocation.altitudeAccuracy && ` (±${Math.round(currentLocation.altitudeAccuracy)}m)`}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {locationError || 'Enable location services for enhanced emergency response'}
                  </Typography>
                  {locationError && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setManualLocationDialog(true)}
                      startIcon={<LocationOn />}
                    >
                      Enter Location Manually
                    </Button>
                  )}
                </Stack>
              )}
            </Box>
            
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefreshLocation}
                    onChange={(e) => setAutoRefreshLocation(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto-refresh"
                sx={{ m: 0 }}
              />
              <Button
                variant="contained"
                onClick={() => getCurrentLocation()}
                disabled={locationLoading}
                startIcon={locationLoading ? <CircularProgress size={16} /> : <Refresh />}
                size="small"
              >
                {locationLoading ? 'Getting...' : 'Refresh'}
              </Button>
            </Stack>
          </Stack>
          
          {locationLoading && <LinearProgress sx={{ mt: 1 }} />}
        </CardContent>
      </LocationCard>

      {/* Route Information */}
      {routeInfo && selectedHospital && (
        <RouteCard sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Route color="primary" />
              <Typography variant="h6" fontWeight="medium">
                Route to {selectedHospital.name}
              </Typography>
              {routeLoading && <CircularProgress size={20} />}
            </Stack>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DirectionsCar fontSize="small" />
                  <Typography variant="body2">
                    {routeInfo.distance.text}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTime fontSize="small" />
                  <Typography variant="body2">
                    {routeInfo.durationInTraffic?.text || routeInfo.duration.text}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Arrival: {googleMapsService.calculateArrivalTime(
                    routeInfo.durationInTraffic?.value || routeInfo.duration.value
                  )}
                </Typography>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} mt={2}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Navigation />}
                onClick={() => {
                  const url = googleMapsService.generateNavigationURL(
                    selectedHospital.location,
                    { lat: currentLocation.latitude, lng: currentLocation.longitude }
                  );
                  window.open(url, '_blank');
                }}
              >
                Navigate
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Share />}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Route to ${selectedHospital.name}`,
                      text: `${routeInfo.distance.text} • ${routeInfo.durationInTraffic?.text || routeInfo.duration.text}`,
                      url: googleMapsService.generateNavigationURL(selectedHospital.location)
                    });
                  }
                }}
              >
                Share
              </Button>
            </Stack>
          </CardContent>
        </RouteCard>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Emergency Controls */}
        <Grid item xs={12} lg={6}>
          {/* Emergency Contacts */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  <ContactPhone sx={{ mr: 1 }} />
                  Emergency Contacts
                </Typography>
                <Button startIcon={<Add />} size="small">
                  Add Contact
                </Button>
              </Stack>
              
              <List dense>
                {allContacts.slice(0, 4).map((contact, index) => (
                  <ListItem key={contact.id || index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Phone color={contact.type === 'Emergency' ? 'error' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={contact.name}
                      secondary={contact.phone_number}
                    />
                    <IconButton
                      color="primary"
                      href={`tel:${contact.phone_number}`}
                      size="small"
                    >
                      <Call />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Map and Hospitals */}
        <Grid item xs={12} lg={6}>
          {/* Google Maps Integration */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1} px={2} pt={1}>
                <Typography variant="h6">
                  <MapIcon sx={{ mr: 1 }} />
                  Live Emergency Map
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Toggle Map Type">
                    <IconButton size="small" onClick={toggleMapType}>
                      {mapType === 'satellite' ? <Satellite /> : <Terrain />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Traffic">
                    <IconButton size="small" onClick={toggleTrafficLayer}>
                      <Traffic color={trafficLayer ? 'primary' : 'disabled'} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={mapVisible ? 'Hide Map' : 'Show Map'}>
                    <IconButton size="small" onClick={() => setMapVisible(!mapVisible)}>
                      {mapVisible ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={mapFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                    <IconButton size="small" onClick={() => setMapFullscreen(!mapFullscreen)}>
                      {mapFullscreen ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              
              {mapVisible && (
                <MapContainer sx={{ height: mapFullscreen ? '70vh' : 400 }}>
                  {!mapLoaded ? (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                      <Stack alignItems="center" spacing={2}>
                        <CircularProgress />
                        <Typography>Loading Google Maps...</Typography>
                      </Stack>
                    </Box>
                  ) : (
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                  )}
                  
                  {mapLoaded && (
                    <MapControls>
                      <Tooltip title="Center on Location">
                        <IconButton
                          size="small"
                          sx={{ bgcolor: 'background.paper' }}
                          onClick={() => {
                            if (currentLocation && mapInstance) {
                              mapInstance.setCenter({
                                lat: currentLocation.latitude,
                                lng: currentLocation.longitude
                              });
                              mapInstance.setZoom(16);
                            }
                          }}
                        >
                          <MyLocation />
                        </IconButton>
                      </Tooltip>
                    </MapControls>
                  )}
                </MapContainer>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Nearby Hospitals */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  <LocalHospital sx={{ mr: 1 }} />
                  Nearby Hospitals
                  <Badge badgeContent={nearbyHospitals.length} color="primary" sx={{ ml: 1 }} />
                </Typography>
                <Stack direction="row" spacing={1}>
                  {routeLoading && <CircularProgress size={20} />}
                  <Button
                    size="small"
                    startIcon={<Update />}
                    onClick={() => currentLocation && loadNearbyHospitalsWithRoutes(currentLocation)}
                    disabled={!currentLocation || routeLoading}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>
              
              <Stack spacing={2} maxHeight={400} sx={{ overflowY: 'auto' }}>
                {hospitalsWithRoutes.length === 0 ? (
                  <Alert severity="info">
                    {routeLoading ? 'Loading hospitals with route information...' : 
                     !currentLocation ? 'Enable location services to find nearby hospitals' :
                     'No hospitals found in your area'}
                  </Alert>
                ) : (
                  hospitalsWithRoutes.map((hospital, index) => (
                    <EnhancedHospitalCard
                      key={hospital.id || index}
                      hospital={hospital}
                      currentLocation={currentLocation}
                      onNavigate={(hospital) => {
                        setSelectedHospital(hospital);
                        showHospitalRoute(hospital);
                      }}
                      onCall={(hospital, phone) => {
                        showSnackbar(`Calling ${hospital.name}`, 'info');
                      }}
                    />
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emergency Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Info sx={{ mr: 1 }} />
            Emergency Instructions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                During an Emergency:
              </Typography>
              <List dense>
                {[
                  'Stay calm and follow operator instructions',
                  'Provide your exact location if possible',
                  'Describe the nature of emergency clearly',
                  'Do not hang up until help arrives',
                  'Keep your phone accessible and charged'
                ].map((instruction, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Warning color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={instruction}
                      slotProps={{ primary: { variant: 'body2' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                Preparation Tips:
              </Typography>
              <List dense>
                {[
                  'Keep emergency contacts updated',
                  'Enable location services on your device',
                  'Know your medical conditions and medications',
                  'Have important documents accessible',
                  'Practice emergency procedures regularly'
                ].map((tip, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Security color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={tip}
                      slotProps={{ primary: { variant: 'body2' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Emergency color="error" />
            <Typography variant="h6">
              {confirmDialog.type === 'emergency' ? 'Send Enhanced Emergency Alert?' : 'Send Quick SOS?'}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {confirmDialog.type === 'emergency' 
              ? 'This will immediately notify emergency services with your precise GPS location, nearby hospitals, and enhanced location metadata.'
              : 'This will send a quick SOS alert without detailed location information.'
            }
          </Typography>
          
          {confirmDialog.type === 'emergency' && currentLocation && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Location Data:</strong><br />
                • GPS Accuracy: ±{Math.round(currentLocation.accuracy)}m<br />
                • Nearby Hospitals: {nearbyHospitals.length} found<br />
                • Enhanced Metadata: Speed, heading, altitude included
              </Typography>
            </Alert>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Only use in real emergencies.</strong> False alarms can divert resources from actual emergencies.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, type: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleEmergencyAlert}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Emergency />}
          >
            {loading ? 'Sending...' : 'Send Alert'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Manual Location Dialog */}
      <Dialog
        open={manualLocationDialog}
        onClose={() => setManualLocationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enter Your Location</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Since automatic location detection failed, please provide your current address or nearest landmark.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Address or Location"
            fullWidth
            variant="outlined"
            placeholder="Enter your address or location..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const address = e.target.value.trim();
                if (address) {
                  setCurrentLocation({
                    latitude: null,
                    longitude: null,
                    accuracy: null,
                    address: address,
                    timestamp: new Date().toISOString(),
                    manual: true
                  });
                  setLocationError(null);
                  setManualLocationDialog(false);
                  showSnackbar('Manual location saved', 'success');
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualLocationDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const input = document.querySelector('input[label="Address or Location"]') || 
                          document.querySelector('input[placeholder*="address"]');
              const address = input?.value.trim();
              if (address) {
                setCurrentLocation({
                  latitude: null,
                  longitude: null,
                  accuracy: null,
                  address: address,
                  timestamp: new Date().toISOString(),
                  manual: true
                });
                setLocationError(null);
                setManualLocationDialog(false);
                showSnackbar('Manual location saved', 'success');
              }
            }}
          >
            Save Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Emergency Button */}
      {!isEmergencyActive && (
        <Fab
          color="error"
          size="large"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            animation: `${pulse} 2s infinite`,
          }}
          onClick={() => setConfirmDialog({ open: true, type: 'emergency' })}
        >
          <Emergency />
        </Fab>
      )}
    </Container>
  );
};

export default EmergencySOS;