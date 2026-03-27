
// import api from './api/axiosClient';

// const doctorApi = {
//   // ✅ CORRECT: /api/doctors/dashboard/
//   getDoctorDashboard: async () => {
//     try {
//       console.log('🎯 Fetching doctor dashboard...');
//       const response = await api.get('doctors/dashboard/');
//       console.log('✅ Dashboard response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Dashboard error:', error.response?.status, error.message);
//       throw error;
//     }
//   },

//   // ✅ CORRECT: /api/doctors/appointments/ 
//   getDoctorAppointments: async (params = {}) => {
//     try {
//       console.log('🎯 Fetching doctor appointments...');
//       const response = await api.get('doctors/appointments/', { params });
//       console.log('✅ Appointments response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Appointments error:', error.response?.status, error.message);
//       throw error;
//     }
//   },

//   // ✅ CORRECT: /api/doctors/profile/
//   getDoctorProfile: async () => {
//     try {
//       console.log('🎯 Fetching doctor profile...');
//       const response = await api.get('doctors/profile/');
//       console.log('✅ Profile response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('❌ Profile error:', error.response?.status, error.message);
//       throw error;
//     }
//   },

//   // Get all doctors
//   getAllDoctors: async (params = {}) => {
//     try {
//       const response = await api.get('doctors/', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching doctors:', error);
//       throw error;
//     }
//   },

//   // Get available doctors
//   getAvailableDoctors: async () => {
//     try {
//       const response = await api.get('doctors/available/');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching available doctors:', error);
//       throw error;
//     }
//   },

//   // Update doctor profile
//   updateDoctorProfile: async (profileData) => {
//     try {
//       const response = await api.patch('doctors/profile/', profileData);
//       return response.data;
//     } catch (error) {
//       console.error('Error updating doctor profile:', error);
//       throw error;
//     }
//   }
// };

// export { doctorApi };