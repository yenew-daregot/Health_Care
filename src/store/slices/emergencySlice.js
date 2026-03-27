import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

const initialState = {
  alerts: [], // List of active or recent SOS alerts
  status: 'idle', 
  error: null,
};

// Async Thunk for Triggering SOS (Patient action)
export const triggerSOS = createAsyncThunk(
  'emergency/triggerSOS',
  async (locationData, { rejectWithValue }) => {
    try {
      // Assuming a POST to 'emergency/' endpoint
      const response = await axiosClient.post('emergency/', locationData); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk for fetching active alerts (Admin/Doctor action)
export const fetchActiveAlerts = createAsyncThunk(
  'emergency/fetchActiveAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('emergency/alerts/active/'); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    // Reducer to handle real-time alerts via WebSocket (used in your Chat/Emergency components)
    alertReceived: (state, action) => {
      state.alerts.unshift(action.payload); // Add new alert to the top
    },
    clearAlerts: (state) => {
      state.alerts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active Alerts
      .addCase(fetchActiveAlerts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchActiveAlerts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.alerts = action.payload;
      })
      .addCase(fetchActiveAlerts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Trigger SOS
      .addCase(triggerSOS.fulfilled, (state, action) => {
        // Log the successful trigger, but actual state update happens on alertReceived via WebSocket
        console.log('SOS triggered successfully:', action.payload);
      });
  },
});

export const { alertReceived, clearAlerts } = emergencySlice.actions;
export default emergencySlice.reducer;