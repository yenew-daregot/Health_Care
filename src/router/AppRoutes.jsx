import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute'; 
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/error/Unauthorized';
import NotFound from '../pages/error/NotFound';
import HomePage from '../pages/landing/HomePage'; 
import AboutPage from '../pages/landing/AboutPage';
import ContactPage from '../pages/landing/ContactPage';

// Layouts
import PatientLayout from '../layouts/PatientLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import AdminLayout from '../layouts/AdminLayout';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import EmergencySOS from '../pages/patient/EmergencySOS';
import BookAppointment from '../pages/patient/BookAppointment'; 
import PatientAppointments from '../pages/patient/PatientAppointments';
// import MedicalHistory from '../pages/patient/MedicalHistory';
import MedicalRecords from '../pages/patient/MedicalRecords';
import AvailableDoctors from '../pages/patient/AvailableDoctors';
import PatientDoctorProfile from '../pages/patient/PatientDoctorProfile';
import MyPrescriptions from '../pages/patient/MyPrescriptions';
import LabResults from '../pages/patient/LabResults';
import PatientMessages from '../pages/patient/PatientMessages';
import PatientBilling from '../pages/patient/PatientBilling';


// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import AppointmentRequests from '../pages/doctor/AppointmentRequests';
import DoctorMessages from '../pages/doctor/DoctorMessages'; 
import WritePrescription from '../pages/doctor/WritePrescription';
import LabTestRequest from '../pages/doctor/LabTestRequest';
import LabTestResult from '../pages/doctor/LabTestResult';
import EmergencyRequested from '../pages/doctor/EmergencyRequested';
import HealthMonitoring from '../pages/doctor/HealthMonitoring';
import DoctorProfile from '../pages/doctor/DoctorProfile';
import DoctorSchedule from '../pages/doctor/DoctorSchedule';
import DoctorPatients from '../pages/doctor/DoctorPatients';
import DoctorSettings from '../pages/doctor/DoctorSettings';
import DoctorReports from '../pages/doctor/DoctorReports';
import DoctorAppointmentsManagment from '../pages/doctor/DoctorAppointmentsManagment';
import DoctorMedicalRecords from '../pages/doctor/MedicalRecords';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import AllAppointments from '../pages/admin/AllAppointments';
import MedicationsManagement from '../pages/admin/MedicationsManagement';
import Departments from '../pages/admin/Departments';
// import MedicalRecords from '../pages/admin/MedicalRecords';
import AdminMedicalRecords from '../pages/admin/AdminMedicalRecords';
import EmergencyRequests from '../pages/admin/EmergencyRequests';
import AdminBilling from '../pages/admin/AdminBilling';
import SystemAnalytics from '../pages/admin/SystemAnalytics';

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper function to get user role for redirects
  const getUserRolePath = () => {
    if (!user) return 'patient';
    const role = user?.role?.toLowerCase() || user?.user_type?.toLowerCase();
    
    if (role === 'admin' || role === 'administrator') return 'admin';
    if (role === 'doctor' || role === 'physician') return 'doctor';
    if (role === 'nurse') return 'nurse';
    if (role === 'staff') return 'staff';
    return 'patient'; // default
  };

  return (
    <Routes>
      {/* 🔓 Public/Auth Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={`/${getUserRolePath()}/dashboard`} replace /> : <Login />
      } />
      
      <Route path="/register" element={
        isAuthenticated ? <Navigate to={`/${getUserRolePath()}/dashboard`} replace /> : <Register />
      } />
      
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Home Page - Redirect based on auth status */}
      <Route path="/" element={
        isAuthenticated ? 
          <Navigate to={`/${getUserRolePath()}/dashboard`} replace /> : 
          <HomePage />
      } />
      
      {/* Dashboard Redirect Route */}
      <Route path="/dashboard" element={
        isAuthenticated ? 
          <Navigate to={`/${getUserRolePath()}/dashboard`} replace /> : 
          <Navigate to="/login" replace />
      } />

      {/* 🔒 Protected Routes using Layout Nesting */}
      
      {/* Patient Routes (/patient/)*/}
      <Route element={
        <ProtectedRoute roles={['PATIENT']}>
          <PatientLayout>
            <Outlet />
          </PatientLayout>
        </ProtectedRoute>
      }>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        {/* <Route path="/patient/medical-history" element={<MedicalHistory />} /> */}
        <Route path="/patient/emergency" element={<EmergencySOS />} />
        <Route path="/patient/my-prescriptions" element={<MyPrescriptions/>} />
        <Route path="/patient/lab-results" element={<LabResults />} />
        <Route path="/patient/messages" element={<PatientMessages />} />
        <Route path="/patient/medical-records" element={<MedicalRecords />} />
        <Route path="/patient/billing" element={<PatientBilling />} />
        {/*For browsing available doctors (this should navigate to book-appointment without doctorId)*/}
        <Route path="/patient/doctors" element={<AvailableDoctors />} />
        {/*For patients to book appointments*/}
        <Route path="/patient/book-appointment/:doctorId?" element={<BookAppointment />} />
        {/*Doctor profile page that has a "Book Appointment" button*/}
        <Route path="/patient/doctors/:doctorId" element={<PatientDoctorProfile />} />
      </Route>

      {/*Doctor Routes (/doctor/)*/}
      <Route element={
        <ProtectedRoute roles={['DOCTOR']}>
          <DoctorLayout>
            <Outlet />
          </DoctorLayout>
        </ProtectedRoute>
      }>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/DoctorAppointmentsManagment" element={<DoctorAppointmentsManagment />} />
        <Route path="/doctor/appointments/manage" element={<DoctorAppointmentsManagment />} /> 
        <Route path="/doctor/DoctorAppointmentsManagment/:appointmentId" element={<DoctorAppointmentsManagment />} /> 
        <Route path="/doctor/appointment-requests" element={<AppointmentRequests />} />
        <Route path="/doctor/appointments/requests" element={<AppointmentRequests />} />
        <Route path="/doctor/prescription" element={<WritePrescription />} />
        <Route path="/doctor/prescriptions" element={<WritePrescription />} />
        <Route path="/doctor/lab-requests" element={<LabTestRequest />} />
        <Route path="/doctor/lab-results" element={<LabTestResult />} />
        <Route path="/doctor/chat" element={<DoctorMessages />} />
        <Route path="/doctor/messages" element={<DoctorMessages />} />
        <Route path="/doctor/schedule" element={<DoctorSchedule/>} />
        <Route path="/doctor/patients" element={<DoctorPatients />} /> 
        <Route path="/doctor/settings" element={<DoctorSettings />} /> 
        <Route path="/doctor/reports" element={<DoctorReports />} />
        <Route path="/doctor/emergency-button" element={<EmergencyRequested/>} />
        <Route path="/doctor/medical-records" element={<DoctorMedicalRecords />} />
        <Route path="/doctor/vitals" element={<HealthMonitoring/>} />
      </Route>
        
      {/*Admin Routes (/admin/...) */}
      <Route element={
        <ProtectedRoute roles={['ADMIN']}>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/appointments" element={<AllAppointments />} />
        <Route path="/admin/medication" element={<MedicationsManagement />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/records" element={<AdminMedicalRecords />} />
        <Route path="/admin/emergencies" element={<EmergencyRequests />} />
        <Route path="/admin/billing" element={<AdminBilling />} />
        <Route path="/admin/system-analytics" element={<SystemAnalytics />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;