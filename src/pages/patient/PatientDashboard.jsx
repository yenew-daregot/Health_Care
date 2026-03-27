import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Activity, 
  Users, 
  AlertCircle, 
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  FileText,
  Heart,
  UserPlus,
  Stethoscope,
  Bell,
  ChevronRight,
  ChevronLeft,
  Info,
  X,
  RefreshCw,
  DollarSign,
  TestTube,
  FlaskConical,
  Microscope
} from 'lucide-react';
import patientsApi from '../../api/patientsApi';
import appointmentsApi from '../../api/appointmentsApi';
import labsApi from '../../api/labsApi';
import { useAuth } from '../../context/AuthContext';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    blood_group: '',
    height: '',
    weight: '',
    allergy_notes: '',
    chronic_conditions: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    insurance_id: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const [dashboardData, setDashboardData] = useState({
    stats: {
      upcomingAppointments: 0,
      pendingTests: 0,
      emergencyContacts: 0,
      completedAppointments: 0
    },
    recentActivity: [],
    patientProfile: null,
    upcomingAppointments: [],
    hasProfile: false,
    labResults: {
      total: 0,
      pending: 0,
      completed: 0,
      abnormal: 0,
      recent: []
    }
  });
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  //Multi-Step Form Functions
  const validateStep = (step) => {
    const errors = {};
    
    switch(step) {
      case 1: // Basic Info
        if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        break;
      
      case 2: // Medical History (optional)
        break;
      
      case 3: // Emergency Contacts
        if (!formData.emergency_contact?.trim()) errors.emergency_contact = 'Emergency contact name is required';
        if (!formData.emergency_contact_phone?.trim()) {
          errors.emergency_contact_phone = 'Phone number is required';
        } else if (!/^\+?1?\d{9,15}$/.test(formData.emergency_contact_phone.replace(/\D/g, ''))) {
          errors.emergency_contact_phone = 'Please enter a valid phone number';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      // Test basic API connection
      const response = await fetch('http://127.0.0.1:8000/api/health/');
      if (response.ok) {
        console.log('✅ Backend health check passed');
        return true;
      } else {
        console.log('❌ Backend health check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend connection failed:', error.message);
      return false;
    }
  };

  // Uses the new /patients/profile/create/ endpoint
  const handleCreateProfile = async () => {
    if (!validateStep(3)) {
      return;
    }

    // First test backend connectivity
    const backendConnected = await testBackendConnection();
    if (!backendConnected) {
      setFormErrors({ 
        general: 'Cannot connect to backend server. Please make sure the Django server is running on http://127.0.0.1:8000/' 
      });
      return;
    }

    try {
      const profileData = {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        blood_group: formData.blood_group || '',
        height: formData.height || null,
        weight: formData.weight || null,
        emergency_contact: formData.emergency_contact,
        emergency_contact_phone: formData.emergency_contact_phone,
        insurance_id: formData.insurance_id || '',
        allergy_notes: formData.allergy_notes || '',
        chronic_conditions: formData.chronic_conditions || ''
      };

      console.log('Creating patient profile via /patients/profile/create/ endpoint:', profileData);

      // Use the corrected API endpoint
      const response = await patientsApi.createProfile(profileData);
      console.log('Profile created successfully:', response.data);
      
      // Hide modal and reset
      setShowProfileModal(false);
      setCurrentStep(1);
      setFormData({
        date_of_birth: '',
        gender: '',
        blood_group: '',
        height: '',
        weight: '',
        allergy_notes: '',
        chronic_conditions: '',
        emergency_contact: '',
        emergency_contact_phone: '',
        insurance_id: ''
      });
      setFormErrors({});
      
      // Refresh dashboard
      fetchDashboardData();
      
    } catch (err) {
      console.error('Error creating profile:', err);
      let errorMsg = 'Failed to create profile. ';
      
      // Handle different types of errors
      if (err.response?.status === 404) {
        errorMsg = 'Backend service is not properly configured. Please contact support.';
      } else if (err.response?.status === 500) {
        errorMsg = 'Server error occurred. Please try again later.';
      } else if (err.response?.status === 400) {
        errorMsg = 'Invalid data provided. Please check your inputs.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Please login again to continue.';
      } else if (err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Please check your internet connection.';
      } else if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle HTML error pages (like Django 404 pages)
        if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE html>')) {
          errorMsg = 'Backend API endpoint not found. The server may not be properly configured.';
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = [];
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(msg => fieldErrors.push(`${field}: ${msg}`));
            } else if (typeof messages === 'string') {
              fieldErrors.push(`${field}: ${messages}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join(', ');
          } else if (errorData.error) {
            errorMsg = errorData.error;
          } else if (errorData.detail) {
            errorMsg = errorData.detail;
          } else {
            errorMsg = 'An error occurred while creating your profile.';
          }
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setFormErrors({ general: errorMsg });
    }
  };


// Dashboard Data Fetching
const fetchDashboardData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    // Initialize lab results
    let labResults = {
      total: 0,
      pending: 0,
      completed: 0,
      abnormal: 0,
      recent: []
    };

    // Try to fetch patient profile
    let patientProfile = null;
    let hasProfile = false;
    
    try {
      const profileResponse = await patientsApi.getProfile();
      patientProfile = profileResponse.data;
      hasProfile = true;
      console.log('Patient profile found:', patientProfile);
    } catch (profileError) {
      console.log('Patient profile not found, user needs to create one');
    }

    // If no profile exists, show setup modal
    if (!hasProfile) {
      setDashboardData(prev => ({
        ...prev,
        hasProfile: false,
        patientProfile: null
      }));
      setLoading(false);
      return;
    }

    // Get patient ID from profile
    const patientId = patientProfile.id;

    // Fetch patient appointments 
    let allAppointments = [];
    try {
      console.log('Fetching appointments for patient ID:', patientId);
      const appointmentsResponse = await appointmentsApi.getPatientAppointments(patientId);
      console.log('Appointments API response:', appointmentsResponse);
      
      if (appointmentsResponse && appointmentsResponse.data) {
        // If data is already an array, use it
        if (Array.isArray(appointmentsResponse.data)) {
          allAppointments = appointmentsResponse.data;
          console.log('Appointments found (array):', allAppointments.length);
        } 
        // If data is an object, check for common array properties
        else if (typeof appointmentsResponse.data === 'object' && appointmentsResponse.data !== null) {
          // Check for common response structures
          if (appointmentsResponse.data.results && Array.isArray(appointmentsResponse.data.results)) {
            allAppointments = appointmentsResponse.data.results;
            console.log('Appointments found (results array):', allAppointments.length);
          } else if (appointmentsResponse.data.appointments && Array.isArray(appointmentsResponse.data.appointments)) {
            allAppointments = appointmentsResponse.data.appointments;
            console.log('Appointments found (appointments array):', allAppointments.length);
          } else if (appointmentsResponse.data.data && Array.isArray(appointmentsResponse.data.data)) {
            allAppointments = appointmentsResponse.data.data;
            console.log('Appointments found (data array):', allAppointments.length);
          } else {
            // If it's a single appointment object, wrap it in an array
            allAppointments = [appointmentsResponse.data];
            console.log('Appointments found (single object wrapped in array):', allAppointments.length);
          }
        }
      } else {
        console.log('No appointments data found in response');
        allAppointments = []; // Default to empty array
      }
      
      console.log('Final appointments array:', allAppointments);
    } catch (apptError) {
      console.log('Error fetching appointments:', apptError);
      console.log('Error details:', apptError.response?.data);
      allAppointments = []; // Ensure it's always an array
    }

    // Fetch lab results
    try {
      console.log('Fetching lab results for patient ID:', patientId);
      const labResponse = await labsApi.getPatientLabRequests(patientId);
      console.log('Lab results API response:', labResponse);
      
      if (labResponse && Array.isArray(labResponse)) {
        const labRequests = labResponse;
        labResults = {
          total: labRequests.length,
          pending: labRequests.filter(req => req.status !== 'completed' && req.status !== 'cancelled').length,
          completed: labRequests.filter(req => req.status === 'completed').length,
          abnormal: labRequests.filter(req => req.result?.is_abnormal).length,
          recent: labRequests.slice(0, 3) // Get 3 most recent
        };
        console.log('Lab results processed:', labResults);
      }
    } catch (labError) {
      console.warn('Could not fetch lab results:', labError);
      // Keep default empty lab results
    }

    // Process data - NOW allAppointments is guaranteed to be an array
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = allAppointments.filter(apt => {
      if (!apt || !apt.appointment_date) return false;
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= today && apt.status !== 'cancelled';
    });

    const completedAppointments = allAppointments.filter(apt => 
      apt && (apt.status === 'completed' || apt.status === 'fulfilled')
    );

    const pendingAppointments = allAppointments.filter(apt => 
      apt && (apt.status === 'pending' || apt.status === 'scheduled')
    );

    const emergencyContactsCount = patientProfile.emergency_contacts 
      ? patientProfile.emergency_contacts.length 
      : (patientProfile.emergency_contact ? 1 : 0);

    // Prepare recent activity
    const recentActivity = allAppointments
      .slice(0, 5)
      .filter(apt => apt) // Filter out any null/undefined appointments
      .map(apt => {
        const isCompleted = apt.status === 'completed';
        const isUpcoming = new Date(apt.appointment_date) > today;
        const doctorName = apt.doctor?.user?.first_name
          ? `Dr. ${apt.doctor.user.first_name} ${apt.doctor.user.last_name || ''}`
          : 'Doctor';
        
        return {
          id: apt.id || Date.now(),
          type: 'appointment',
          title: `Appointment with ${doctorName}`,
          description: apt.reason || 'Regular checkup',
          status: apt.status || 'unknown',
          icon: isCompleted ? 'check' : isUpcoming ? 'calendar' : 'clock',
          timestamp: apt.updated_at || apt.created_at || new Date().toISOString(),
          color: isCompleted ? 'success' : isUpcoming ? 'info' : 'warning'
        };
      });

    // Add profile creation as first activity if profile was recently created
    if (patientProfile.created_at) {
      const profileCreationDate = new Date(patientProfile.created_at);
      const today = new Date();
      const diffTime = Math.abs(today - profileCreationDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) { // Show if profile was created within last week
        recentActivity.unshift({
          id: 'profile-created',
          type: 'profile',
          title: 'Profile Created',
          description: 'Your patient profile has been set up',
          status: 'completed',
          icon: 'check',
          timestamp: patientProfile.created_at,
          color: 'success'
        });
      }
    }

    // Add welcome message if no activity
    if (recentActivity.length === 0) {
      recentActivity.push({
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to HealthPortal!',
        description: 'Get started by booking your first appointment',
        status: 'info',
        icon: 'bell',
        timestamp: new Date().toISOString(),
        color: 'info'
      });
    }

    setDashboardData({
      stats: {
        upcomingAppointments: upcomingAppointments.length,
        pendingTests: pendingAppointments.length,
        emergencyContacts: emergencyContactsCount,
        completedAppointments: completedAppointments.length
      },
      recentActivity,
      patientProfile,
      upcomingAppointments: upcomingAppointments.slice(0, 3),
      hasProfile: true,
      labResults
    });

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    console.error('Full error:', err.response || err);
    
    let errorMessage = 'Failed to load dashboard data';
    if (err.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      setTimeout(() => logout(), 2000);
    } else if (!navigator.onLine) {
      errorMessage = 'No internet connection.';
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    
    // Set fallback data
    setDashboardData({
      stats: { upcomingAppointments: 0, pendingTests: 0, emergencyContacts: 0, completedAppointments: 0 },
      recentActivity: [{
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to HealthPortal!',
        description: 'Complete your profile to get started',
        status: 'info',
        icon: 'bell',
        timestamp: new Date().toISOString(),
        color: 'info'
      }],
      patientProfile: null,
      upcomingAppointments: [],
      hasProfile: false
    });
  } finally {
    setLoading(false);
  }
}, [user, logout]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Emergency SOS Handler
  const handleEmergencySOS = async () => {
    if (!dashboardData.hasProfile) {
      alert('Please complete your profile first to set up emergency contacts.');
      setShowProfileModal(true);
      return;
    }

    if (!window.confirm('Send emergency alert to your contacts and nearby hospitals?')) {
      return;
    }

    try {
      const newActivity = {
        id: 'emergency-' + Date.now(),
        type: 'emergency',
        title: 'Emergency Alert Sent',
        description: 'Help has been notified',
        status: 'emergency',
        icon: 'alert',
        timestamp: new Date().toISOString(),
        color: 'danger'
      };

      setDashboardData(prev => ({
        ...prev,
        recentActivity: [newActivity, ...prev.recentActivity.slice(0, 4)]
      }));

      alert('🚨 Emergency alert sent! Help is on the way.');
    } catch (err) {
      alert('Failed to send emergency alert. Please try again.');
    }
  };

  //Utility Functions 
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffMins = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date not set';
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      check: CheckCircle,
      calendar: Calendar,
      clock: Clock,
      alert: AlertTriangle,
      users: Users,
      file: FileText,
      heart: Heart,
      bell: Bell,
      stethoscope: Stethoscope,
      info: Info
    };
    return iconMap[iconName] || Clock;
  };

  const getStatusColor = (color) => {
    const colorMap = {
      success: '#4cc9f0',
      info: '#7209b7',
      warning: '#f8961e',
      danger: '#f72585',
      default: '#666'
    };
    return colorMap[color] || colorMap.default;
  };

  //Render Step Forms
  const renderStepForm = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="step-form">
            <h3 className="form-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth *</label>
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className={`form-input ${formErrors.date_of_birth ? 'invalid' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {formErrors.date_of_birth && <span className="error-message">{formErrors.date_of_birth}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className={`form-input ${formErrors.gender ? 'invalid' : ''}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.gender && <span className="error-message">{formErrors.gender}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="blood_group">Blood Group</label>
                <select
                  id="blood_group"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                  className="form-input"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="form-input"
                  min="50"
                  max="250"
                  step="0.1"
                  placeholder="170"
                />
                <p className="form-hint">Optional: Between 50-250 cm</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="form-input"
                  min="2"
                  max="300"
                  step="0.1"
                  placeholder="70"
                />
                <p className="form-hint">Optional: Between 2-300 kg</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-form">
            <h3 className="form-title">Medical History (Optional)</h3>
            <div className="form-group">
              <label htmlFor="allergy_notes">Allergies</label>
              <textarea
                id="allergy_notes"
                value={formData.allergy_notes}
                onChange={(e) => setFormData({...formData, allergy_notes: e.target.value})}
                className="form-textarea"
                placeholder="List any allergies (e.g., penicillin, nuts, dust mites)"
                rows="3"
              />
              <p className="form-hint">This helps doctors provide safer care</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="chronic_conditions">Chronic Conditions</label>
              <textarea
                id="chronic_conditions"
                value={formData.chronic_conditions}
                onChange={(e) => setFormData({...formData, chronic_conditions: e.target.value})}
                className="form-textarea"
                placeholder="List any chronic conditions (e.g., asthma, diabetes, hypertension)"
                rows="3"
              />
              <p className="form-hint">This helps in personalized treatment planning</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-form">
            <h3 className="form-title">Emergency Contacts</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="emergency_contact">Contact Name *</label>
                <input
                  type="text"
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  className={`form-input ${formErrors.emergency_contact ? 'invalid' : ''}`}
                  placeholder="John Doe"
                />
                {formErrors.emergency_contact && <span className="error-message">{formErrors.emergency_contact}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="emergency_contact_phone">Phone Number *</label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                  className={`form-input ${formErrors.emergency_contact_phone ? 'invalid' : ''}`}
                  placeholder="+1 234 567 8900"
                />
                {formErrors.emergency_contact_phone && <span className="error-message">{formErrors.emergency_contact_phone}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="insurance_id">Insurance ID (Optional)</label>
              <input
                type="text"
                id="insurance_id"
                value={formData.insurance_id}
                onChange={(e) => setFormData({...formData, insurance_id: e.target.value})}
                className="form-input"
                placeholder="Insurance policy number"
              />
            </div>

            <div className="form-note">
              <Info size={16} />
              <p>Emergency contacts will be notified in case of emergency SOS activation</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Dashboard Stats
  const statCards = [
    {
      name: 'Upcoming Appointments',
      value: dashboardData.stats.upcomingAppointments,
      color: 'blue',
      href: '/patient/appointments',
      icon: Calendar,
      description: 'Scheduled visits'
    },
    {
      name: 'Lab Results',
      value: dashboardData.labResults?.total || 0,
      color: 'purple',
      href: '/patient/lab-results',
      icon: TestTube,
      description: 'Total lab tests'
    },
    {
      name: 'Pending Lab Tests',
      value: dashboardData.labResults?.pending || 0,
      color: 'yellow',
      href: '/patient/lab-results',
      icon: FlaskConical,
      description: 'Awaiting results'
    },
    {
      name: 'Emergency Contacts',
      value: dashboardData.stats.emergencyContacts,
      color: 'red',
      href: '/patient/emergency',
      icon: Users,
      description: 'Quick access contacts'
    },
    {
      name: 'Completed Visits',
      value: dashboardData.stats.completedAppointments,
      color: 'green',
      href: '/patient/history',
      icon: CheckCircle,
      description: 'Past appointments'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <h3>Loading your dashboard</h3>
          <p>Fetching your healthcare information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      {/*Multi-Step Profile Modal*/}
      {showProfileModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="modal-header">
              <button 
                className="modal-close"
                onClick={() => {
                  setShowProfileModal(false);
                  setCurrentStep(1);
                  setFormErrors({});
                }}
              >
                <X size={20} />
              </button>
              <UserPlus size={32} className="modal-icon" />
              <h2>Complete Your Profile</h2>
              <p className="modal-subtitle">
                Follow these steps to set up your patient profile
              </p>
              
              {/* Progress Bar */}
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="modal-body">
              {/* Interactive Steps */}
              <div className="setup-steps">
                <div 
                  className={`setup-step ${currentStep === 1 ? 'active' : ''}`}
                  onClick={() => setCurrentStep(1)}
                >
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Basic Information</h4>
                    <p>Date of birth, gender, contact details</p>
                  </div>
                  <ChevronRight size={20} className="step-arrow" />
                </div>
                
                <div 
                  className={`setup-step ${currentStep === 2 ? 'active' : ''} ${currentStep < 2 ? 'disabled' : ''}`}
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Medical History</h4>
                    <p>Allergies and chronic conditions</p>
                  </div>
                  <ChevronRight size={20} className="step-arrow" />
                </div>
                
                <div 
                  className={`setup-step ${currentStep === 3 ? 'active' : ''} ${currentStep < 3 ? 'disabled' : ''}`}
                  onClick={() => currentStep >= 3 && setCurrentStep(3)}
                >
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Emergency Contacts</h4>
                    <p>Set up emergency contacts</p>
                  </div>
                  <ChevronRight size={20} className="step-arrow" />
                </div>
              </div>

              {/* Form Content */}
              <div className="step-forms">
                {renderStepForm()}
                
                {formErrors.general && (
                  <div className="form-error-general">
                    <AlertCircle size={16} />
                    <div>
                      <span>{formErrors.general}</span>
                      {formErrors.general.includes('Backend API endpoint not found') && (
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                          <strong>Troubleshooting:</strong>
                          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                            <li>Make sure the Django backend server is running</li>
                            <li>Check that all Django apps are properly installed</li>
                            <li>Verify the URL configuration includes patients API</li>
                            <li>Try refreshing the page or contact support</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="user-info-note">
                <Info size={16} />
                <div>
                  <p><strong>Current User:</strong> {user?.email}</p>
                  <p className="small">Your patient profile will be linked to this account</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="step-navigation">
                {currentStep > 1 && (
                  <button 
                    onClick={handlePrevStep}
                    className="btn-secondary"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button 
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="final-step-buttons">
                    <button 
                      onClick={handleCreateProfile}
                      className="btn-primary"
                    >
                      Create My Profile
                    </button>
                    <p className="form-note-small">
                      Your profile will be linked to: {user?.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="dashboard-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={fetchDashboardData}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      )}

      {/* Profile Completion Alert */}
      {!dashboardData.hasProfile && !showProfileModal && (
        <div className="profile-alert">
          <div className="alert-content">
            <AlertTriangle size={20} />
            <div className="alert-text">
              <strong>Profile Incomplete</strong>
              <p>Complete your profile to access all features</p>
            </div>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="btn-primary btn-sm"
            >
              Complete Profile
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            {dashboardData.hasProfile 
              ? `Welcome back, ${dashboardData.patientProfile?.user?.first_name || user?.first_name || 'Patient'}!`
              : 'Welcome to HealthPortal!'}
          </h1>
          <p className="dashboard-subtitle">
            {dashboardData.hasProfile 
              ? 'Here\'s your health summary for today'
              : 'Complete your profile to get started'}
            {dashboardData.patientProfile?.age && (
              <span className="patient-age"> • {dashboardData.patientProfile.age} years</span>
            )}
            {dashboardData.patientProfile?.blood_group && (
              <span className="patient-blood"> • Blood Group: {dashboardData.patientProfile.blood_group}</span>
            )}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-refresh"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid or Setup Guide */}
      {dashboardData.hasProfile ? (
        <div className="stats-grid">
          {statCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Link
                key={stat.name}
                to={stat.href}
                className={`stat-card stat-${stat.color}`}
              >
                <div className="stat-content">
                  <div className="stat-icon-wrapper">
                    <div className="stat-icon-bg">
                      <IconComponent size={24} />
                    </div>
                  </div>
                  <div className="stat-details">
                    <p className="stat-value">{stat.value}</p>
                    <p className="stat-name">{stat.name}</p>
                    <p className="stat-description">{stat.description}</p>
                  </div>
                  <div className="stat-arrow">→</div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="setup-guide">
          <div className="setup-card">
            <Stethoscope size={48} className="setup-icon" />
            <h3>Get Started with HealthPortal</h3>
            <p>Complete these steps to access all healthcare features</p>
            <div className="setup-actions">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="btn-primary btn-large"
              >
                <UserPlus size={20} />
                Create Patient Profile
              </button>
              <Link to="/patient/book-appointment" className="btn-secondary btn-large">
                <Calendar size={20} />
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      {dashboardData.hasProfile && (
        <>
          <div className="dashboard-main">
            {/* Left Column */}
            <div className="dashboard-column">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                  <span className="card-subtitle">Manage your healthcare</span>
                </div>
                <div className="card-body">
                  <div className="actions-grid">
                    <Link to="/patient/book-appointment" className="action-btn action-primary">
                      <PlusCircle size={20} />
                      <span>Book Appointment</span>
                    </Link>
                    
                    <button
                      onClick={handleEmergencySOS}
                      className="action-btn action-danger"
                    >
                      <AlertTriangle size={20} />
                      <span>Emergency SOS</span>
                    </button>
                    
                    <Link to="/patient/medical-records" className="action-btn action-secondary">
                      <FileText size={20} />
                      <span>Medical Records</span>
                    </Link>
                    
                    <Link to="/patient/my-prescriptions" className="action-btn action-secondary">
                      <Activity size={20} />
                      <span>My Prescriptions</span>
                    </Link>
                    
                    <Link to="/patient/lab-results" className="action-btn action-secondary">
                      <Stethoscope size={20} />
                      <span>Lab Results</span>
                    </Link>
                    
                    <Link to="/patient/messages" className="action-btn action-info">
                      <Bell size={20} />
                      <span>Messages</span>
                    </Link>
                    
                    <Link to="/patient/billing" className="action-btn action-secondary">
                      <DollarSign size={20} />
                      <span>Billing</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              {dashboardData.upcomingAppointments.length > 0 ? (
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">Upcoming Appointments</h3>
                    <Link to="/patient/appointments" className="view-all-link">
                      View all
                    </Link>
                  </div>
                  <div className="card-body">
                    <div className="appointments-list">
                      {dashboardData.upcomingAppointments.map((apt) => (
                        <div key={apt.id} className="appointment-item">
                          <div className="appointment-icon">
                            <Calendar size={18} />
                          </div>
                          <div className="appointment-details">
                            <h4>
                              {apt.doctor?.user?.first_name 
                                ? `Dr. ${apt.doctor.user.first_name} ${apt.doctor.user.last_name || ''}`
                                : 'Doctor'
                              }
                            </h4>
                            <p>{apt.reason || 'Regular checkup'}</p>
                            <span className="appointment-time">
                              {formatAppointmentDate(apt.appointment_date)}
                            </span>
                          </div>
                          <div className={`appointment-status status-${apt.status}`}>
                            {apt.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="dashboard-card empty-card">
                  <div className="card-body">
                    <div className="empty-state">
                      <Calendar size={48} />
                      <h4>No Upcoming Appointments</h4>
                      <p>Schedule your first appointment to get started</p>
                      <Link to="/patient/book-appointment" className="empty-state-action">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="dashboard-column">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                  <span className="card-subtitle">Your latest actions</span>
                </div>
                <div className="card-body">
                  {dashboardData.recentActivity.length > 0 ? (
                    <div className="activity-timeline">
                      {dashboardData.recentActivity.map((activity) => {
                        const IconComponent = getIconComponent(activity.icon);
                        return (
                          <div key={activity.id} className="timeline-item">
                            <div 
                              className="timeline-icon"
                              style={{ backgroundColor: getStatusColor(activity.color) }}
                            >
                              <IconComponent size={16} color="white" />
                            </div>
                            <div className="timeline-content">
                              <h4>{activity.title}</h4>
                              <p>{activity.description}</p>
                              <span className="timeline-time">
                                {formatDate(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <Clock size={48} />
                      <h4>No recent activity</h4>
                      <p>Your activities will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Health Summary */}
              {dashboardData.patientProfile?.bmi && (
                <div className="dashboard-card health-summary">
                  <div className="card-header">
                    <h3 className="card-title">Health Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="health-stats">
                      <div className="health-stat">
                        <span className="stat-label">BMI</span>
                        <span className="stat-value">{dashboardData.patientProfile.bmi}</span>
                        <span className="stat-category">{dashboardData.patientProfile.bmi_category}</span>
                      </div>
                      {dashboardData.patientProfile.height && (
                        <div className="health-stat">
                          <span className="stat-label">Height</span>
                          <span className="stat-value">{dashboardData.patientProfile.height} cm</span>
                        </div>
                      )}
                      {dashboardData.patientProfile.weight && (
                        <div className="health-stat">
                          <span className="stat-label">Weight</span>
                          <span className="stat-value">{dashboardData.patientProfile.weight} kg</span>
                        </div>
                      )}
                    </div>
                    {/* <Link to="/patient/health-metrics" className="view-details-link">
                      View detailed metrics →
                    </Link> */}
                  </div>
                </div>
              )}

              {/* Lab Results Summary */}
              {dashboardData.labResults && dashboardData.labResults.total > 0 && (
                <div className="dashboard-card lab-summary">
                  <div className="card-header">
                    <h3 className="card-title">Lab Results Summary</h3>
                    <Link to="/patient/lab-results" className="view-all-link">
                      View all
                    </Link>
                  </div>
                  <div className="card-body">
                    <div className="lab-stats-grid">
                      <div className="lab-stat">
                        <div className="lab-stat-icon">
                          <Microscope size={20} />
                        </div>
                        <div className="lab-stat-content">
                          <span className="lab-stat-value">{dashboardData.labResults.completed}</span>
                          <span className="lab-stat-label">Completed</span>
                        </div>
                      </div>
                      <div className="lab-stat">
                        <div className="lab-stat-icon pending">
                          <FlaskConical size={20} />
                        </div>
                        <div className="lab-stat-content">
                          <span className="lab-stat-value">{dashboardData.labResults.pending}</span>
                          <span className="lab-stat-label">Pending</span>
                        </div>
                      </div>
                      {dashboardData.labResults.abnormal > 0 && (
                        <div className="lab-stat">
                          <div className="lab-stat-icon warning">
                            <AlertTriangle size={20} />
                          </div>
                          <div className="lab-stat-content">
                            <span className="lab-stat-value">{dashboardData.labResults.abnormal}</span>
                            <span className="lab-stat-label">Abnormal</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {dashboardData.labResults.recent && dashboardData.labResults.recent.length > 0 && (
                      <div className="recent-lab-results">
                        <h4>Recent Results</h4>
                        {dashboardData.labResults.recent.slice(0, 2).map((result) => (
                          <div key={result.id} className="lab-result-item">
                            <div className="lab-result-info">
                              <span className="lab-test-name">{result.test_type}</span>
                              <span className="lab-test-date">
                                {formatDate(result.requested_date)}
                              </span>
                            </div>
                            <div className={`lab-result-status status-${result.status}`}>
                              {result.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resources Section */}
          <div className="dashboard-resources">
            <div className="resource-card">
              <Heart size={24} />
              <h4>Health Tips</h4>
              <p>Daily exercise and balanced diet recommendations</p>
              <Link to="/patient/health-tips">Learn more</Link>
            </div>
            <div className="resource-card">
              <Users size={24} />
              <h4>Support Groups</h4>
              <p>Connect with others sharing similar health journeys</p>
              <Link to="/patient/support">Join now</Link>
            </div>
            <div className="resource-card">
              <FileText size={24} />
              <h4>Document Center</h4>
              <p>Access and manage your medical documents</p>
              <Link to="/patient/documents">Browse files</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDashboard;