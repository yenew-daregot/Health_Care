// import axios from 'axios';

// //READ FROM .env FILE
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
// const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;
// const UPLOAD_TIMEOUT = parseInt(process.env.REACT_APP_UPLOAD_TIMEOUT) || 60000;

// console.log('📡 API Configuration:');
// console.log('Base URL:', API_BASE_URL);
// console.log('Environment:', process.env.REACT_APP_ENVIRONMENT);
// console.log('Debug Mode:', process.env.REACT_APP_DEBUG);

// // Create axios instance 
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: API_TIMEOUT,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// //request interceptor to include auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     // Log requests in development
//     if (process.env.REACT_APP_DEBUG === 'true') {
//       console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
//     }
    
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// //response interceptor to handle errors
// api.interceptors.response.use(
//   (response) => {
//     // Log responses in development
//     if (process.env.REACT_APP_DEBUG === 'true') {
//       console.log(`⬅️ ${response.status} ${response.config.url}`);
//     }
//     return response;
//   },
//   async (error) => {
//     // Log errors
//     if (process.env.REACT_APP_DEBUG === 'true') {
//       console.error('❌ API Error:', {
//         url: error.config?.url,
//         status: error.response?.status,
//         message: error.message
//       });
//     }

//     // If error is 401 (Unauthorized) and not already retrying
//     if (error.response?.status === 401 && !error.config._retry) {
//       error.config._retry = true;
      
//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         if (refreshToken) {
//           const response = await axios.post(
//             `${API_BASE_URL}/auth/token/refresh/`,
//             { refresh: refreshToken }
//           );
          
//           const { access } = response.data;
//           localStorage.setItem('access_token', access);
          
//           error.config.headers.Authorization = `Bearer ${access}`;
//           return api(error.config);
//         }
//       } catch (refreshError) {
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// // Helper functions for common API calls
// export const authAPI = {
//   login: (credentials) => api.post('/auth/login/', credentials),
//   register: (userData) => api.post('/auth/register/', userData),
//   logout: () => api.post('/auth/logout/'),
//   getCurrentUser: () => api.get('/auth/user/'),
//   changePassword: (data) => api.post('/auth/change-password/', data),
// };

// export const patientAPI = {
//   getPatients: () => api.get('/patients/'),
//   getPatient: (id) => api.get(`/patients/${id}/`),
//   createPatient: (data) => api.post('/patients/', data),
//   updatePatient: (id, data) => api.put(`/patients/${id}/`, data),
//   deletePatient: (id) => api.delete(`/patients/${id}/`),
//   searchPatients: (query) => api.get(`/patients/?search=${query}`),
//   getPatientStats: () => api.get('/patients/stats/'),
// };

// export const doctorAPI = {
//   getDoctors: () => api.get('/doctors/'),
//   getDoctor: (id) => api.get(`/doctors/${id}/`),
//   getDoctorDashboard: () => api.get('/doctors/dashboard/'),
//   getAvailableDoctors: () => api.get('/doctors/available/'),
//   updateDoctorProfile: (data) => api.put('/doctors/profile/', data),
// };

// export const prescriptionAPI = {
//   getPrescriptions: () => api.get('/prescriptions/'),
//   getPrescription: (id) => api.get(`/prescriptions/${id}/`),
//   createPrescription: (data) => api.post('/prescriptions/', data),
//   updatePrescription: (id, data) => api.put(`/prescriptions/${id}/`, data),
//   deletePrescription: (id) => api.delete(`/prescriptions/${id}/`),
//   getMedications: () => api.get('/prescriptions/medications/'),
//   getPatientPrescriptions: (patientId) => api.get(`/prescriptions/patient/${patientId}/`),
//   downloadPrescription: (id) => api.get(`/prescriptions/${id}/download/`, { responseType: 'blob' }),
// };

