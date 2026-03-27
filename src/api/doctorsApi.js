import axiosClient from './axiosClient';

/**
 * Doctors API
 * Handles doctor management and operations
 * Base URL: /api/doctors/
 */
const doctorsApi = {
  // DOCTOR AUTHENTICATION 
  /**
   * Doctor login
   * @param {Object} credentials - {username, password}
   * @returns {Promise} {access, refresh, user}
   */
  login: (credentials) => axiosClient.post('doctors/auth/login/', credentials),

  /**
   * Refresh doctor token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} {access}
   */
  refreshToken: (refreshToken) => axiosClient.post('doctors/auth/refresh/', { refresh: refreshToken }),

  /**
   * Doctor registration
   * @param {Object} doctorData - Doctor registration data
   * @returns {Promise} Created doctor data
   */
  register: (doctorData) => axiosClient.post('doctors/register/', doctorData),

  //CRUD OPERATIONS
  /**
   * Get list of doctors
   * @param {Object} params - Query parameters {search, specialization, is_available}
   * @returns {Promise} Paginated list of doctors
   */
  getDoctors: (params = {}) => axiosClient.get('doctors/', { params }),

  /**
   * Create new doctor
   * @param {Object} doctorData - Doctor data
   * @returns {Promise} Created doctor data
   */
  createDoctor: (doctorData) => axiosClient.post('doctors/create/', doctorData),

  /**
   * Get doctor details by ID
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Doctor details
   */
  getDoctor: (doctorId) => axiosClient.get(`doctors/${doctorId}/`),

  /**
   * Update doctor
   * @param {number} doctorId - Doctor ID
   * @param {Object} doctorData - Doctor data to update
   * @returns {Promise} Updated doctor data
   */
  updateDoctor: (doctorId, doctorData) => axiosClient.put(`doctors/${doctorId}/`, doctorData),

  /**
   * Partial update doctor
   * @param {number} doctorId - Doctor ID
   * @param {Object} doctorData - Doctor data to update
   * @returns {Promise} Updated doctor data
   */
  patchDoctor: (doctorId, doctorData) => axiosClient.patch(`doctors/${doctorId}/`, doctorData),

  /**
   * Delete doctor
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Deletion confirmation
   */
  deleteDoctor: (doctorId) => axiosClient.delete(`doctors/${doctorId}/`),

  // DOCTOR PROFILE 
  /**
   * Get current doctor's profile
   * @returns {Promise} Doctor profile data
   */
  getProfile: () => axiosClient.get('doctors/profile/'),

  /**
   * Update current doctor's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile data
   */
  updateProfile: (profileData) => axiosClient.put('doctors/profile/', profileData),

  /**
   * Partial update current doctor's profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile data
   */
  patchProfile: (profileData) => axiosClient.patch('doctors/profile/', profileData),

  // ===== SPECIALIZATIONS =====
  /**
   * Get list of specializations
   * @returns {Promise} List of specializations
   */
  getSpecializations: () => axiosClient.get('doctors/specializations/'),

  // ===== FILTERED DOCTOR VIEWS =====
  /**
   * Get available doctors
   * @param {Object} params - Query parameters
   * @returns {Promise} List of available doctors
   */
  getAvailableDoctors: (params = {}) => axiosClient.get('doctors/available/', { params }),

  /**
   * Get doctors by specialization
   * @param {number} specializationId - Specialization ID
   * @param {Object} params - Query parameters
   * @returns {Promise} List of doctors in specialization
   */
  getDoctorsBySpecialization: (specializationId, params = {}) => 
    axiosClient.get(`doctors/specialization/${specializationId}/`, { params }),

  //DOCTOR DASHBOARD
  /**
   * Get doctor dashboard data
   * @returns {Promise} Dashboard data
   */
  getDashboard: () => axiosClient.get('doctors/dashboard/'),

  /**
   * Get detailed doctor dashboard data
   * @returns {Promise} Detailed dashboard data
   */
  getDashboardData: () => axiosClient.get('doctors/dashboard/data/'),

  //DOCTOR APPOINTMENTS
  /**
   * Get doctor's appointments
   * @param {Object} params - Query parameters {date, status, patient}
   * @returns {Promise} Doctor's appointments
   */
  getAppointments: (params = {}) => axiosClient.get('doctors/appointments/', { params }),

  /**
   * Get doctor's appointments (alternative endpoint)
   * @param {number} doctorId - Doctor ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Doctor's appointments
   */
  getDoctorAppointments: (doctorId, params = {}) => 
    axiosClient.get(`appointments/doctor-appointments/`, { params: { doctor: doctorId, ...params } }),

  /**
   * Get doctor's patients from appointments
   * @param {Object} params - Query parameters {search, status}
   * @returns {Promise} Doctor's patients
   */
  getDoctorPatients: (params = {}) => axiosClient.get('doctors/patients/', { params }),

  //DOCTOR AVAILABILITY
  /**
   * Get available slots for a doctor
   * @param {number} doctorId - Doctor ID
   * @param {Object} params - Query parameters {date, duration}
   * @returns {Promise} Available time slots
   */
  getAvailableSlots: (doctorId, params = {}) => 
    axiosClient.get(`appointments/doctors/${doctorId}/slots/`, { params }),

  //DOCTOR MEDICAL RECORDS
  /**
   * Get medical records created by doctor
   * @param {number} doctorId - Doctor ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Medical records
   */
  getDoctorMedicalRecords: (doctorId, params = {}) => 
    axiosClient.get(`medical-records/records/doctor/${doctorId}/`, { params }),

  //DOCTOR LAB REQUESTS
  /**
   * Get lab requests by doctor
   * @param {number} doctorId - Doctor ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Lab requests
   */
  getDoctorLabRequests: (doctorId, params = {}) => 
    axiosClient.get(`labs/doctor/${doctorId}/`, { params }),

  //DOCTOR CHAT ROOMS
  /**
   * Get doctor's chat rooms
   * @param {number} doctorId - Doctor ID
   * @returns {Promise} Doctor's chat rooms
   */
  getDoctorChatRooms: (doctorId) => 
    axiosClient.get(`chat/rooms/doctor/${doctorId}/`),

  //DOCTOR STATISTICS
  /**
   * Get doctor statistics (Admin/Staff only)
   * @returns {Promise} Doctor statistics
   */
  getStats: () => axiosClient.get('doctors/stats/'),

  /**
   * Get public doctor statistics (for patient dashboard)
   * @returns {Promise} Public doctor statistics
   */
  getPublicStats: () => axiosClient.get('doctors/public-stats/'),

  //DEBUG/TESTING ENDPOINTS
  /**
   * Get user info for debugging
   * @returns {Promise} Debug user info
   */
  getUserInfo: () => axiosClient.get('doctors/debug/info/'),

  /**
   * Debug appointments
   * @returns {Promise} Debug appointment data
   */
  debugAppointments: () => axiosClient.get('doctors/debug/appointments/'),

  /**
   * Health check
   * @returns {Promise} Health status
   */
  healthCheck: () => axiosClient.get('doctors/health/'),

  /**
   * Public test endpoint
   * @returns {Promise} Test response
   */
  publicTest: () => axiosClient.get('doctors/public-test/'),

  // DOCTOR SEARCH
  /**
   * Search doctors
   * @param {Object} searchParams - Search parameters {q, specialization, location, availability}
   * @returns {Promise} Search results
   */
  searchDoctors: (searchParams) => axiosClient.get('doctors/', { params: searchParams }),

  //DOCTOR VERIFICATION 
  /**
   * Update doctor verification status (Admin only)
   * @param {number} doctorId - Doctor ID
   * @param {Object} verificationData - {is_verified, verification_notes}
   * @returns {Promise} Updated doctor data
   */
  updateVerificationStatus: (doctorId, verificationData) => 
    axiosClient.patch(`doctors/${doctorId}/`, verificationData),

  //DOCTOR AVAILABILITY MANAGEMENT 
  /**
   * Update doctor availability
   * @param {number} doctorId - Doctor ID
   * @param {Object} availabilityData - {is_available, available_days, available_hours}
   * @returns {Promise} Updated doctor data
   */
  updateAvailability: (doctorId, availabilityData) => 
    axiosClient.patch(`doctors/${doctorId}/`, availabilityData),

  //DOCTOR SCHEDULE MANAGEMENT 
  /**
   * Get doctor's schedules
   * @param {Object} params - Query parameters
   * @returns {Promise} List of schedules
   */
  getSchedules: (params = {}) => axiosClient.get('doctors/schedule/', { params }),

  /**
   * Create new schedule
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise} Created schedule
   */
  createSchedule: (scheduleData) => axiosClient.post('doctors/schedule/', scheduleData),

  /**
   * Update schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise} Updated schedule
   */
  updateSchedule: (scheduleId, scheduleData) => axiosClient.patch(`doctors/schedule/${scheduleId}/`, scheduleData),

  /**
   * Delete schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise} Deletion confirmation
   */
  deleteSchedule: (scheduleId) => axiosClient.delete(`doctors/schedule/${scheduleId}/`),

  /**
   * Get weekly schedule
   * @returns {Promise} Weekly schedule data
   */
  getWeeklySchedule: () => axiosClient.get('doctors/schedule/weekly/'),

  /**
   * Create multiple schedules at once
   * @param {Object} bulkData - {days: [0,1,2], start_time, end_time, ...}
   * @returns {Promise} Created schedules
   */
  createBulkSchedule: (bulkData) => axiosClient.post('doctors/schedule/bulk-create/', bulkData),

  /**
   * Get schedule exceptions
   * @param {Object} params - Query parameters {date_from, date_to}
   * @returns {Promise} List of exceptions
   */
  getScheduleExceptions: (params = {}) => axiosClient.get('doctors/schedule/exceptions/', { params }),

  /**
   * Create schedule exception
   * @param {Object} exceptionData - Exception data
   * @returns {Promise} Created exception
   */
  createScheduleException: (exceptionData) => axiosClient.post('doctors/schedule/exceptions/', exceptionData),

  /**
   * Update schedule exception
   * @param {number} exceptionId - Exception ID
   * @param {Object} exceptionData - Exception data
   * @returns {Promise} Updated exception
   */
  updateScheduleException: (exceptionId, exceptionData) => 
    axiosClient.patch(`doctors/schedule/exceptions/${exceptionId}/`, exceptionData),

  /**
   * Delete schedule exception
   * @param {number} exceptionId - Exception ID
   * @returns {Promise} Deletion confirmation
   */
  deleteScheduleException: (exceptionId) => axiosClient.delete(`doctors/schedule/exceptions/${exceptionId}/`),

  /**
   * Get doctor availability status
   * @returns {Promise} Availability data
   */
  getAvailabilityStatus: () => axiosClient.get('doctors/schedule/availability/'),

  /**
   * Update doctor availability status
   * @param {Object} availabilityData - {is_online, status_message, auto_accept_appointments}
   * @returns {Promise} Updated availability
   */
  updateAvailabilityStatus: (availabilityData) => axiosClient.patch('doctors/schedule/availability/', availabilityData),

  /**
   * Toggle online/offline status
   * @returns {Promise} New status
   */
  toggleAvailability: () => axiosClient.post('doctors/schedule/toggle-availability/'),

  /**
   * Get available time slots for a date
   * @param {Object} params - {date: 'YYYY-MM-DD'}
   * @returns {Promise} Available slots
   */
  getAvailableSlots: (params = {}) => axiosClient.get('doctors/schedule/available-slots/', { params }),

  /**
   * Get schedule summary for dashboard
   * @returns {Promise} Schedule summary
   */
  getScheduleSummary: () => axiosClient.get('doctors/schedule/summary/')
};

export default doctorsApi;