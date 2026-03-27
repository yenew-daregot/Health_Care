import axiosClient from './axiosClient';
import errorHandlingService from '../services/errorHandlingService';
// API wrapper with consistent error handling
const apiWrapper = async (apiCall, operation, appointmentData = null) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    throw errorHandlingService.handleAppointmentError(error, operation, appointmentData);
  }
};

const appointmentsApi = {
  //CRUD OPERATIONS
  /**
   * Get list of appointments
   * @param {Object} params - Query parameters {page, date, status, patient, doctor}
   * @returns {Promise} Paginated list of appointments
   */
  getAppointments: (params = {}) => 
    apiWrapper(
      () => axiosClient.get('appointments/', { params }),
      'fetch'
    ),

  /**
   * Create new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise} Created appointment data
   */
  createAppointment: (appointmentData) => {
    // Validate appointment data
    const validation = errorHandlingService.validateAppointmentData(appointmentData);
    if (!validation.isValid) {
      return Promise.reject(new Error(validation.errors.join(', ')));
    }
    
    return apiWrapper(
      () => axiosClient.post('appointments/', appointmentData),
      'create',
      appointmentData
    );
  },

  /**
   * Get appointment details by ID
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Appointment details
   */
  getAppointment: (appointmentId) => 
    apiWrapper(
      () => axiosClient.get(`appointments/${appointmentId}/`),
      'fetch'
    ),

  /**
   * Update appointment
   * @param {number} appointmentId - Appointment ID
   * @param {Object} appointmentData - Appointment data to update
   * @returns {Promise} Updated appointment data
   */
  updateAppointment: (appointmentId, appointmentData) => 
    apiWrapper(
      () => axiosClient.put(`appointments/${appointmentId}/`, appointmentData),
      'update',
      appointmentData
    ),

  /**
   * Partial update appointment
   * @param {number} appointmentId - Appointment ID
   * @param {Object} appointmentData - Appointment data to update
   * @returns {Promise} Updated appointment data
   */
  patchAppointment: (appointmentId, appointmentData) => 
    apiWrapper(
      () => axiosClient.patch(`appointments/${appointmentId}/`, appointmentData),
      'update',
      appointmentData
    ),

  /**
   * Delete appointment
   * @param {number} appointmentId - Appointment ID
   * @returns {Promise} Deletion confirmation
   */
  deleteAppointment: (appointmentId) => 
    apiWrapper(
      () => axiosClient.delete(`appointments/${appointmentId}/`),
      'delete'
    ),

  //APPOINTMENT MANAGEMENT 
  /**
   * Get doctor's appointments
   * @param {Object} params - Query parameters {date, status}
   * @returns {Promise} Doctor's appointments
   */
  getDoctorAppointments: (params = {}) => 
    axiosClient.get('appointments/', { params: { ...params, role: 'doctor' } }),

  /**
   * Get patient's appointments
   * @param {number} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Patient's appointments
   */
  getPatientAppointments: (patientId, params = {}) => 
    axiosClient.get(`appointments/patients/${patientId}/`, { params }),

  /**
   * Get today's appointments
   * @param {Object} params - Query parameters
   * @returns {Promise} Today's appointments
   */
  getTodayAppointments: (params = {}) => 
    axiosClient.get('appointments/today/', { params }),

  /**
   * Get upcoming appointments
   * @param {Object} params - Query parameters
   * @returns {Promise} Upcoming appointments
   */
  getUpcomingAppointments: (params = {}) => 
    axiosClient.get('appointments/upcoming/', { params }),

  //APPOINTMENT SCHEDULING 
  /**
   * Get available slots for a doctor
   * @param {number} doctorId - Doctor ID
   * @param {Object} params - Query parameters {date, duration}
   * @returns {Promise} Available time slots
   */
  getAvailableSlots: (doctorId, params = {}) => 
    axiosClient.get(`appointments/doctors/${doctorId}/slots/`, { params }),

  //APPOINTMENT STATUS MANAGEMENT 
  /**
   * Update appointment status
   * @param {number} appointmentId - Appointment ID
   * @param {Object} statusData - {status, notes}
   * @returns {Promise} Updated appointment
   */
  updateAppointmentStatus: (appointmentId, statusData) => 
    apiWrapper(
      () => axiosClient.patch(`appointments/${appointmentId}/status/`, statusData),
      'update',
      statusData
    ),

  /**
   * Update appointment status (alias for compatibility)
   */
  updateStatus: (appointmentId, statusData) => 
    appointmentsApi.updateAppointmentStatus(appointmentId, statusData),

  /**
   * Cancel appointment
   * @param {number} appointmentId - Appointment ID
   * @param {Object} cancelData - {reason, notes}
   * @returns {Promise} Cancelled appointment
   */
  cancelAppointment: (appointmentId, cancelData = {}) => 
    apiWrapper(
      () => axiosClient.post(`appointments/${appointmentId}/cancel/`, cancelData),
      'cancel',
      cancelData
    ),

  //APPOINTMENT STATISTICS
  /**
   * Get appointment statistics
   * @param {Object} params - Query parameters {start_date, end_date, doctor, patient}
   * @returns {Promise} Appointment statistics
   */
  getStatistics: (params = {}) => 
    axiosClient.get('appointments/statistics/', { params }),

  //ADMIN APPOINTMENT MANAGEMENT
  admin: {
    /**
     * Get all appointments (Admin view)
     * @param {Object} params - Query parameters
     * @returns {Promise} All appointments
     */
    getAppointments: (params = {}) => 
      axiosClient.get('appointments/admin/', { params }),

    /**
     * Get appointment details (Admin view)
     * @param {number} appointmentId - Appointment ID
     * @returns {Promise} Appointment details
     */
    getAppointment: (appointmentId) => 
      axiosClient.get(`appointments/admin/${appointmentId}/`),

    /**
     * Create appointment (Admin)
     * @param {Object} appointmentData - Appointment data
     * @returns {Promise} Created appointment
     */
    createAppointment: (appointmentData) => 
      axiosClient.post('appointments/admin/create/', appointmentData),

    /**
     * Search appointments (Admin)
     * @param {Object} searchParams - Search parameters
     * @returns {Promise} Search results
     */
    searchAppointments: (searchParams) => 
      axiosClient.get('appointments/admin/search/', { params: searchParams }),

    /**
     * Update appointment status (Admin)
     * @param {number} appointmentId - Appointment ID
     * @param {Object} statusData - Status update data
     * @returns {Promise} Updated appointment
     */
    updateStatus: (appointmentId, statusData) => 
      axiosClient.patch(`appointments/${appointmentId}/status/`, statusData),

    /**
     * Cancel appointment (Admin)
     * @param {number} appointmentId - Appointment ID
     * @param {Object} cancelData - Cancellation data
     * @returns {Promise} Cancelled appointment
     */
    cancelAppointment: (appointmentId, cancelData) => 
      axiosClient.post(`appointments/${appointmentId}/cancel/`, cancelData)
  },

  //APPOINTMENT SEARCH 
  /**
   * Search appointments
   * @param {Object} searchParams - Search parameters {q, date_from, date_to, status, doctor, patient}
   * @returns {Promise} Search results
   */
  searchAppointments: (searchParams) => 
    axiosClient.get('appointments/', { params: searchParams }),

  //APPOINTMENT FILTERS 
  /**
   * Get appointments by status
   * @param {string} status - Appointment status (scheduled, completed, cancelled, etc.)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Filtered appointments
   */
  getAppointmentsByStatus: (status, params = {}) => 
    axiosClient.get('appointments/', { params: { status, ...params } }),

  /**
   * Get appointments by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Appointments in date range
   */
  getAppointmentsByDateRange: (startDate, endDate, params = {}) => 
    axiosClient.get('appointments/', { 
      params: { 
        appointment_date__gte: startDate, 
        appointment_date__lte: endDate, 
        ...params 
      } 
    }),

  //APPOINTMENT NOTIFICATIONS
  /**
   * Send appointment reminder
   * @param {number} appointmentId - Appointment ID
   * @param {Object} reminderData - Reminder configuration
   * @returns {Promise} Reminder sent confirmation
   */
  sendReminder: (appointmentId, reminderData = {}) => 
    axiosClient.post(`appointments/${appointmentId}/send-reminder/`, reminderData),

  //APPOINTMENT REPORTS
  /**
   * Generate appointment report
   * @param {Object} reportParams - Report parameters {start_date, end_date, format}
   * @returns {Promise} Generated report
   */
  generateReport: (reportParams) => 
    axiosClient.get('appointments/report/', { params: reportParams }),

  /**
   * Export appointments
   * @param {Object} exportParams - Export parameters {format, filters}
   * @returns {Promise} Exported data
   */
  exportAppointments: (exportParams = {}) => 
    axiosClient.get('appointments/export/', { 
      params: exportParams,
      responseType: exportParams.format === 'csv' ? 'blob' : 'json'
    }),

  // HEALTH CHECK
  /**
   * Health check for appointments service
   * @returns {Promise} Health status
   */
  healthCheck: () => axiosClient.get('appointments/health/'),

  //RETRY UTILITIES 
  /**
   * Retry failed appointment operation
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum retry attempts
   * @param {number} delay - Delay between retries
   * @returns {Promise} Operation result
   */
  retryOperation: (operation, maxRetries = 3, delay = 1000) => 
    errorHandlingService.retryOperation(operation, maxRetries, delay)
};

export default appointmentsApi;