import axiosClient from './axiosClient';

/**
 * Prescriptions API
 * Handles prescription management, medications, and refills
 * Base URL: /api/prescriptions/
 */
const prescriptionsApi = {
  // ===== PRESCRIPTIONS =====
  /**
   * Get prescriptions list
   * @param {Object} params - Query parameters {status, medication, urgent, search}
   * @returns {Promise} List of prescriptions
   */
  getPrescriptions: (params = {}) => axiosClient.get('prescriptions/prescriptions/', { params }),
  
  /**
   * Get specific prescription
   * @param {number} id - Prescription ID
   * @returns {Promise} Prescription details
   */
  getPrescription: (id) => axiosClient.get(`prescriptions/prescriptions/${id}/`),
  
  /**
   * Create new prescription
   * @param {Object} data - Prescription data
   * @returns {Promise} Created prescription
   */
  createPrescription: (data) => axiosClient.post('prescriptions/prescriptions/', data),
  
  /**
   * Update prescription
   * @param {number} id - Prescription ID
   * @param {Object} data - Updated prescription data
   * @returns {Promise} Updated prescription
   */
  updatePrescription: (id, data) => axiosClient.patch(`prescriptions/prescriptions/${id}/`, data),
  
  /**
   * Delete prescription
   * @param {number} id - Prescription ID
   * @returns {Promise} Deletion confirmation
   */
  deletePrescription: (id) => axiosClient.delete(`prescriptions/prescriptions/${id}/`),
  
  /**
   * Get prescriptions for specific patient
   * @param {number} patientId - Patient ID
   * @returns {Promise} Patient's prescriptions
   */
  getPatientPrescriptions: (patientId) => axiosClient.get(`prescriptions/prescriptions/patient/${patientId}/`),
  
  /**
   * Get prescriptions for specific doctor
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Doctor's prescriptions
   */
  getDoctorPrescriptions: (doctorId) => axiosClient.get(`prescriptions/prescriptions/doctor/${doctorId}/`),
  
  /**
   * Get active prescriptions
   * @returns {Promise} List of active prescriptions
   */
  getActivePrescriptions: () => axiosClient.get('prescriptions/prescriptions/active/'),
  
  /**
   * Get expired prescriptions
   * @returns {Promise} List of expired prescriptions
   */
  getExpiredPrescriptions: () => axiosClient.get('prescriptions/prescriptions/expired/'),
  
  // ===== MEDICATIONS =====
  /**
   * Get medications list
   * @param {Object} params - Query parameters {search, type}
   * @returns {Promise} List of medications
   */
  getMedications: (params = {}) => axiosClient.get('prescriptions/medications/', { params }),
  
  /**
   * Get specific medication
   * @param {number} id - Medication ID
   * @returns {Promise} Medication details
   */
  getMedication: (id) => axiosClient.get(`prescriptions/medications/${id}/`),
  
  /**
   * Create new medication
   * @param {Object} data - Medication data
   * @returns {Promise} Created medication
   */
  createMedication: (data) => axiosClient.post('prescriptions/medications/', data),
  
  /**
   * Update medication
   * @param {number} id - Medication ID
   * @param {Object} data - Updated medication data
   * @returns {Promise} Updated medication
   */
  updateMedication: (id, data) => axiosClient.patch(`prescriptions/medications/${id}/`, data),
  
  /**
   * Search medications
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  searchMedications: (query) => axiosClient.get('prescriptions/medications/', { 
    params: { search: query } 
  }),
  
  // ===== REFILLS =====
  /**
   * Get refill requests
   * @param {Object} params - Query parameters
   * @returns {Promise} List of refill requests
   */
  getRefills: (params = {}) => axiosClient.get('prescriptions/refills/', { params }),
  
  /**
   * Get specific refill request
   * @param {number} id - Refill ID
   * @returns {Promise} Refill details
   */
  getRefill: (id) => axiosClient.get(`prescriptions/refills/${id}/`),
  
  /**
   * Request prescription refill
   * @param {Object} data - Refill request data
   * @returns {Promise} Created refill request
   */
  requestRefill: (data) => axiosClient.post('prescriptions/refills/', data),
  
  /**
   * Approve refill request
   * @param {number} id - Refill ID
   * @returns {Promise} Approval confirmation
   */
  approveRefill: (id) => axiosClient.post(`prescriptions/refills/${id}/approve/`),
  
  /**
   * Deny refill request
   * @param {number} id - Refill ID
   * @param {string} denialReason - Reason for denial
   * @returns {Promise} Denial confirmation
   */
  denyRefill: (id, denialReason) => axiosClient.post(`prescriptions/refills/${id}/deny/`, {
    denial_reason: denialReason
  }),
  
  // ===== DASHBOARD =====
  /**
   * Get doctor dashboard data
   * @returns {Promise} Doctor dashboard statistics and data
   */
  getDoctorDashboard: () => axiosClient.get('prescriptions/dashboard/doctor/'),
  
  /**
   * Get patient dashboard data
   * @returns {Promise} Patient dashboard statistics and data
   */
  getPatientDashboard: () => axiosClient.get('prescriptions/dashboard/patient/'),
  
  /**
   * Get prescription statistics (admin only)
   * @returns {Promise} System-wide prescription statistics
   */
  getStatistics: () => axiosClient.get('prescriptions/statistics/'),
  
  // ===== UTILITY METHODS =====
  /**
   * Get prescription frequency options
   * @returns {Array} Frequency options for dropdowns
   */
  getFrequencyOptions: () => [
    { value: 'once_daily', label: 'Once Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'three_times_daily', label: 'Three Times Daily' },
    { value: 'four_times_daily', label: 'Four Times Daily' },
    { value: 'as_needed', label: 'As Needed' },
    { value: 'before_meals', label: 'Before Meals' },
    { value: 'after_meals', label: 'After Meals' },
    { value: 'at_bedtime', label: 'At Bedtime' },
    { value: 'custom', label: 'Custom' },
  ],
  
  /**
   * Get medication type options
   * @returns {Array} Medication type options for dropdowns
   */
  getMedicationTypeOptions: () => [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'cream', label: 'Cream' },
    { value: 'drops', label: 'Drops' },
    { value: 'inhaler', label: 'Inhaler' },
    { value: 'other', label: 'Other' },
  ],
  
  /**
   * Get prescription status options
   * @returns {Array} Status options for dropdowns
   */
  getStatusOptions: () => [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
  ],
  
  /**
   * Format prescription for display
   * @param {Object} prescription - Prescription object
   * @returns {Object} Formatted prescription data
   */
  formatPrescription: (prescription) => ({
    ...prescription,
    displayName: `${prescription.medication?.name} ${prescription.medication?.strength || ''}`.trim(),
    displayDosage: `${prescription.dosage} - ${prescription.frequency_display}`,
    displayDuration: prescription.duration,
    isExpiringSoon: prescription.days_remaining !== null && prescription.days_remaining <= 7,
    statusColor: {
      active: 'success',
      completed: 'info',
      cancelled: 'warning',
      expired: 'error'
    }[prescription.status] || 'default'
  }),
};

export default prescriptionsApi;