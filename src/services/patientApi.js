import api from '../api/axiosClient';

const patientApi = {
  // Get patients
  getPatients: async (params = {}) => {
    try {
      const response = await api.get('patients/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get patient by ID
  getPatientById: async (id) => {
    try {
      const response = await api.get(`patients/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      const response = await api.patch(`patients/${id}/`, patientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },

  // Get patient medical records
  getPatientMedicalRecords: async (patientId) => {
    try {
      const response = await api.get(`patients/${patientId}/medical-records/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical records for patient ${patientId}:`, error);
      throw error;
    }
  },

  // Get patient appointments
  getPatientAppointments: async (patientId) => {
    try {
      const response = await api.get(`patients/${patientId}/appointments/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patientId}:`, error);
      throw error;
    }
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId) => {
    try {
      const response = await api.get(`patients/${patientId}/prescriptions/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching prescriptions for patient ${patientId}:`, error);
      throw error;
    }
  }
};

export { patientApi };