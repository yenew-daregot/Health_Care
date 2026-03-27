import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const medicationApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
medicationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
medicationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Medication Management API
export const medicationApiService = {
  // Admin Medication Management
  getAllMedications: () => medicationApi.get('/admin/medications/'),
  
  createMedication: (medicationData) => 
    medicationApi.post('/admin/medications/', medicationData),
  
  getMedication: (id) => medicationApi.get(`/admin/medications/${id}/`),
  
  updateMedication: (id, medicationData) => 
    medicationApi.put(`/admin/medications/${id}/`, medicationData),
  
  deleteMedication: (id) => medicationApi.delete(`/admin/medications/${id}/`),
  
  updateStock: (id, stockData) => 
    medicationApi.patch(`/admin/medications/${id}/update-stock/`, stockData),
  
  searchMedications: (query) => 
    medicationApi.get(`/admin/medications/search/?q=${encodeURIComponent(query)}`),
  
  getMedicationStatistics: () => 
    medicationApi.get('/admin/medication-statistics/'),
  
  getLowStockMedications: () => 
    medicationApi.get('/admin/medications/low-stock/'),
  
  getExpiringMedications: () => 
    medicationApi.get('/admin/medications/expiring/'),

  // Prescription Management
  getAllPrescriptions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return medicationApi.get(`/prescriptions/${queryString ? `?${queryString}` : ''}`);
  },
  
  createPrescription: (prescriptionData) => 
    medicationApi.post('/prescriptions/', prescriptionData),
  
  getPrescription: (id) => medicationApi.get(`/prescriptions/${id}/`),
  
  updatePrescription: (id, prescriptionData) => 
    medicationApi.put(`/prescriptions/${id}/`, prescriptionData),
  
  deletePrescription: (id) => medicationApi.delete(`/prescriptions/${id}/`),
  
  getActivePrescriptions: () => medicationApi.get('/prescriptions/active/'),
  
  getExpiredPrescriptions: () => medicationApi.get('/prescriptions/expired/'),
  
  getPatientPrescriptions: (patientId) => 
    medicationApi.get(`/prescriptions/patient/${patientId}/`),
  
  getDoctorPrescriptions: (doctorId) => 
    medicationApi.get(`/prescriptions/doctor/${doctorId}/`),

  // Prescription Refills
  getAllRefills: () => medicationApi.get('/prescriptions/refills/'),
  
  createRefill: (refillData) => 
    medicationApi.post('/prescriptions/refills/', refillData),
  
  getRefill: (id) => medicationApi.get(`/prescriptions/refills/${id}/`),
  
  approveRefill: (id, approvalData = {}) => 
    medicationApi.post(`/prescriptions/refills/${id}/approve/`, approvalData),
  
  denyRefill: (id, denialData) => 
    medicationApi.post(`/prescriptions/refills/${id}/deny/`, denialData),

  // Dashboard APIs
  getDoctorDashboard: () => medicationApi.get('/prescriptions/dashboard/doctor/'),
  
  getPatientDashboard: () => medicationApi.get('/prescriptions/dashboard/patient/'),
  
  getPrescriptionStatistics: () => medicationApi.get('/prescriptions/statistics/'),

  // Patient Medication Management
  getPatientMedications: () => medicationApi.get('/medication-management/medications/'),
  
  createPatientMedication: (medicationData) => 
    medicationApi.post('/medication-management/medications/', medicationData),
  
  updatePatientMedication: (id, medicationData) => 
    medicationApi.put(`/medication-management/medications/${id}/`, medicationData),
  
  deletePatientMedication: (id) => 
    medicationApi.delete(`/medication-management/medications/${id}/`),
  
  markMedicationTaken: (id) => 
    medicationApi.post(`/medication-management/medications/${id}/mark_taken/`),
  
  skipMedicationDose: (id) => 
    medicationApi.post(`/medication-management/medications/${id}/skip_dose/`),

  // Medication Doses
  getTodayDoses: () => medicationApi.get('/medication-management/doses/today/'),
  
  getUpcomingDoses: () => medicationApi.get('/medication-management/doses/upcoming/'),
  
  addDoseNote: (doseId, noteData) => 
    medicationApi.post(`/medication-management/doses/${doseId}/add_note/`, noteData),

  // Medication Reminders
  getPendingReminders: () => 
    medicationApi.get('/medication-management/reminders/pending/'),

  // Reports and Analytics
  generateMedicationReport: (reportType, params = {}) => {
    const queryString = new URLSearchParams({
      report_type: reportType,
      format: 'json',
      ...params
    }).toString();
    return medicationApi.get(`/admin/reports/generate/?${queryString}`);
  },
  
  exportMedicationData: (format = 'csv', params = {}) => {
    const queryString = new URLSearchParams({
      format,
      ...params
    }).toString();
    return medicationApi.get(`/admin/medications/export/?${queryString}`, {
      responseType: 'blob'
    });
  },

  // Medication Categories and Types
  getMedicationCategories: () => medicationApi.get('/medications/categories/'),
  
  getMedicationTypes: () => medicationApi.get('/medications/types/'),
  
  // Inventory Management
  getInventoryAlerts: () => medicationApi.get('/admin/inventory/alerts/'),
  
  updateInventorySettings: (settings) => 
    medicationApi.put('/admin/inventory/settings/', settings),
  
  getInventoryReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return medicationApi.get(`/admin/inventory/report/${queryString ? `?${queryString}` : ''}`);
  },

  // Medication Interactions and Warnings
  checkMedicationInteractions: (medicationIds) => 
    medicationApi.post('/medications/check-interactions/', { medication_ids: medicationIds }),
  
  getMedicationWarnings: (medicationId) => 
    medicationApi.get(`/medications/${medicationId}/warnings/`),

  // Adherence Tracking
  getAdherenceReport: (patientId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return medicationApi.get(`/patients/${patientId}/adherence/${queryString ? `?${queryString}` : ''}`);
  },
  
  updateAdherenceData: (patientId, adherenceData) => 
    medicationApi.post(`/patients/${patientId}/adherence/`, adherenceData),

  // Bulk Operations
  bulkUpdateMedications: (updates) => 
    medicationApi.post('/admin/medications/bulk-update/', { updates }),
  
  bulkDeleteMedications: (medicationIds) => 
    medicationApi.post('/admin/medications/bulk-delete/', { medication_ids: medicationIds }),
  
  importMedications: (fileData) => {
    const formData = new FormData();
    formData.append('file', fileData);
    return medicationApi.post('/admin/medications/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default medicationApiService;