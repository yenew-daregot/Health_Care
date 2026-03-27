# Appointment Booking System

## Overview
A comprehensive appointment booking system that allows patients to book appointments with doctors and sends notifications to the selected doctors.

## Components

### 1. BookAppointment.jsx
Main appointment booking component with a 4-step wizard:
- **Step 1**: Select Doctor
- **Step 2**: Choose Date & Time
- **Step 3**: Appointment Details
- **Step 4**: Confirmation

### 2. DoctorSelection.jsx
- Browse available doctors
- Filter by specialization
- Search by name or specialization
- View doctor profiles, ratings, and availability

### 3. TimeSlotSelection.jsx
- Calendar date picker
- Available time slots display
- Real-time availability checking
- Time slot grouping (Morning, Afternoon, Evening)

### 4. AppointmentForm.jsx
- Appointment type selection
- Reason for visit (required)
- Additional notes
- Priority setting
- Urgent appointment toggle

### 5. AppointmentConfirmation.jsx
- Complete appointment summary
- Patient and doctor information
- Final confirmation before booking

### 6. PatientAppointments.jsx
- View all patient appointments
- Filter by status (Upcoming, Today, Past, All)
- Appointment management (Cancel, Reschedule)
- Quick actions menu

### 7. AppointmentNotification.jsx
- Automatic notification to doctors
- Toast notifications for users
- Integration with notification system

## Features

### For Patients:
- ✅ Browse and select doctors
- ✅ View doctor profiles and ratings
- ✅ Check real-time availability
- ✅ Book appointments with detailed information
- ✅ View appointment history
- ✅ Cancel and reschedule appointments
- ✅ Urgent appointment requests
- ✅ Multiple appointment types

### For Doctors:
- ✅ Receive notifications for new appointments
- ✅ View appointment requests
- ✅ Confirm or decline appointments
- ✅ Manage availability slots

### System Features:
- ✅ Real-time availability checking
- ✅ Automatic notifications
- ✅ Responsive design
- ✅ Error handling and validation
- ✅ Loading states and feedback
- ✅ Integration with backend APIs

## API Integration

### Appointments API:
- `createAppointment()` - Book new appointment
- `getPatientAppointments()` - Get patient's appointments
- `getAvailableSlots()` - Check doctor availability
- `cancelAppointment()` - Cancel appointment
- `updateAppointment()` - Reschedule appointment

### Doctors API:
- `getAvailableDoctors()` - Get available doctors
- `getDoctor()` - Get doctor details
- `getSpecializations()` - Get specializations

### Patients API:
- `getProfile()` - Get patient profile
- `createProfile()` - Create patient profile

### Notifications API:
- `createNotification()` - Send notifications

## Usage

### Booking an Appointment:
1. Navigate to `/patient/doctors` to browse doctors
2. Click "Book Appointment" or go to `/patient/book-appointment/:doctorId`
3. Follow the 4-step wizard
4. Receive confirmation and notification

### Managing Appointments:
1. Go to `/patient/appointments`
2. View appointments by status
3. Use action menu for cancel/reschedule
4. Get real-time updates

## Routes

- `/patient/doctors` - Browse doctors
- `/patient/book-appointment/:doctorId?` - Book appointment
- `/patient/appointments` - View appointments
- `/patient/doctors/:doctorId` - Doctor profile

## Dependencies

- Material-UI components
- React Router for navigation
- date-fns for date formatting
- React Hot Toast for notifications
- Backend API integration

## Backend Requirements

The system expects these backend endpoints:
- `POST /api/appointments/` - Create appointment
- `GET /api/appointments/patients/{id}/` - Get patient appointments
- `GET /api/appointments/doctors/{id}/slots/` - Get available slots
- `GET /api/doctors/available/` - Get available doctors
- `GET /api/doctors/specializations/` - Get specializations
- `POST /api/notifications/` - Send notifications

## Future Enhancements

- Video call integration
- Payment processing
- Appointment reminders
- Calendar sync
- Multi-language support
- Advanced filtering options
- Appointment templates
- Bulk operations