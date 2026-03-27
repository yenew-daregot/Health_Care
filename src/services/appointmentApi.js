// import api from './api/axiosClient';

// const appointmentApi = {
//   getDoctorAppointments: async (params = {}) => {
//     try {
//       console.log('🎯 Fetching appointments via doctors endpoint...');
//       const response = await api.get('doctors/appointments/', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching doctor appointments:', error);
      
//       // Fallback to generic appointments endpoint
//       try {
//         console.log('🔄 Trying fallback appointments endpoint...');
//         const fallbackResponse = await api.get('appointments/', { params });
//         return fallbackResponse.data;
//       } catch (fallbackError) {
//         console.error('Fallback also failed:', fallbackError);
//         throw error;
//       }
//     }
//   },

//   // Generic appointments endpoint
//   getAllAppointments: async (params = {}) => {
//     try {
//       const response = await api.get('appointments/', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching appointments:', error);
//       throw error;
//     }
//   },
//   // Create appointment (for patients)
//   createAppointment: async (appointmentData) => {
//     try {
//       const response = await api.post('appointments/', appointmentData);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating appointment:', error);
//       throw error;
//     }
//   },

//   // Get appointment by ID
//   getAppointmentById: async (id) => {
//     try {
//       const response = await api.get(`appointments/${id}/`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching appointment ${id}:`, error);
//       throw error;
//     }
//   },

//   // Update appointment (general update)
//   updateAppointment: async (id, appointmentData) => {
//     try {
//       const response = await api.patch(`appointments/${id}/`, appointmentData);
//       return response.data;
//     } catch (error) {
//       console.error(`Error updating appointment ${id}:`, error);
//       throw error;
//     }
//   },

//   // Update appointment status (admin/doctor action)
//   updateAppointmentStatus: async (id, status, cancellationReason = '') => {
//     try {
//       const data = { status };
//       if (cancellationReason) {
//         data.cancellation_reason = cancellationReason;
//       }
//       const response = await api.patch(`appointments/${id}/`, data);
//       return response.data;
//     } catch (error) {
//       console.error(`Error updating appointment status ${id}:`, error);
//       throw error;
//     }
//   },

//   // Cancel appointment
//   cancelAppointment: async (id, reason = '') => {
//     try {
//       const response = await api.post(`appointments/${id}/cancel/`, {
//         cancellation_reason: reason
//       });
//       return response.data;
//     } catch (error) {
//       console.error(`Error cancelling appointment ${id}:`, error);
//       throw error;
//     }
//   },

//   // Delete appointment (admin only)
//   deleteAppointment: async (id) => {
//     try {
//       const response = await api.delete(`appointments/${id}/`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error deleting appointment ${id}:`, error);
//       throw error;
//     }
//   },

//   // Get today's appointments
//   getTodayAppointments: async () => {
//     try {
//       const response = await api.get('appointments/today/');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching today\'s appointments:', error);
//       throw error;
//     }
//   },

//   // Get upcoming appointments
//   getUpcomingAppointments: async () => {
//     try {
//       const response = await api.get('appointments/upcoming/');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching upcoming appointments:', error);
//       throw error;
//     }
//   },

//   // Get available slots for a doctor
//   getAvailableSlots: async (doctorId, date) => {
//     try {
//       const response = await api.get(`appointments/doctors/${doctorId}/slots/`, {
//         params: { date }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching available slots:', error);
//       throw error;
//     }
//   },

//   // Get patient appointments
//   getPatientAppointments: async (patientId) => {
//     try {
//       const response = await api.get(`appointments/patients/${patientId}/`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching patient appointments:', error);
//       throw error;
//     }
//   }
// };

// export { appointmentApi };