// export const labAPI = {
//   getLabRequests: () => api.get('/labs/requests/'),
//   getLabRequest: (id) => api.get(`/labs/requests/${id}/`),
//   createLabRequest: (data) => api.post('/labs/requests/', data),
//   updateLabRequest: (id, data) => api.put(`/labs/requests/${id}/`, data),
//   updateLabStatus: (id, status) => api.put(`/labs/requests/${id}/update-status/`, { status }),
//   uploadLabResult: (id, data) => api.put(`/labs/requests/${id}/upload-result/`, data, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   }),
//   getPatientLabRequests: (patientId) => api.get(`/labs/requests/patient/${patientId}/`),
//   getLabTests: () => api.get('/labs/tests/'),
// };

// export const medicationAPI = {
//   getMedications: () => api.get('/medicationManagment/medications/'),
//   getMedication: (id) => api.get(`/medicationManagment/medications/${id}/`),
//   createMedication: (data) => api.post('/medicationManagment/medications/', data),
//   updateMedication: (id, data) => api.put(`/medicationManagment/medications/${id}/`, data),
//   deleteMedication: (id) => api.delete(`/medicationManagment/medications/${id}/`),
//   markTaken: (id) => api.post(`/medicationManagment/medications/${id}/mark_taken/`),
//   skipDose: (id) => api.post(`/medicationManagment/medications/${id}/skip_dose/`),
//   getTodayDoses: () => api.get('/medicationManagment/doses/today/'),
//   getUpcomingDoses: () => api.get('/medicationManagment/doses/upcoming/'),
//   getReminders: () => api.get('/medicationManagment/reminders/'),
// };

// export const healthAPI = {
//   getVitals: () => api.get('/health/vitals/'),
//   getVital: (id) => api.get(`/health/vitals/${id}/`),
//   createVital: (data) => api.post('/health/vitals/', data),
//   updateVital: (id, data) => api.put(`/health/vitals/${id}/`, data),
//   deleteVital: (id) => api.delete(`/health/vitals/${id}/`),
//   getAlerts: () => api.get('/health/alerts/'),
//   createAlert: (data) => api.post('/health/alerts/', data),
//   updateAlert: (id, data) => api.put(`/health/alerts/${id}/`, data),
//   getPatientVitals: (patientId) => api.get(`/health/vitals/patient/${patientId}/`),
//   getVitalTrends: (patientId, vitalType) => api.get(`/health/vitals/trends/${patientId}/${vitalType}/`),
// };

// export const notificationAPI = {
//   getNotifications: () => api.get('/notifications/'),
//   markAsRead: (id) => api.put(`/notifications/${id}/mark-read/`),
//   sendNotification: (data) => api.post('/notifications/send/', data),
//   sendEmail: (data) => api.post('/notifications/send-email/', data),
//   sendSMS: (data) => api.post('/notifications/send-sms/', data),
// };

// export const fileAPI = {
//   uploadFile: (data) => api.post('/upload/', data, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   }),
//   downloadFile: (url) => api.get(url, { responseType: 'blob' }),
//   deleteFile: (id) => api.delete(`/files/${id}/`),
// };

// // Upload file with configurable timeout
// export const uploadFile = async (file, type = 'general', onProgress = null) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('type', type);
  
//   const config = {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//     timeout: UPLOAD_TIMEOUT,
//   };
  
//   if (onProgress) {
//     config.onUploadProgress = onProgress;
//   }
  
//   const response = await api.post('/upload/', formData, config);
//   return response.data;
// };

// // Download file
// export const downloadFile = async (url, filename) => {
//   const response = await api.get(url, {
//     responseType: 'blob',
//     timeout: UPLOAD_TIMEOUT,
//   });
  
//   const blob = new Blob([response.data]);
//   const downloadUrl = window.URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = downloadUrl;
//   link.setAttribute('download', filename);
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(downloadUrl);
// };


// // Test connection
// export const testConnection = async () => {
//   try {
//     const response = await api.get('/test/');
//     console.log('✅ Backend connection successful:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('❌ Backend connection failed:', error.message);
//     throw error;
//   }
// };

// // Health check
// export const healthCheck = () => api.get('/health/');

// export default api;