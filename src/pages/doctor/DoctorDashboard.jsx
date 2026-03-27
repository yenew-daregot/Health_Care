import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, MessageSquare, Stethoscope, Bell,
  Clock, Check, X, DollarSign, TrendingUp, Users,
  FileText, Activity, AlertCircle, ChevronRight,
  Heart, Star, Download, Settings, LogOut, Home,
  RefreshCw, List, TestTube, FlaskConical, Microscope
} from 'lucide-react';
import doctorsApi from '../../api/doctorsApi';
import labsApi from '../../api/labsApi';
import './doctorDashboard.css';
import './labQuickActions.css';

// Reusable IconCard Component
const IconCard = ({ icon: Icon, title, value, subtext, color = 'icon-card-primary', loading, onClick }) => (
  <div 
    className={`icon-card ${color} ${onClick ? 'clickable' : ''}`}
    onClick={onClick}
  >
    <div className="icon-card-content">
      <div>
        {loading ? (
          <div className="skeleton-loader" style={{ width: '60px', height: '24px' }}></div>
        ) : (
          <div className="icon-card-value">{value}</div>
        )}
        <div className="icon-card-title">{title}</div>
        {subtext && <div className="icon-card-subtext">{subtext}</div>}
      </div>
      <Icon className="icon-card-icon" />
    </div>
  </div>
);

