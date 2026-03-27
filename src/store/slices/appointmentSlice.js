import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('appointments/'); 
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.detail || 'Failed to fetch appointments'
      });
    }
  }
);

// Updated slice to handle paginated response
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    list: [],
    pagination: {
      count: 0,
      next: null,
      previous: null,
      currentPage: 1
    },
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAppointments: (state) => {
      state.list = [];
      state.pagination = {
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
      };
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle paginated response
        if (action.payload.results !== undefined) {
          state.list = action.payload.results; // Store the actual data
          state.pagination = {
            count: action.payload.count || 0,
            next: action.payload.next,
            previous: action.payload.previous,
            currentPage: 1
          };
        } else {
          // If not paginated, store directly
          state.list = action.payload;
          state.pagination = {
            count: action.payload.length || 0,
            next: null,
            previous: null,
            currentPage: 1
          };
        }
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearAppointments, setPage } = appointmentSlice.actions;
export default appointmentSlice.reducer;