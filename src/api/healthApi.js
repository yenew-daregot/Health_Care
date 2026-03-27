import axiosClient from './axiosClient';

export const healthApi = {
  // Vitals
  getVitals: (params) => axiosClient.get('health/vitals/', { params }),
  getVital: (id) => axiosClient.get(`health/vitals/${id}/`),
  createVital: (data) => axiosClient.post('health/vitals/', data),
  updateVital: (id, data) => axiosClient.put(`health/vitals/${id}/`, data),
  deleteVital: (id) => axiosClient.delete(`health/vitals/${id}/`),
  
  // Patient-specific vitals
  getPatientVitals: (patientId, params) => 
    axiosClient.get(`health/patients/${patientId}/vitals/`, { params }),
  
  // Alerts
  getAlerts: (params) => axiosClient.get('health/alerts/', { params }),
  createAlert: (data) => axiosClient.post('health/alerts/', data),
  updateAlert: (id, data) => axiosClient.patch(`health/alerts/${id}/`, data),
  markAlertResolved: (id) => axiosClient.post(`health/alerts/${id}/resolve/`),
  
  // Stats
  getHealthStats: () => axiosClient.get('health/stats/'),
  getPatientHealthSummary: (patientId) => 
    axiosClient.get(`health/patients/${patientId}/summary/`),
};

export default healthApi;