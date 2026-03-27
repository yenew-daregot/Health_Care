import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import appointmentSlice from './slices/appointmentSlice';
import patientSlice from './slices/patientSlice';
import medicationSlice from './slices/medicationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointments: appointmentSlice,
    patients: patientSlice,
    medications: medicationSlice,
  },
});