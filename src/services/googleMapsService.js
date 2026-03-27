/**
 * Google Maps Service
 * Enhanced integration for emergency system with route calculation, ETA, and navigation
 */

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    this.directionsService = null;
    this.distanceMatrixService = null;
    this.geocoder = null;
    this.isLoaded = false;
  }

  /**
   * Initialize Google Maps services
   */
  async initialize() {
    if (this.isLoaded) return true;

    try {
      // Load Google Maps API if not already loaded
      if (!window.google) {
        await this.loadGoogleMapsAPI();
      }

      this.directionsService = new window.google.maps.DirectionsService();
      this.distanceMatrixService = new window.google.maps.DistanceMatrixService();
      this.geocoder = new window.google.maps.Geocoder();
      this.isLoaded = true;

      console.log('✅ Google Maps services initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error);
      return false;
    }
  }

  /**
   * Load Google Maps API dynamically
   */
  loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps API'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Calculate route between two points with real-time traffic
   * @param {Object} origin - {lat, lng} or address string
   * @param {Object} destination - {lat, lng} or address string
   * @param {Object} options - Route options
   * @returns {Promise<Object>} Route information with ETA
   */
  async calculateRoute(origin, destination, options = {}) {
    await this.initialize();

    const defaultOptions = {
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
      optimizeWaypoints: true,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS
      }
    };

    const routeOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      this.directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: routeOptions.travelMode,
        unitSystem: routeOptions.unitSystem,
        avoidHighways: routeOptions.avoidHighways,
        avoidTolls: routeOptions.avoidTolls,
        optimizeWaypoints: routeOptions.optimizeWaypoints,
        drivingOptions: routeOptions.drivingOptions
      }, (result, status) => {
        if (status === 'OK') {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          const routeInfo = {
            distance: {
              text: leg.distance.text,
              value: leg.distance.value // meters
            },
            duration: {
              text: leg.duration.text,
              value: leg.duration.value // seconds
            },
            durationInTraffic: leg.duration_in_traffic ? {
              text: leg.duration_in_traffic.text,
              value: leg.duration_in_traffic.value // seconds
            } : null,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps.map(step => ({
              instruction: step.instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
              distance: step.distance.text,
              duration: step.duration.text,
              maneuver: step.maneuver || 'straight'
            })),
            polyline: route.overview_polyline.points,
            bounds: {
              northeast: route.bounds.getNorthEast().toJSON(),
              southwest: route.bounds.getSouthWest().toJSON()
            },
            warnings: route.warnings,
            copyrights: route.copyrights
          };

          resolve(routeInfo);
        } else {
          reject(new Error(`Route calculation failed: ${status}`));
        }
      });
    });
  }

  /**
   * Calculate ETA with real-time traffic for multiple destinations
   * @param {Object} origin - Origin coordinates
   * @param {Array} destinations - Array of destination coordinates
   * @returns {Promise<Array>} Array of ETA information
   */
  async calculateMultipleETAs(origin, destinations) {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.distanceMatrixService.getDistanceMatrix({
        origins: [origin],
        destinations: destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: window.google.maps.TrafficModel.BEST_GUESS
        }
      }, (response, status) => {
        if (status === 'OK') {
          const results = response.rows[0].elements.map((element, index) => ({
            destination: destinations[index],
            distance: element.distance ? {
              text: element.distance.text,
              value: element.distance.value
            } : null,
            duration: element.duration ? {
              text: element.duration.text,
              value: element.duration.value
            } : null,
            durationInTraffic: element.duration_in_traffic ? {
              text: element.duration_in_traffic.text,
              value: element.duration_in_traffic.value
            } : null,
            status: element.status
          }));
          
          resolve(results);
        } else {
          reject(new Error(`Distance matrix calculation failed: ${status}`));
        }
      });
    });
  }

  /**
   * Get optimized route for emergency response (fastest route)
   * @param {Object} ambulanceLocation - Current ambulance location
   * @param {Object} emergencyLocation - Emergency location
   * @param {Object} hospitalLocation - Destination hospital
   * @returns {Promise<Object>} Optimized route information
   */
  async getEmergencyRoute(ambulanceLocation, emergencyLocation, hospitalLocation = null) {
    await this.initialize();

    try {
      // Calculate route to emergency location
      const toEmergencyRoute = await this.calculateRoute(
        ambulanceLocation,
        emergencyLocation,
        {
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: window.google.maps.TrafficModel.PESSIMISTIC // Use worst-case for emergency
          }
        }
      );

      let toHospitalRoute = null;
      if (hospitalLocation) {
        // Calculate route from emergency to hospital
        toHospitalRoute = await this.calculateRoute(
          emergencyLocation,
          hospitalLocation,
          {
            drivingOptions: {
              departureTime: new Date(Date.now() + toEmergencyRoute.duration.value * 1000),
              trafficModel: window.google.maps.TrafficModel.PESSIMISTIC
            }
          }
        );
      }

      return {
        toEmergency: toEmergencyRoute,
        toHospital: toHospitalRoute,
        totalTime: toEmergencyRoute.duration.value + (toHospitalRoute?.duration.value || 0),
        totalDistance: toEmergencyRoute.distance.value + (toHospitalRoute?.distance.value || 0)
      };
    } catch (error) {
      console.error('Failed to calculate emergency route:', error);
      throw error;
    }
  }

  /**
   * Find nearest hospitals with route information
   * @param {Object} location - Current location {lat, lng}
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Array>} Hospitals with route information
   */
  async findNearestHospitalsWithRoutes(location, radius = 10000) {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );

      service.nearbySearch({
        location: location,
        radius: radius,
        type: 'hospital'
      }, async (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          try {
            // Get route information for each hospital
            const hospitalsWithRoutes = await Promise.all(
              results.slice(0, 5).map(async (hospital) => {
                try {
                  const route = await this.calculateRoute(location, {
                    lat: hospital.geometry.location.lat(),
                    lng: hospital.geometry.location.lng()
                  });

                  return {
                    id: hospital.place_id,
                    name: hospital.name,
                    address: hospital.vicinity,
                    location: {
                      lat: hospital.geometry.location.lat(),
                      lng: hospital.geometry.location.lng()
                    },
                    rating: hospital.rating,
                    isOpen: hospital.opening_hours?.open_now,
                    route: route,
                    eta: route.durationInTraffic?.text || route.duration.text,
                    distance: route.distance.text
                  };
                } catch (routeError) {
                  console.warn(`Failed to get route for ${hospital.name}:`, routeError);
                  return {
                    id: hospital.place_id,
                    name: hospital.name,
                    address: hospital.vicinity,
                    location: {
                      lat: hospital.geometry.location.lat(),
                      lng: hospital.geometry.location.lng()
                    },
                    rating: hospital.rating,
                    isOpen: hospital.opening_hours?.open_now,
                    route: null,
                    eta: 'Unknown',
                    distance: 'Unknown'
                  };
                }
              })
            );

            // Sort by ETA (shortest first)
            hospitalsWithRoutes.sort((a, b) => {
              if (!a.route || !b.route) return 0;
              const aTime = a.route.durationInTraffic?.value || a.route.duration.value;
              const bTime = b.route.durationInTraffic?.value || b.route.duration.value;
              return aTime - bTime;
            });

            resolve(hospitalsWithRoutes);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  /**
   * Geocode address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Coordinates and formatted address
   */
  async geocodeAddress(address) {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          const result = results[0];
          resolve({
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            },
            formattedAddress: result.formatted_address,
            addressComponents: result.address_components,
            placeId: result.place_id
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Reverse geocode coordinates to address
   * @param {Object} coordinates - {lat, lng}
   * @returns {Promise<Object>} Address information
   */
  async reverseGeocode(coordinates) {
    await this.initialize();

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: coordinates }, (results, status) => {
        if (status === 'OK') {
          const result = results[0];
          resolve({
            formattedAddress: result.formatted_address,
            addressComponents: result.address_components,
            placeId: result.place_id
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  /**
   * Generate Google Maps URL for navigation
   * @param {Object} destination - Destination coordinates or address
   * @param {Object} origin - Optional origin coordinates
   * @returns {string} Google Maps navigation URL
   */
  generateNavigationURL(destination, origin = null) {
    const baseURL = 'https://www.google.com/maps/dir/';
    
    let url = baseURL;
    
    if (origin) {
      if (typeof origin === 'object' && origin.lat && origin.lng) {
        url += `${origin.lat},${origin.lng}/`;
      } else {
        url += `${encodeURIComponent(origin)}/`;
      }
    }
    
    if (typeof destination === 'object' && destination.lat && destination.lng) {
      url += `${destination.lat},${destination.lng}`;
    } else {
      url += encodeURIComponent(destination);
    }
    
    // Add parameters for emergency navigation
    url += '?travelmode=driving&dir_action=navigate';
    
    return url;
  }

  /**
   * Generate turn-by-turn navigation instructions
   * @param {Object} route - Route object from calculateRoute
   * @returns {Array} Formatted navigation instructions
   */
  formatNavigationInstructions(route) {
    if (!route || !route.steps) return [];

    return route.steps.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.instruction,
      distance: step.distance,
      duration: step.duration,
      maneuver: step.maneuver,
      icon: this.getManeuverIcon(step.maneuver)
    }));
  }

  /**
   * Get icon for navigation maneuver
   * @param {string} maneuver - Maneuver type
   * @returns {string} Icon name or emoji
   */
  getManeuverIcon(maneuver) {
    const icons = {
      'turn-left': '↰',
      'turn-right': '↱',
      'turn-slight-left': '↖',
      'turn-slight-right': '↗',
      'turn-sharp-left': '↺',
      'turn-sharp-right': '↻',
      'uturn-left': '↶',
      'uturn-right': '↷',
      'straight': '↑',
      'ramp-left': '↰',
      'ramp-right': '↱',
      'merge': '↗',
      'fork-left': '↖',
      'fork-right': '↗',
      'ferry': '⛴',
      'roundabout-left': '↺',
      'roundabout-right': '↻'
    };

    return icons[maneuver] || '↑';
  }

  /**
   * Calculate estimated arrival time
   * @param {number} durationSeconds - Duration in seconds
   * @returns {string} Formatted arrival time
   */
  calculateArrivalTime(durationSeconds) {
    const arrivalTime = new Date(Date.now() + durationSeconds * 1000);
    return arrivalTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Format duration for display
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format distance for display
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance
   */
  formatDistance(meters) {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  }
}

// Create singleton instance
const googleMapsService = new GoogleMapsService();

export default googleMapsService;