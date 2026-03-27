import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  list: [],
  currentPatient: null, // For viewing a single patient's profile/records
  status: 'idle', 
  error: null,
};

// Async Thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('patients/'); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchById',
  async (patientId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`patients/${patientId}/`); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearCurrentPatient: (state) => {
        state.currentPatient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Patients
      .addCase(fetchPatients.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Single Patient
      .addCase(fetchPatientById.pending, (state) => { state.status = 'loading'; state.currentPatient = null; })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPatient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPatient } = patientSlice.actions;
export default patientSlice.reducer;