// Appointment Item Component
const AppointmentItem = ({ appointment, onAction, onViewDetails }) => {
  const getStatusColor = (status) => {
    if (!status) return 'status-pending'; 
    
    const statusLower = status.toLowerCase();
    
    switch(statusLower) {
      case 'confirmed':
      case 'completed':
      case 'scheduled':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
      case 'rejected':
      case 'cancelled_by_patient':
      case 'cancelled_by_doctor':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  // Safely extract data from appointment object
  const safeAppointment = appointment || {};
  
  const formatTime = (time) => {
    if (!time) return '--:--';
    if (typeof time === 'string') {
      // Handle time string
      const timeStr = time.includes('+') ? time.split('+')[0] : time;
      const [hours, minutes] = timeStr.split(':');
      if (hours && minutes) {
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
      }
    }
    return '--:--';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const patientName = safeAppointment.patient?.name || 
                     safeAppointment.patient?.full_name || 
                     (safeAppointment.patient?.user ? 
                       `${safeAppointment.patient.user.first_name || ''} ${safeAppointment.patient.user.last_name || ''}`.trim() 
                       : 'Patient');

  return (
    <div className="list-item appointment-item">
      <div className="list-item-content">
        <div className="appointment-header">
          <div className="appointment-time">
            <Clock className="icon-card-icon mr-2" size={16} />
            <div className="time-display">
              <div className="time-main">{formatDate(safeAppointment.appointment_date)}</div>
              <div className="time-sub">{formatTime(safeAppointment.appointment_time)}</div>
            </div>
          </div>
          <div className="appointment-info">
            <h3 className="list-item-title">
              {patientName}
            </h3>
            <p className="list-item-subtitle">
              {safeAppointment.appointment_type || 'Consultation'}
              {safeAppointment.reason && ` • ${safeAppointment.reason.substring(0, 40)}${safeAppointment.reason.length > 40 ? '...' : ''}`}
            </p>
          </div>
        </div>
        <div className="appointment-actions">
          <span className={`status-badge ${getStatusColor(safeAppointment.status)}`}>
            {safeAppointment.status?.replace('_', ' ') || 'Pending'}
          </span>
          
          {/* Action buttons based on status */}
          {safeAppointment.status === 'pending' && (
            <div className="action-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(safeAppointment.id, 'confirmed');
                }}
                className="action-btn action-btn-success"
                title="Confirm Appointment"
              >
                <Check className="action-btn-icon" size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(safeAppointment.id, 'cancelled');
                }}
                className="action-btn action-btn-danger"
                title="Cancel Appointment"
              >
                <X className="action-btn-icon" size={16} />
              </button>
            </div>
          )}
          
          {/* View Details button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(safeAppointment);
            }}
            className="view-details-btn"
            title="View Details"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    doctor_info: {},
    quick_stats: {},
    appointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [labStats, setLabStats] = useState({
    total_requests: 0,
    pending: 0,
    completed: 0,
    urgent_pending: 0
  });
  
  // Safely extract user properties with defaults
  const safeUser = user || {};
  const userFirstName = safeUser.first_name || safeUser.firstName || '';
  const userLastName = safeUser.last_name || safeUser.lastName || '';
  const userRole = safeUser.role || '';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // 1. Check if user is a doctor
      const isDoctorRole = userRole.toLowerCase() === 'doctor';
      setIsDoctor(isDoctorRole);
      
      if (!isDoctorRole) {
        setError('Access denied. Doctor role required.');
        setLoading(false);
        return;
      }
      
      // 2. Try to get doctor profile first
      let profile = null;
      try {
        console.log('Fetching doctor profile...');
        const profileResponse = await doctorsApi.getProfile();
        if (profileResponse.data) {
          profile = profileResponse.data;
          setDoctorProfile(profile);
          console.log('Doctor profile loaded:', profile);
        }
      } catch (profileError) {
        console.warn('Could not fetch doctor profile:', profileError);
        // Create fallback profile
        profile = {
          full_name: `${userFirstName} ${userLastName}`.trim() || 'Dr. Smith',
          specialization: { name: 'General Medicine' },
          consultation_fee: 500,
          years_of_experience: 5,
          is_available: true
        };
        setDoctorProfile(profile);
      }
      
      // 3. Try to fetch appointments using the doctor appointments endpoint
      let appointments = [];
      try {
        console.log('Fetching appointments...');
        const appointmentsResponse = await doctorsApi.getAppointments({
          page_size: 10,
          status: 'pending,confirmed,scheduled'
        });
        
        console.log('Appointments API response:', appointmentsResponse.data);
        
        if (appointmentsResponse.data && appointmentsResponse.data.results) {
          appointments = appointmentsResponse.data.results;
        } else if (appointmentsResponse.data && Array.isArray(appointmentsResponse.data)) {
          appointments = appointmentsResponse.data;
        }
        
        console.log('Processed appointments:', appointments);
        
      } catch (appointmentsError) {
        console.warn('Could not fetch appointments:', appointmentsError);
        
        // Provide more specific error messages
        if (appointmentsError.response?.status === 403) {
          console.log('Access denied to appointments. User may not have doctor permissions.');
        } else if (appointmentsError.response?.status === 404) {
          console.log('Appointments endpoint not found. Using fallback data.');
        } else if (appointmentsError.response?.status === 401) {
          console.log('Authentication required for appointments.');
        } else {
          console.log('Network or server error accessing appointments.');
        }
        
        // Don't set error for appointments failure, just continue with empty appointments
        appointments = [];
      }
      
      // 4. Fetch lab statistics
      try {
        console.log('Fetching lab statistics...');
        const labStatsResponse = await labsApi.getDashboardStats();
        if (labStatsResponse) {
          setLabStats(labStatsResponse);
          console.log('Lab statistics loaded:', labStatsResponse);
        }
      } catch (labError) {
        console.warn('Could not fetch lab statistics:', labError);
        // Set default lab stats
        setLabStats({
          total_requests: 0,
          pending: 0,
          completed: 0,
          urgent_pending: 0
        });
      }
      
      // 4. Calculate today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayApps = appointments.filter(apt => 
        apt.appointment_date === today
      );
      setTodaysAppointments(todayApps);
      
      // 5. Calculate stats from appointments
      const stats = {
        today_patients: todayApps.length,
        completed_appointments: appointments.filter(apt => 
          apt.status === 'completed'
        ).length,
        pending_appointments: appointments.filter(apt => 
          apt.status === 'pending'
        ).length,
        monthly_revenue: (profile?.consultation_fee || 500) * 20, // Estimate
        total_patients: new Set(appointments.map(apt => apt.patient?.id)).size
      };
      
      // 6. Prepare final dashboard data
      const finalData = {
        doctor_info: {
          full_name: profile?.full_name || `${userFirstName} ${userLastName}`.trim(),
          specialization: profile?.specialization?.name || 
                        profile?.specialization_name || 
                        'General Medicine',
          consultation_fee: profile?.consultation_fee || 500,
          years_of_experience: profile?.years_of_experience || 5,
          rating: profile?.rating || 4.5,
          reviews_count: profile?.reviews_count || 0,
          is_available: profile?.is_available !== false
        },
        quick_stats: stats,
        appointments: appointments,
        doctor_id: profile?.id
      };
      
      console.log('Final dashboard data:', finalData);
      setDashboardData(finalData);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
      
      // Set fallback data
      setDashboardData(getFallbackData());
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user: safeUser });
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
    
    // Set up refresh interval
    const interval = setInterval(fetchDashboardData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      console.log(`Updating appointment ${appointmentId} to ${action}`);
      
      // In a real app, you would make an API call here
      // For now, update local state
      setDashboardData(prev => ({
        ...prev,
        appointments: (prev.appointments || []).map(apt =>
          apt.id === appointmentId ? { ...apt, status: action } : apt
        )
      }));
      
      // Update today's appointments
      setTodaysAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: action } : apt
        )
      );
      
      alert(`Appointment ${action} successfully!`);
      
      // Refresh data
      setTimeout(() => fetchDashboardData(), 1000);
      
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment. Please try again.');
    }
  };

  const handleViewAppointmentDetails = (appointment) => {
    if (appointment && appointment.id) {
      // Navigate to appointments management with the specific appointment selected
      navigate('/doctor/appointments/manage', { 
        state: { 
          selectedAppointmentId: appointment.id,
          appointment: appointment 
        } 
      });
    } else {
      navigate('/doctor/appointments/manage');
    }
  };

  const handleViewAllAppointments = (filter) => {
    // Navigate to appointments management page with optional filter
    navigate('/doctor/appointments/manage', { 
      state: { 
        initialFilter: filter 
      } 
    });
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'schedule':
        navigate('/doctor/schedule');
        break;
      case 'patients':
        navigate('/doctor/patients');
        break;
      case 'prescriptions':
        navigate('/doctor/prescriptions');
        break;
      case 'messages':
        navigate('/doctor/messages');
        break;
      case 'profile':
        navigate('/doctor/profile');
        break;
      case 'settings':
        navigate('/doctor/settings');
        break;
      case 'reports':
        navigate('/doctor/reports');
        break;
      case 'appointments':
        navigate('/doctor/appointments/manage');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const retryFetch = () => {
    fetchDashboardData();
  };

  // Show access denied if not a doctor
  if (!isDoctor && !loading && userRole) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <AlertCircle size={64} className="error-icon" color="#dc2626" />
          <h1 className="access-denied-title">403 - Access Denied</h1>
          <p className="access-denied-message">
            You don't have permission to access the doctor dashboard.
          </p>
          <p className="access-denied-subtext">
            Your role: {userRole}. Please log in with a doctor account.
          </p>
          <div className="access-denied-actions">
            <button onClick={handleGoHome} className="btn btn-primary">
              <Home size={18} className="mr-2" />
              Go Home
            </button>
            <button onClick={handleLogout} className="btn btn-outline">
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton-header">
          <div className="skeleton-title" style={{ width: '300px', height: '40px' }}></div>
          <div className="skeleton-subtitle" style={{ width: '200px', height: '20px' }}></div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card" style={{ height: '100px' }}></div>
          ))}
        </div>
        <div className="main-grid">
          <div className="skeleton-content" style={{ height: '400px' }}></div>
          <div className="skeleton-sidebar" style={{ height: '400px' }}></div>
        </div>
      </div>
    );
  }

  const { 
    doctor_info = {}, 
    quick_stats = {}
  } = dashboardData;

  // Safely extract doctor info
  const doctorFullName = doctor_info.full_name || 'Doctor';
  const doctorFirstName = doctorFullName.split(' ')[0] || 'Doctor';

  return (
    <div className="dashboard-container">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={retryFetch} className="btn-link">
            <RefreshCw size={16} className="mr-1" />
            Retry
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">
              Welcome, {doctorFirstName}!
            </h1>
            <p className="dashboard-subtitle">
              {doctor_info.specialization || 'General Medicine'} • 
              {doctor_info.years_of_experience || '0'} years experience
              {!doctor_info.is_available && ' • Currently Unavailable'}
            </p>
            <div className="header-stats">
              <span className="stat-item">
                <DollarSign size={16} />
                Fee: ₹{doctor_info.consultation_fee || '0'}
              </span>
              <span className="stat-item">
                <Star size={16} />
                Rating: {doctor_info.rating || '0'}/5
              </span>
              <span className="stat-item">
                <Users size={16} />
                Patients: {quick_stats.total_patients || '0'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={() => handleQuickAction('profile')}
              className="btn btn-outline"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Make them clickable */}
      <div className="stats-grid">
        <IconCard 
          icon={Calendar} 
          title="Today's Appointments" 
          value={todaysAppointments.length} 
          subtext="Scheduled for today"
          loading={statsLoading}
          onClick={() => handleViewAllAppointments('today')}
        />
        <IconCard 
          icon={Check} 
          title="Completed" 
          value={quick_stats.completed_appointments || '0'} 
          subtext="This month"
          color="icon-card-success"
          loading={statsLoading}
          onClick={() => handleViewAllAppointments('completed')}
        />
        <IconCard 
          icon={TestTube} 
          title="Lab Requests" 
          value={labStats.total_requests || '0'} 
          subtext="Total requests"
          color="icon-card-info"
          loading={statsLoading}
          onClick={() => navigate('/doctor/lab-requests')}
        />
        <IconCard 
          icon={FlaskConical} 
          title="Pending Results" 
          value={labStats.pending || '0'} 
          subtext="Awaiting results"
          color="icon-card-warning"
          loading={statsLoading}
          onClick={() => navigate('/doctor/lab-results')}
        />
      </div>

      {/* Lab Quick Actions Section */}
      <div className="section lab-quick-actions">
        <div className="section-header">
          <h2 className="section-title">
            <Microscope className="section-title-icon" />
            Laboratory Quick Actions
          </h2>
        </div>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-card"
            onClick={() => navigate('/doctor/lab-requests')}
          >
            <TestTube className="quick-action-icon" />
            <div className="quick-action-content">
              <h3>Request Lab Test</h3>
              <p>Order laboratory tests for patients</p>
            </div>
            <ChevronRight className="quick-action-arrow" />
          </button>
          
          <button 
            className="quick-action-card"
            onClick={() => navigate('/doctor/lab-results')}
          >
            <FlaskConical className="quick-action-icon" />
            <div className="quick-action-content">
              <h3>View Results</h3>
              <p>Check completed lab test results</p>
              {labStats.urgent_pending > 0 && (
                <span className="urgent-badge">{labStats.urgent_pending} urgent</span>
              )}
            </div>
            <ChevronRight className="quick-action-arrow" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Left Column - Appointments */}
        <div className="main-content">
          {/* Today's Appointments */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">
                <Calendar className="section-title-icon" />
                Today's Appointments
                <span className="section-count">
                  ({todaysAppointments.length})
                </span>
              </h2>
              <div className="section-actions">
                <button
                  onClick={() => handleViewAllAppointments('today')}
                  className="btn btn-link"
                >
                  <List size={16} className="mr-1" />
                  View All Appointments
                </button>
              </div>
            </div>
            
            {todaysAppointments.length > 0 ? (
              <div className="appointments-list">
                {todaysAppointments.map((appointment, index) => (
                  <AppointmentItem
                    key={appointment.id || `appt-${index}`}
                    appointment={appointment}
                    onAction={handleAppointmentAction}
                    onViewDetails={handleViewAppointmentDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={48} className="empty-icon" />
                <p>No appointments scheduled for today</p>
                <div className="empty-state-actions">
                  <button
                    onClick={() => handleViewAllAppointments('all')}
                    className="btn btn-outline"
                  >
                    View All Appointments
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* All Appointments Preview */}
          {dashboardData.appointments.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">
                  <Clock className="section-title-icon" />
                  Recent Appointments
                  <span className="section-count">
                    ({dashboardData.appointments.length})
                  </span>
                </h2>
                <button
                  onClick={() => handleViewAllAppointments('all')}
                  className="btn btn-link"
                >
                  <List size={16} className="mr-1" />
                  View All
                </button>
              </div>
              <div className="appointments-list compact">
                {dashboardData.appointments.slice(0, 5).map((appointment, index) => (
                  <div 
                    key={appointment.id || `recent-${index}`} 
                    className="list-item appointment-item clickable compact"
                    onClick={() => handleViewAppointmentDetails(appointment)}
                  >
                    <div className="list-item-content">
                      <div className="appointment-header">
                        <div className="appointment-time compact">
                          <Clock className="icon-card-icon mr-2" size={14} />
                          <div className="time-display">
                            <div className="time-main">
                              {appointment.appointment_date ? 
                                new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                }) : 'Date N/A'}
                            </div>
                            <div className="time-sub">
                              {appointment.appointment_time ? 
                                (() => {
                                  const timeStr = appointment.appointment_time.includes('+') ? 
                                    appointment.appointment_time.split('+')[0] : 
                                    appointment.appointment_time;
                                  const [hours, minutes] = timeStr.split(':');
                                  if (hours && minutes) {
                                    const hour = parseInt(hours);
                                    const ampm = hour >= 12 ? 'PM' : 'AM';
                                    const hour12 = hour % 12 || 12;
                                    return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
                                  }
                                  return appointment.appointment_time;
                                })() : '--:--'}
                            </div>
                          </div>
                        </div>
                        <div className="appointment-info compact">
                          <h3 className="list-item-title">
                            {appointment.patient?.name || 'Patient'}
                          </h3>
                          <p className="list-item-subtitle">
                            {appointment.appointment_type || 'Consultation'}
                          </p>
                        </div>
                      </div>
                      <div className="appointment-actions compact">
                        <span className={`status-badge compact ${
                          appointment.status === 'completed' ? 'status-confirmed' :
                          appointment.status === 'pending' ? 'status-pending' :
                          appointment.status === 'confirmed' ? 'status-confirmed' :
                          'status-cancelled'
                        }`}>
                          {appointment.status || 'Pending'}
                        </span>
                        <ChevronRight className="text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="rightbar">
          {/* Quick Actions */}
          <div className="section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions">
              <button 
                onClick={() => handleQuickAction('appointments')}
                className="quick-action-btn quick-action-btn-primary"
              >
                <Calendar className="quick-action-icon" />
                Manage Appointments
              </button>
              <button 
                onClick={() => handleQuickAction('patients')}
                className="quick-action-btn quick-action-btn-success"
              >
                <User className="quick-action-icon" />
                My Patients
              </button>
              <button 
                onClick={() => handleQuickAction('prescriptions')}
                className="quick-action-btn quick-action-btn-warning"
              >
                <FileText className="quick-action-icon" />
                Prescriptions
              </button>
              <button 
                onClick={() => handleQuickAction('messages')}
                className="quick-action-btn quick-action-btn-info"
              >
                <MessageSquare className="quick-action-icon" />
                Patient Messages
              </button>
              <button 
                onClick={() => handleQuickAction('profile')}
                className="quick-action-btn quick-action-btn-secondary"
              >
                <Settings className="quick-action-icon" />
                Profile Settings
              </button>
            </div>
          </div>

          {/* Availability Status */}
          <div className="section">
            <h3 className="section-title">
              <Bell className="section-title-icon" />
              Availability
            </h3>
            <div className="availability-status">
              <div className={`status-indicator ${doctor_info.is_available ? 'available' : 'unavailable'}`}>
                <div className="status-dot"></div>
                <span>{doctor_info.is_available ? 'Available for Appointments' : 'Currently Unavailable'}</span>
              </div>
              <button
                onClick={() => navigate('/doctor/profile?tab=availability')}
                className="btn btn-text btn-sm"
              >
                Change
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section">
            <h3 className="section-title">
              <Activity className="section-title-icon" />
              Recent Activity
            </h3>
            <div className="activity-list">
              {dashboardData.appointments.slice(0, 3).map((appointment, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${
                    appointment.status === 'completed' ? 'success' : 
                    appointment.status === 'cancelled' ? 'danger' : 
                    appointment.status === 'confirmed' ? 'success' : 'warning'
                  }`}>
                    {appointment.status === 'completed' ? <Check size={16} /> : 
                     appointment.status === 'cancelled' ? <X size={16} /> : 
                     appointment.status === 'confirmed' ? <Check size={16} /> : <Clock size={16} />}
                  </div>
                  <div className="activity-content">
                    <p>
                      Appointment with {appointment.patient?.name || 'Patient'}
                    </p>
                    <span className="activity-time">
                      {(() => {
                        const timeStr = appointment.appointment_time?.includes('+') ? 
                          appointment.appointment_time.split('+')[0] : 
                          appointment.appointment_time;
                        const [hours, minutes] = timeStr?.split(':') || [];
                        if (hours && minutes) {
                          const hour = parseInt(hours);
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const hour12 = hour % 12 || 12;
                          return `${hour12}:${minutes.padStart(2, '0')} ${ampm}`;
                        }
                        return 'Time N/A';
                      })()} • {appointment.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {dashboardData.appointments.length === 0 && (
                <div className="empty-state small">
                  <p>No recent activity</p>
                </div>
              )}
              {dashboardData.appointments.length > 3 && (
                <button
                  onClick={() => handleViewAllAppointments('all')}
                  className="btn btn-text btn-sm w-full mt-2"
                >
                  View All Activity
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fallback data for development
const getFallbackData = () => ({
  doctor_info: {
    full_name: 'Dr. John Smith',
    specialization: 'General Medicine',
    consultation_fee: 500,
    years_of_experience: 10,
    rating: 4.5,
    reviews_count: 24,
    is_available: true
  },
  quick_stats: {
    today_patients: 3,
    completed_appointments: 15,
    pending_appointments: 2,
    monthly_revenue: 7500,
    total_patients: 42
  },
  appointments: [
    { 
      id: 1, 
      patient: { name: 'Michael Johnson' },
      appointment_time: '09:00:00', 
      appointment_date: new Date().toISOString().split('T')[0],
      status: 'confirmed', 
      appointment_type: 'Follow-up', 
      reason: 'Post-surgery check'
    },
    { 
      id: 2, 
      patient: { name: 'Lisa Kumar' },
      appointment_time: '10:30:00', 
      appointment_date: new Date().toISOString().split('T')[0],
      status: 'pending', 
      appointment_type: 'Consultation', 
      reason: 'Chest pain evaluation'
    },
  ],
  doctor_id: 1
});

export default DoctorDashboard;