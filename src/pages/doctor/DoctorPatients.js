import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Filter,
  User,
  Clock,
  Activity,
  TrendingUp,
  FileText,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Stethoscope,
  Heart,
  Eye,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import chatApi from '../../api/chatApi';
import doctorsApi from '../../api/doctorsApi';
import { toast } from 'react-hot-toast';
import './DoctorPatients.css';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [statistics, setStatistics] = useState({
    total_patients: 0,
    active_patients: 0,
    total_appointments: 0,
    completed_appointments: 0,
    upcoming_appointments: 0
  });
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDoctorProfile();
    fetchPatients();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await doctorsApi.getProfile();
      setDoctorProfile(response.data);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load doctor profile');
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching patients from backend...');
      
      const response = await doctorsApi.getDoctorPatients({
        search: searchTerm
      });
      
      console.log('Patients response:', response.data);
      
      if (response.data) {
        setPatients(response.data.results || []);
        setStatistics(response.data.statistics || statistics);
        
        if (response.data.results?.length === 0) {
          console.log('No patients found');
        }
      }
      
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error.response?.data?.message || 'Failed to load patients');
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleStartChat = async (patient) => {
    try {
      if (!doctorProfile) {
        toast.error('Please wait while we load your profile...');
        return;
      }

      console.log('Starting chat with patient:', patient.id, 'doctor:', doctorProfile.id);
      
      // Find or create chat room
      const response = await chatApi.findOrCreateChatRoom({
        patient_id: patient.id,
        doctor_id: doctorProfile.id,
        room_type: 'consultation'
      });

      if (response.data) {
        console.log('Chat room created/found:', response.data);
        toast.success('Chat started successfully!');
        // Navigate to messages page with the chat selected
        navigate('/doctor/messages', { 
          state: { selectedChatId: response.data.id } 
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const handleScheduleAppointment = (patient) => {
    navigate('/doctor/appointments/manage', { 
      state: { 
        patientId: patient.id,
        patientName: patient.name,
        action: 'schedule'
      } 
    });
  };

  const handleViewPatientDetails = (patient) => {
    // Navigate to patient details page (you can create this)
    navigate(`/doctor/patients/${patient.id}`, {
      state: { patient }
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.primary_condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || patient.status.toLowerCase().includes(filterStatus.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'patient-status status-active';
      case 'follow-up available':
        return 'patient-status status-follow-up';
      case 'inactive':
        return 'patient-status status-inactive';
      default:
        return 'patient-status status-follow-up';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="doctor-patients-container">
        <button 
          onClick={() => navigate('/doctor/dashboard')} 
          className="back-button"
        >
          <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
        </button>
        
        <div className="patients-main-card">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading your patients...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-patients-container fade-in">
      <div className="doctor-patients-wrapper">
        <button 
          onClick={() => navigate('/doctor/dashboard')} 
          className="back-button"
        >
          <ArrowLeft className="mr-2" size={20} /> Back to Dashboard
        </button>
        
        <div className="patients-main-card slide-up">
          {/* Header */}
          <div className="patients-header">
            <div className="patients-header-content">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="patients-title">
                    <Users size={32} /> My Patients
                  </h1>
                  <p className="patients-subtitle">Manage and communicate with your patients</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchPatients}
                    className="refresh-button"
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-content">
                    <Users className="stat-icon text-white/80" size={24} />
                    <div>
                      <p className="stat-number">{statistics.total_patients}</p>
                      <p className="stat-label">Total Patients</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <Activity className="stat-icon text-green-300" size={24} />
                    <div>
                      <p className="stat-number">{statistics.active_patients}</p>
                      <p className="stat-label">Active</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <Calendar className="stat-icon text-purple-300" size={24} />
                    <div>
                      <p className="stat-number">{statistics.total_appointments}</p>
                      <p className="stat-label">Total Appointments</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <TrendingUp className="stat-icon text-yellow-300" size={24} />
                    <div>
                      <p className="stat-number">{statistics.completed_appointments}</p>
                      <p className="stat-label">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <Clock className="stat-icon text-orange-300" size={24} />
                    <div>
                      <p className="stat-number">{statistics.upcoming_appointments}</p>
                      <p className="stat-label">Upcoming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-section">
            <div className="search-filter-content">
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  placeholder="Search patients by name, condition, or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-controls">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Patients</option>
                  <option value="active">Active</option>
                  <option value="follow-up">Follow-up Available</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-container">
              <div className="error-content">
                <div className="error-info">
                  <AlertCircle className="error-icon" size={20} />
                  <div>
                    <p className="error-title">Error loading patients</p>
                    <p className="error-message">{error}</p>
                  </div>
                </div>
                <button
                  onClick={fetchPatients}
                  className="retry-button"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Patients List */}
          <div className="patients-list-container">
            {filteredPatients.length === 0 ? (
              <div className="empty-state">
                <Users className="empty-icon" size={64} />
                <h3 className="empty-title">
                  {searchTerm ? 'No patients found' : 'No patients yet'}
                </h3>
                <p className="empty-description">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Your patients will appear here once you have appointments.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/doctor/appointments/manage')}
                    className="empty-action-button"
                  >
                    Manage Appointments
                  </button>
                )}
              </div>
            ) : (
              <div className="patients-grid">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="patient-card">
                    <div className="patient-card-content">
                      <div className="patient-info-section">
                        <div className="patient-avatar">
                          <User size={28} />
                        </div>
                        <div className="patient-details">
                          <div className="patient-header">
                            <h3 className="patient-name">{patient.name}</h3>
                            <span className={getStatusColor(patient.status)}>
                              {patient.status}
                            </span>
                          </div>
                          <div className="patient-info-grid">
                            <div className="patient-info-item">
                              <Stethoscope size={16} />
                              <span>{patient.primary_condition || 'General consultation'}</span>
                            </div>
                            <div className="patient-info-item">
                              <Clock size={16} />
                              <span>Last visit: {formatDate(patient.last_visit)}</span>
                            </div>
                            <div className="patient-info-item">
                              <Activity size={16} />
                              <span>{patient.total_appointments} appointments</span>
                            </div>
                          </div>
                          {patient.age && (
                            <div className="patient-meta">
                              Age: {patient.age} {patient.gender && `• ${patient.gender}`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="patient-actions">
                        <button
                          onClick={() => handleStartChat(patient)}
                          className="action-button action-button-primary"
                          title="Start chat"
                        >
                          <MessageSquare size={16} />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => window.location.href = `tel:${patient.phone}`}
                          className="action-button action-button-success"
                          title="Call patient"
                          disabled={patient.phone === 'N/A'}
                        >
                          <Phone size={16} />
                        </button>
                        <button
                          onClick={() => window.location.href = `mailto:${patient.email}`}
                          className="action-button action-button-secondary"
                          title="Send email"
                          disabled={patient.email === 'N/A'}
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          onClick={() => handleScheduleAppointment(patient)}
                          className="action-button action-button-purple"
                          title="Schedule appointment"
                        >
                          <Calendar size={16} />
                        </button>
                        <button
                          onClick={() => handleViewPatientDetails(patient)}
                          className="action-button action-button-light"
                          title="View details"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Additional patient info */}
                    {(patient.upcoming_appointments > 0 || patient.completed_appointments > 0) && (
                      <div className="patient-additional-info">
                        <div className="additional-info-content">
                          <div className="info-stats">
                            {patient.upcoming_appointments > 0 && (
                              <span className="info-stat upcoming">
                                <Calendar size={14} />
                                {patient.upcoming_appointments} upcoming
                              </span>
                            )}
                            {patient.completed_appointments > 0 && (
                              <span className="info-stat completed">
                                <TrendingUp size={14} />
                                {patient.completed_appointments} completed
                              </span>
                            )}
                          </div>
                          <div className="patient-id">
                            Patient ID: {patient.id}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;