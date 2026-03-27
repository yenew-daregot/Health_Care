import axiosClient from './axiosClient';

/**
 * Patients API
 * Handles patient management and operations
 * Base URL: /api/patients/
 */
const patientsApi = {
  // ===== CRUD OPERATIONS =====
  /**
   * Get list of patients
   * @param {Object} params - Query parameters {page, search, ordering}
   * @returns {Promise} Paginated list of patients
   */
  getPatients: (params = {}) => axiosClient.get('patients/', { params }),

  /**
   * Create new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise} Created patient data
   */
  createPatient: (patientData) => axiosClient.post('patients/', patientData),

  /**
   * Get patient details by ID
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient details
   */
  getPatient: (patientId) => axiosClient.get(`patients/${patientId}/`),

  /**
   * Update patient
   * @param {number} patientId - Patient ID
   * @param {Object} patientData - Patient data to update
   * @returns {Promise} Updated patient data
   */
  updatePatient: (patientId, patientData) => axiosClient.put(`patients/${patientId}/`, patientData),

  /**
   * Partial update patient
   * @param {number} patientId - Patient ID
   * @param {Object} patientData - Patient data to update
   * @returns {Promise} Updated patient data
   */
  patchPatient: (patientId, patientData) => axiosClient.patch(`patients/${patientId}/`, patientData),

  /**
   * Delete patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} Deletion confirmation
   */
  deletePatient: (patientId) => axiosClient.delete(`patients/${patientId}/`),

  // ===== PATIENT PROFILE OPERATIONS =====
  /**
   * Get current patient's profile
   * @returns {Promise} Patient profile data
   */
  getProfile: () => axiosClient.get('patients/profile/'),

  /**
   * Create patient profile for current user
   * @param {Object} profileData - Patient profile data
   * @returns {Promise} Created patient profile
   */
  createProfile: (profileData) => axiosClient.post('patients/profile/create/', profileData),

  /**
   * Update current patient's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile data
   */
  updateProfile: (profileData) => axiosClient.put('patients/profile/', profileData),

  /**
   * Partial update current patient's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile data
   */
  patchProfile: (profileData) => axiosClient.patch('patients/profile/', profileData),

  // ===== PATIENT STATISTICS =====
  /**
   * Get patient statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} Patient statistics
   */
  getStats: (params = {}) => axiosClient.get('patients/stats/', { params }),

  // ===== PATIENT SEARCH =====
  /**
   * Search patients
   * @param {Object} searchParams - Search parameters {q, filters}
   * @returns {Promise} Search results
   */
  searchPatients: (searchParams) => axiosClient.get('patients/search/', { params: searchParams }),

  // ===== PATIENT APPOINTMENTS =====
  /**
   * Get patient's appointments
   * @param {number} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Patient's appointments
   */
  getPatientAppointments: (patientId, params = {}) => 
    axiosClient.get(`appointments/patients/${patientId}/`, { params }),

  // ===== PATIENT MEDICAL RECORDS =====
  /**
   * Get patient's medical records
   * @param {number} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Patient's medical records
   */
  getPatientMedicalRecords: (patientId, params = {}) => 
    axiosClient.get(`medical-records/records/patient/${patientId}/`, { params }),

  /**
   * Get patient's medical summary
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's medical summary
   */
  getPatientMedicalSummary: (patientId) => 
    axiosClient.get(`medical-records/patient/${patientId}/summary/`),

  /**
   * Get patient's medical timeline
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's medical timeline
   */
  getPatientMedicalTimeline: (patientId) => 
    axiosClient.get(`medical-records/patient/${patientId}/timeline/`),

  // ===== PATIENT ALLERGIES =====
  /**
   * Get patient's allergies
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's allergies
   */
  getPatientAllergies: (patientId) => 
    axiosClient.get(`medical-records/allergies/patient/${patientId}/`),

  // ===== PATIENT DIAGNOSES =====
  /**
   * Get patient's diagnoses
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's diagnoses
   */
  getPatientDiagnoses: (patientId) => 
    axiosClient.get(`medical-records/diagnoses/patient/${patientId}/`),

  // ===== PATIENT MEDICATIONS =====
  /**
   * Get patient's medication history
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's medication history
   */
  getPatientMedications: (patientId) => 
    axiosClient.get(`medical-records/medications/patient/${patientId}/`),

  // ===== PATIENT PRESCRIPTIONS =====
  /**
   * Get patient's prescriptions
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's prescriptions
   */
  getPatientPrescriptions: (patientId) => 
    axiosClient.get(`prescriptions/patient/${patientId}/`),

  // ===== PATIENT LAB REQUESTS =====
  /**
   * Get patient's lab requests
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's lab requests
   */
  getPatientLabRequests: (patientId) => 
    axiosClient.get(`labs/patient/${patientId}/`),

  // ===== PATIENT EMERGENCY CONTACTS =====
  /**
   * Get patient's emergency contacts
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's emergency contacts
   */
  getPatientEmergencyContacts: (patientId) => 
    axiosClient.get(`emergency/contacts/patient/${patientId}/`),

  // ===== PATIENT EMERGENCY REQUESTS =====
  /**
   * Get patient's emergency requests
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's emergency requests
   */
  getPatientEmergencyRequests: (patientId) => 
    axiosClient.get(`emergency/requests/patient/${patientId}/`),

  // ===== PATIENT CHAT ROOMS =====
  /**
   * Get patient's chat rooms
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's chat rooms
   */
  getPatientChatRooms: (patientId) => 
    axiosClient.get(`chat/rooms/patient/${patientId}/`),

  // ===== PATIENT VITAL SIGNS =====
  /**
   * Get patient's vital signs
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's vital signs
   */
  getPatientVitalSigns: (patientId) => 
    axiosClient.get(`medical-records/vital-signs/patient/${patientId}/`),

  // ===== PATIENT IMMUNIZATIONS =====
  /**
   * Get patient's immunizations
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's immunizations
   */
  getPatientImmunizations: (patientId) => 
    axiosClient.get(`medical-records/immunizations/patient/${patientId}/`),

  // ===== PATIENT SURGICAL HISTORY =====
  /**
   * Get patient's surgical history
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's surgical history
   */
  getPatientSurgicalHistory: (patientId) => 
    axiosClient.get(`medical-records/surgical-history/patient/${patientId}/`),

  // ===== PATIENT FAMILY HISTORY =====
  /**
   * Get patient's family history
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's family history
   */
  getPatientFamilyHistory: (patientId) => 
    axiosClient.get(`medical-records/family-history/patient/${patientId}/`)
};

export default patientsApi;