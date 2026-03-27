import axiosClient from './axiosClient';

const adminApi = {
  // Dashboard Stats (matches admin_dashboard/urls.py)
  getDashboardStats: () => axiosClient.get('admin/dashboard-stats/'),
  getAnalytics: () => axiosClient.get('admin/analytics/'),
  getRecentActivities: () => axiosClient.get('admin/recent-activities/'),
  getPendingActions: () => axiosClient.get('admin/pending-actions/'),
  
  // User Management
  createPatient: (data) => axiosClient.post('admin/create-patient/', data),
  createDoctor: (data) => axiosClient.post('admin/create-doctor/', data),
  
  // Appointment Management (admin specific)
  getAdminAppointments: (params) => axiosClient.get('admin/appointments/', { params }),
  getAdminAppointment: (id) => axiosClient.get(`admin/appointments/${id}/`),
  
  // Medication Management (admin)
  getAdminMedications: (params) => axiosClient.get('admin/medications/', { params }),
  createMedication: (data) => axiosClient.post('admin/medications/create/', data),
  updateMedication: (id, data) => axiosClient.put(`admin/medications/${id}/update/`, data),
  deleteMedication: (id) => axiosClient.delete(`admin/medications/${id}/delete/`),
  updateStock: (id, data) => axiosClient.patch(`admin/medications/${id}/update-stock/`, data),
  
  // Emergency Management (admin endpoints from emergency/urls.py)
  getAdminEmergencies: (params) => axiosClient.get('emergency/admin/requests/', { params }),
  getAdminEmergencyDetail: (id) => axiosClient.get(`emergency/admin/requests/${id}/`),
  updateEmergencyStatus: (id, data) => axiosClient.patch(`emergency/admin/requests/${id}/update-status/`, data),
  assignEmergencyTeam: (id, data) => axiosClient.post(`emergency/admin/requests/${id}/assign-team/`, data),
  getEmergencyStatistics: () => axiosClient.get('admin/emergency-statistics/'),
  exportEmergencyReport: (params) => axiosClient.get('admin/reports/emergency-export/', { 
    params,
    responseType: 'blob' 
  }),
  
  // System Management
  getSystemStatus: () => axiosClient.get('admin/system-status/'),
  generateReport: (data) => axiosClient.post('admin/generate-report/', data),
  
  // Test connection
  testConnection: () => axiosClient.get('api/test/'),
};

export default adminApi;