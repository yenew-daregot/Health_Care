import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const labsApi = {
  // Lab Tests
  getLabTests: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/labs/tests/`, { params });
    return response.data;
  },

  getLabTest: async (testId) => {
    const response = await axios.get(`${API_BASE_URL}/labs/tests/${testId}/`);
    return response.data;
  },

  // Lab Requests
  getLabRequests: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/labs/requests/`, { params });
    return response.data;
  },

  createLabRequest: async (requestData) => {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(requestData).forEach(key => {
      if (requestData[key] !== null && requestData[key] !== undefined) {
        if (key === 'request_document' && requestData[key] instanceof File) {
          formData.append(key, requestData[key]);
        } else {
          formData.append(key, requestData[key]);
        }
      }
    });

    const response = await axios.post(`${API_BASE_URL}/labs/requests/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getLabRequest: async (requestId) => {
    const response = await axios.get(`${API_BASE_URL}/labs/requests/${requestId}/`);
    return response.data;
  },

  updateLabRequestStatus: async (requestId, statusData) => {
    const response = await axios.patch(
      `${API_BASE_URL}/labs/requests/${requestId}/update-status/`,
      statusData
    );
    return response.data;
  },

  assignLaboratorist: async (requestId, laboratoristId) => {
    const response = await axios.patch(
      `${API_BASE_URL}/labs/requests/${requestId}/assign-laboratorist/`,
      { laboratorist_id: laboratoristId }
    );
    return response.data;
  },

  // Lab Results
  createOrUpdateLabResult: async (requestId, resultData) => {
    const formData = new FormData();
    
    Object.keys(resultData).forEach(key => {
      if (resultData[key] !== null && resultData[key] !== undefined) {
        if (key === 'result_document' && resultData[key] instanceof File) {
          formData.append(key, resultData[key]);
        } else if (key === 'result_values' && typeof resultData[key] === 'object') {
          formData.append(key, JSON.stringify(resultData[key]));
        } else {
          formData.append(key, resultData[key]);
        }
      }
    });

    const response = await axios.post(
      `${API_BASE_URL}/labs/requests/${requestId}/result/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // User-specific requests
  getPatientLabRequests: async (patientId) => {
    const response = await axios.get(`${API_BASE_URL}/labs/patient/${patientId}/`);
    return response.data;
  },

  getDoctorLabRequests: async (doctorId) => {
    const response = await axios.get(`${API_BASE_URL}/labs/doctor/${doctorId}/`);
    return response.data;
  },

  getLaboratoristLabRequests: async (laboratoristId) => {
    const response = await axios.get(`${API_BASE_URL}/labs/laboratorist/${laboratoristId}/`);
    return response.data;
  },

  // Utility functions
  getLaboratorists: async () => {
    const response = await axios.get(`${API_BASE_URL}/labs/laboratorists/`);
    return response.data;
  },

  searchUsers: async (query, type = '') => {
    const response = await axios.get(`${API_BASE_URL}/labs/search-users/`, {
      params: { q: query, type }
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/labs/dashboard-stats/`);
    return response.data;
  },

  // File download
  downloadLabResult: async (requestId) => {
    const response = await axios.get(
      `${API_BASE_URL}/labs/requests/${requestId}/`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Bulk operations
  bulkUpdateRequests: async (requestIds, updateData) => {
    const promises = requestIds.map(id => 
      labsApi.updateLabRequestStatus(id, updateData)
    );
    return Promise.all(promises);
  }
};

export default labsApi;