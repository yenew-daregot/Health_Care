import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import medicationApi from '../../api/medicationApi';

export const fetchMedications = createAsyncThunk(
  'medications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await medicationApi.getMedications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createMedication = createAsyncThunk(
  'medications/create',
  async (medicationData, { rejectWithValue }) => {
    try {
      const response = await medicationApi.createMedication(medicationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markMedicationTaken = createAsyncThunk(
  'medications/markTaken',
  async (medicationId, { rejectWithValue }) => {
    try {
      await medicationApi.markTaken(medicationId);
      return medicationId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const medicationSlice = createSlice({
  name: 'medications',
  initialState: {
    medications: [],
    todayDoses: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = action.payload;
      })
      .addCase(fetchMedications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMedication.fulfilled, (state, action) => {
        state.medications.push(action.payload);
      })
      .addCase(markMedicationTaken.fulfilled, (state, action) => {
        const medication = state.medications.find(m => m.id === action.payload);
        if (medication) {
          medication.last_taken = new Date().toISOString();
        }
      });
  },
});

export const { clearError } = medicationSlice.actions;
export default medicationSlice.reducer;