// Medical Records API Service
const API_BASE_URL = '/api/medical-records';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to get auth headers for file upload
const getFileUploadHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type for file uploads - let browser set it
  };
};

// Medical Records API
export const medicalRecordsApi = {
  // Medical Records
  getMedicalRecords: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/records/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch medical records: ${response.statusText}`);
    }
    
    return response.json();
  },

  getMedicalRecord: async (id) => {
    const response = await fetch(`${API_BASE_URL}/records/${id}/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch medical record: ${response.statusText}`);
    }
    
    return response.json();
  },

  createMedicalRecord: async (data) => {
    const response = await fetch(`${API_BASE_URL}/records/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create medical record: ${response.statusText}`);
    }
    
    return response.json();
  },

  updateMedicalRecord: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/records/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update medical record: ${response.statusText}`);
    }
    
    return response.json();
  },

  deleteMedicalRecord: async (id) => {
    const response = await fetch(`${API_BASE_URL}/records/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete medical record: ${response.statusText}`);
    }
    
    return true;
  },

  getPatientMedicalRecords: async (patientId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/records/patient/${patientId}/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patient medical records: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Allergies
  getAllergies: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/allergies/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch allergies: ${response.statusText}`);
    }
    
    return response.json();
  },

  createAllergy: async (data) => {
    const response = await fetch(`${API_BASE_URL}/allergies/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create allergy: ${response.statusText}`);
    }
    
    return response.json();
  },

  updateAllergy: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/allergies/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update allergy: ${response.statusText}`);
    }
    
    return response.json();
  },

  deleteAllergy: async (id) => {
    const response = await fetch(`${API_BASE_URL}/allergies/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete allergy: ${response.statusText}`);
    }
    
    return true;
  },

  // Diagnoses
  getDiagnoses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/diagnoses/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch diagnoses: ${response.statusText}`);
    }
    
    return response.json();
  },

  createDiagnosis: async (data) => {
    const response = await fetch(`${API_BASE_URL}/diagnoses/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create diagnosis: ${response.statusText}`);
    }
    
    return response.json();
  },

  updateDiagnosis: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/diagnoses/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update diagnosis: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Medication History
  getMedicationHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/medications/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch medication history: ${response.statusText}`);
    }
    
    return response.json();
  },

  createMedicationHistory: async (data) => {
    const response = await fetch(`${API_BASE_URL}/medications/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create medication history: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Vital Signs
  getVitalSigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/vital-signs/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch vital signs: ${response.statusText}`);
    }
    
    return response.json();
  },

  createVitalSigns: async (data) => {
    const response = await fetch(`${API_BASE_URL}/vital-signs/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create vital signs: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Immunizations
  getImmunizations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/immunizations/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch immunizations: ${response.statusText}`);
    }
    
    return response.json();
  },

  createImmunization: async (data) => {
    const response = await fetch(`${API_BASE_URL}/immunizations/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create immunization: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Reports and Summaries
  getPatientSummary: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/summary/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patient summary: ${response.statusText}`);
    }
    
    return response.json();
  },

  getPatientTimeline: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patient/${patientId}/timeline/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patient timeline: ${response.statusText}`);
    }
    
    return response.json();
  },

  getHealthOverview: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/health-overview/`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch health overview: ${response.statusText}`);
    }
    
    return response.json();
  },

  // File Upload
  uploadMedicalRecordFile: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/records/upload-file/`, {
      method: 'POST',
      headers: getFileUploadHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
    
    return response.json();
  }
};

// Demo data for fallback when API is not available
export const demoMedicalRecords = {
  records: [
    {
      id: 1,
      record_type: 'consultation',
      title: 'Annual Physical Examination',
      description: 'Routine annual physical examination with comprehensive health assessment',
      date_recorded: '2024-01-15T10:00:00Z',
      priority: 'medium',
      patient: { id: 1, user: { first_name: 'John', last_name: 'Doe' } },
      doctor: { id: 1, user: { first_name: 'Dr. Sarah', last_name: 'Smith' } }
    },
    {
      id: 2,
      record_type: 'lab_result',
      title: 'Blood Work Results',
      description: 'Complete blood count and metabolic panel results',
      date_recorded: '2024-01-10T14:30:00Z',
      priority: 'high',
      patient: { id: 1, user: { first_name: 'John', last_name: 'Doe' } },
      doctor: { id: 1, user: { first_name: 'Dr. Sarah', last_name: 'Smith' } }
    }
  ],
  allergies: [
    {
      id: 1,
      allergen: 'Penicillin',
      allergen_type: 'drug',
      severity: 'severe',
      reaction: 'rash',
      symptoms: 'Skin rash and itching',
      is_active: true
    }
  ],
  diagnoses: [
    {
      id: 1,
      diagnosis_code: 'I10',
      description: 'Essential Hypertension',
      status: 'active',
      date_diagnosed: '2024-01-15',
      is_primary: true
    }
  ],
  medications: [
    {
      id: 1,
      medication_name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      route: 'oral',
      status: 'active',
      start_date: '2024-01-15'
    }
  ],
  vitalSigns: [
    {
      id: 1,
      recorded_date: '2024-01-15T10:00:00Z',
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      heart_rate: 72,
      temperature: 36.5,
      weight: 70.5,
      height: 175
    }
  ]
};

export default medicalRecordsApi;