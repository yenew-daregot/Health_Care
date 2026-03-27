import axiosClient from './axiosClient';

/**
 * Emergency API
 * Handles emergency requests, contacts, and SOS alerts
 * Base URL: /api/emergency/
 */
const emergencyApi = {
  //EMERGENCY CONTACTS
  /**
   * Get emergency contacts for current user
   * @param {Object} params - Query parameters
   * @returns {Promise} List of emergency contacts
   */
  getContacts: (params = {}) => axiosClient.get('emergency/contacts/', { params }),
  
  /**
   * Get specific emergency contact
   * @param {number} id - Contact ID
   * @returns {Promise} Contact details
   */
  getContact: (id) => axiosClient.get(`emergency/contacts/${id}/`),
  
  /**
   * Create new emergency contact
   * @param {Object} data - Contact data
   * @returns {Promise} Created contact
   */
  createContact: (data) => axiosClient.post('emergency/contacts/', data),
  
  /**
   * Update emergency contact
   * @param {number} id - Contact ID
   * @param {Object} data - Updated contact data
   * @returns {Promise} Updated contact
   */
  updateContact: (id, data) => axiosClient.put(`emergency/contacts/${id}/`, data),
  
  /**
   * Delete emergency contact
   * @param {number} id - Contact ID
   * @returns {Promise} Deletion confirmation
   */
  deleteContact: (id) => axiosClient.delete(`emergency/contacts/${id}/`),
  
  /**
   * Set primary emergency contact
   * @param {number} id - Contact ID
   * @returns {Promise} Updated contact
   */
  setPrimaryContact: (id) => axiosClient.post(`emergency/contacts/${id}/set-primary/`),
  
  /**
   * Get emergency contacts for specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's emergency contacts
   */
  getPatientContacts: (patientId) => axiosClient.get(`emergency/contacts/patient/${patientId}/`),
  
  //EMERGENCY REQUESTS
  /**
   * Get emergency requests
   * @param {Object} params - Query parameters {status, priority, date_from, date_to}
   * @returns {Promise} List of emergency requests
   */
  getEmergencies: (params = {}) => axiosClient.get('emergency/requests/', { params }),
  
  /**
   * Get specific emergency request
   * @param {number} id - Emergency request ID
   * @returns {Promise} Emergency request details
   */
  getEmergency: (id) => axiosClient.get(`emergency/requests/${id}/`),
  
  /**
   * Get emergency by request ID
   * @param {string} requestId - Emergency request ID
   * @returns {Promise} Emergency request details
   */
  getEmergencyByRequestId: (requestId) => axiosClient.get(`emergency/requests/${requestId}/by-id/`),
  
  /**
   * Create new emergency request
   * @param {Object} data - Emergency request data
   * @returns {Promise} Created emergency request
   */
  createEmergency: (data) => axiosClient.post('emergency/requests/', data),
  
  /**
   * Update emergency status
   * @param {number} id - Emergency ID
   * @param {Object} data - Status update data
   * @returns {Promise} Updated emergency
   */
  updateEmergencyStatus: (id, data) => axiosClient.patch(`emergency/requests/${id}/update-status/`, data),
  
  /**
   * Assign emergency team
   * @param {number} id - Emergency ID
   * @param {Object} data - Team assignment data
   * @returns {Promise} Updated emergency
   */
  assignTeam: (id, data) => axiosClient.post(`emergency/requests/${id}/assign-team/`, data),
  
  /**
   * Get active emergencies
   * @returns {Promise} List of active emergencies
   */
  getActiveEmergencies: () => axiosClient.get('emergency/requests/active/'),
  
  /**
   * Get critical emergencies
   * @returns {Promise} List of critical emergencies
   */
  getCriticalEmergencies: () => axiosClient.get('emergency/requests/critical/'),
  
  /**
   * Get emergencies for specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's emergencies
   */
  getPatientEmergencies: (patientId) => axiosClient.get(`emergency/requests/patient/${patientId}/`),
  
  //REAL-TIME UPDATES 
  /**
   * Update emergency location
   * @param {number} id - Emergency ID
   * @param {Object} data - Location data
   * @returns {Promise} Updated emergency
   */
  updateLocation: (id, data) => axiosClient.patch(`emergency/requests/${id}/update-location/`, data),
  
  /**
   * Update patient vitals
   * @param {number} id - Emergency ID
   * @param {Object} data - Vitals data
   * @returns {Promise} Updated emergency
   */
  updateVitals: (id, data) => axiosClient.patch(`emergency/requests/${id}/update-vitals/`, data),
  
  /**
   * Add note to emergency
   * @param {number} id - Emergency ID
   * @param {Object} data - Note data
   * @returns {Promise} Added note
   */
  addNote: (id, data) => axiosClient.post(`emergency/requests/${id}/add-note/`, data),
  
  //EMERGENCY ALERTS & SOS
  /**
   * Send SOS alert
   * @param {Object} data - SOS alert data
   * @returns {Promise} SOS alert response
   */
  sendSOSAlert: (data) => axiosClient.post('emergency/alerts/sos/', data),
  
  /**
   * Send quick SOS (simplified emergency alert)
   * @param {Object} data - Quick SOS data (optional)
   * @returns {Promise} Quick SOS response
   */
  sendQuickSOS: (data = {}) => axiosClient.post('emergency/mobile/quick-sos/', data),
  
  /**
   * Get emergency alerts
   * @param {Object} params - Query parameters
   * @returns {Promise} List of alerts
   */
  getAlerts: (params = {}) => axiosClient.get('emergency/alerts/', { params }),
  
  //EMERGENCY PROTOCOLS
  /**
   * Get emergency protocols
   * @returns {Promise} List of emergency protocols
   */
  getProtocols: () => axiosClient.get('emergency/protocols/'),
  
  /**
   * Get protocol by type
   * @param {string} type - Protocol type
   * @returns {Promise} Protocol details
   */
  getProtocolByType: (type) => axiosClient.get(`emergency/protocols/type/${type}/`),
  
  //MOBILE & LOCATION SERVICES 
  /**
   * Get nearby hospitals (basic)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in km (optional)
   * @returns {Promise} List of nearby hospitals
   */
  getNearbyHospitals: (lat, lng, radius = 10) => axiosClient.get('emergency/mobile/nearby-hospitals/', {
    params: { lat, lng, radius }
  }),

  /**
   * Get nearby hospitals with enhanced route information
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in km (optional)
   * @returns {Promise} List of nearby hospitals with routes and ETAs
   */
  getNearbyHospitalsWithRoutes: (lat, lng, radius = 10) => axiosClient.get('emergency/mobile/nearby-hospitals-enhanced/', {
    params: { lat, lng, radius }
  }),

  /**
   * Calculate emergency route
   * @param {Object} data - Route calculation data
   * @returns {Promise} Route information with ETA
   */
  calculateEmergencyRoute: (data) => axiosClient.post('emergency/mobile/calculate-route/', data),

  /**
   * Get turn-by-turn navigation
   * @param {number} emergencyId - Emergency request ID
   * @returns {Promise} Navigation instructions
   */
  getNavigationInstructions: (emergencyId) => axiosClient.get(`emergency/requests/${emergencyId}/navigation/`),

  /**
   * Update ambulance location for real-time tracking
   * @param {number} ambulanceId - Ambulance ID
   * @param {Object} locationData - Location update data
   * @returns {Promise} Updated location
   */
  updateAmbulanceLocation: (ambulanceId, locationData) => axiosClient.patch(`emergency/ambulances/${ambulanceId}/location/`, locationData),

  /**
   * Get real-time ETA updates
   * @param {number} emergencyId - Emergency request ID
   * @returns {Promise} Current ETA information
   */
  getRealTimeETA: (emergencyId) => axiosClient.get(`emergency/requests/${emergencyId}/eta/`),
  
  /**
   * Get emergency guide/instructions
   * @returns {Promise} Emergency guide data
   */
  getEmergencyGuide: () => axiosClient.get('emergency/mobile/emergency-guide/'),
  
  // ===== STATISTICS & REPORTING =====
  /**
   * Get emergency statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} Emergency statistics
   */
  getEmergencyStats: (params = {}) => axiosClient.get('emergency/statistics/', { params }),
  
  /**
   * Export emergency report
   * @param {Object} params - Export parameters
   * @returns {Promise} Report file (blob)
   */
  exportEmergencyReport: (params = {}) => axiosClient.get('emergency/reports/export/', {
    params,
    responseType: 'blob'
  }),
  
  // ===== LEGACY METHODS (for backward compatibility) =====
  /**
   * @deprecated Use getContacts() instead
   */
  getEmergencyContacts: () => emergencyApi.getContacts(),
  
  /**
   * @deprecated Use createEmergency() instead
   */
  sendEmergencyAlert: (data) => emergencyApi.createEmergency(data),
  
  /**
   * @deprecated Use sendQuickSOS() instead
   */
  quickSOS: (data) => emergencyApi.sendQuickSOS(data),
};

export default emergencyApi;