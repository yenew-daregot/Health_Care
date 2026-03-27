import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

// Define navigation links based on user role
const navConfigs = {
  ADMIN: [
    { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Manage Users' },
    { to: '/admin/appointments', icon: '📅', label: 'All Appointments' },
    { to: '/admin/medication', icon: '💊', label: 'Medication' }, 
    { to: '/admin/departments', icon: '🩺', label: 'Departments' },
    { to: '/admin/records', label: 'Medical Records', icon: '📋' },
    { to: '/admin/emergencies', label: 'Emergency', icon: '🚨' },
    { to: '/admin/billing', label: 'Billing', icon: '💰' },
    { to: '/admin/system-analytics', icon: '📈', label: 'System Analytics' },
  ],
  DOCTOR: [
    { to: '/doctor/dashboard', icon: '🩺', label: 'Dashboard' },
    { to: '/doctor/DoctorAppointmentsManagment', icon: '📝', label: 'Appointment Management' },
    { to: '/doctor/medical-records', icon: '📋', label: 'Medical Records' },
    { to: '/doctor/messages', icon: '💬', label: 'Messages' },
    { to: '/doctor/prescription', icon: '💊', label: 'Write Prescription' },
    { to: '/doctor/lab-requests', icon: '🧪', label: 'Lab Requests' },
    { to: '/doctor/lab-results', icon: '🔬', label: 'Lab Results' },
    { to: '/doctor/schedule', icon: '📅', label: 'Schedule' },
    { to: '/doctor/emergency-button', icon: '🚨', label: 'Emergency Requests' },
    { to: '/doctor/vitals', label: 'Health Monitoring', icon: '❤️' },
  ],
  PATIENT: [
    { to: '/patient/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/patient/book-appointment', icon: '📅', label: 'Book Appointment' }, // CHANGED
    { to: '/patient/medical-records', icon: '📋', label: 'Medical Records' },
    { to: '/patient/emergency', icon: '🚨', label: 'Emergency SOS' }, // CHANGED
    { to: '/patient/my-prescriptions', icon: '💊', label: 'My Prescriptions' }, // CHANGED
    { to: '/patient/lab-results', label: 'Lab Results', icon: '🔬' },
    { to: '/patient/billing', label: 'Billing', icon: '💰' },
    { to: '/patient/messages', label: 'Messages', icon: '💬' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role;
  const navLinks = navConfigs[role] || [];
  
  if (!role) return null;

  return (
    <div className="sidebar">
      {/* Fixed Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">HealthCare</h1>
      </div>
      
      {/* Scrollable Content */}
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              end={link.to === '/patient/dashboard' || link.to === '/doctor/dashboard' || link.to === '/admin/dashboard'}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Fixed Footer */}
      <div className="sidebar-footer">
        <p className="user-info">Logged in as: {user?.full_name || role}</p>
        <button 
          onClick={logout} 
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;