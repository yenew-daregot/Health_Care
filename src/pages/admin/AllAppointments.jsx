import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Services and hooks
import appointmentsApi from '../../api/appointmentsApi.js';
import useOptimisticUpdates from '../../hooks/useOptimisticUpdates';
import useRealTimeUpdates from '../../hooks/useRealTimeUpdates';
import notificationService from '../../services/notificationService';
import errorHandlingService from '../../services/errorHandlingService';

import AppointmentTable from '../../components/Tables/AppointmentTable';
import './AllAppointments.css';

const AllAppointments = () => {
  // Optimistic updates hook
  const {
    data: appointments,
    setData: setAppointments,
    loading,
    error,
    setError,
    optimisticAppointmentOperations
  } = useOptimisticUpdates([], {
    onSuccess: (result) => {
      console.log('✅ Operation successful:', result);
    },
    onError: (error) => {
      console.error('❌ Operation failed:', error);
    }
  });

  // Real-time updates hook
  const {
    connectionStatus,
    isConnected,
    lastUpdate
  } = useRealTimeUpdates({
    onAppointmentUpdate: (type, appointment) => {
      console.log(`📡 Real-time update: ${type}`, appointment);
      
      // Update local state with real-time data
      setAppointments(prevAppointments => {
        const updatedAppointments = prevAppointments.map(apt => 
          apt.id === appointment.id ? appointment : apt
        );
        
        // If it's a new appointment, add it
        if (type === 'created' && !prevAppointments.find(apt => apt.id === appointment.id)) {
          return [appointment, ...updatedAppointments];
        }
        
        return updatedAppointments;
      });
    },
    onConnectionChange: (status) => {
      console.log(`🔌 Connection status: ${status}`);
    }
  });

  const [connectionTested, setConnectionTested] = useState(false);
  const [filter, setFilter] = useState('all');
  const [usingMockData, setUsingMockData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    upcoming: 0
  });

  // Mock data for fallback
  const getMockAppointments = () => {
    return [
      {
        id: 1,
        patient: {
          id: 101,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          age: 35,
          gender: 'Male'
        },
        doctor: {
          id: 201,
          name: 'Dr. Jane Smith',
          specialization: 'Cardiology',
          department: 'Heart Center'
        },
        appointment_date: '2024-01-15',
        appointment_time: '10:00 AM',
        reason: 'Routine heart checkup and consultation',
        status: 'confirmed',
        notes: 'Patient has history of hypertension. Bring previous test reports.',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-12T14:30:00Z'
      },
      {
        id: 2,
        patient: {
          id: 102,
          name: 'Alice Johnson',
          email: 'alice.j@example.com',
          phone: '+1 (555) 234-5678',
          age: 28,
          gender: 'Female'
        },
        doctor: {
          id: 202,
          name: 'Dr. Robert Chen',
          specialization: 'Neurology',
          department: 'Neuro Center'
        },
        appointment_date: '2024-01-16',
        appointment_time: '2:30 PM',
        reason: 'Chronic headaches and migraine evaluation',
        status: 'pending',
        notes: 'New patient. Requires MRI scan.',
        created_at: '2024-01-11T14:30:00Z',
        updated_at: '2024-01-11T14:30:00Z'
      },
      {
        id: 3,
        patient: {
          id: 103,
          name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          phone: '+1 (555) 345-6789',
          age: 45,
          gender: 'Male'
        },
        doctor: {
          id: 201,
          name: 'Dr. Jane Smith',
          specialization: 'Cardiology',
          department: 'Heart Center'
        },
        appointment_date: '2024-01-14',
        appointment_time: '11:00 AM',
        reason: 'Post-surgery follow-up',
        status: 'completed',
        notes: 'All vital signs normal. Recovery progressing well.',
        created_at: '2024-01-09T10:00:00Z',
        updated_at: '2024-01-14T12:00:00Z'
      },
      {
        id: 4,
        patient: {
          id: 104,
          name: 'Carol Davis',
          email: 'carol.davis@example.com',
          phone: '+1 (555) 456-7890',
          age: 52,
          gender: 'Female'
        },
        doctor: {
          id: 203,
          name: 'Dr. Michael Brown',
          specialization: 'Orthopedics',
          department: 'Bone & Joint'
        },
        appointment_date: '2024-01-17',
        appointment_time: '9:00 AM',
        reason: 'Knee pain and mobility issues',
        status: 'cancelled',
        cancellation_reason: 'Patient requested reschedule due to personal emergency',
        notes: 'Rescheduled for next week',
        created_at: '2024-01-12T08:00:00Z',
        updated_at: '2024-01-13T16:45:00Z'
      },
      {
        id: 5,
        patient: {
          id: 105,
          name: 'David Miller',
          email: 'david.m@example.com',
          phone: '+1 (555) 567-8901',
          age: 38,
          gender: 'Male'
        },
        doctor: {
          id: 204,
          name: 'Dr. Sarah Williams',
          specialization: 'Pediatrics',
          department: 'Children Hospital'
        },
        appointment_date: '2024-01-18',
        appointment_time: '3:15 PM',
        reason: 'Child vaccination and growth check',
        status: 'confirmed',
        notes: 'Regular immunization schedule',
        created_at: '2024-01-13T11:20:00Z',
        updated_at: '2024-01-13T11:20:00Z'
      },
      {
        id: 6,
        patient: {
          id: 106,
          name: 'Emma Thompson',
          email: 'emma.t@example.com',
          phone: '+1 (555) 678-9012',
          age: 29,
          gender: 'Female'
        },
        doctor: {
          id: 205,
          name: 'Dr. James Wilson',
          specialization: 'Dermatology',
          department: 'Skin Care'
        },
        appointment_date: '2024-01-19',
        appointment_time: '1:45 PM',
        reason: 'Skin allergy and rash treatment',
        status: 'pending',
        notes: 'Allergic reaction to new medication',
        created_at: '2024-01-14T09:15:00Z',
        updated_at: '2024-01-14T09:15:00Z'
      },
      {
        id: 7,
        patient: {
          id: 107,
          name: 'Frank Rodriguez',
          email: 'frank.r@example.com',
          phone: '+1 (555) 789-0123',
          age: 41,
          gender: 'Male'
        },
        doctor: {
          id: 206,
          name: 'Dr. Lisa Anderson',
          specialization: 'Gastroenterology',
          department: 'Digestive Health'
        },
        appointment_date: '2024-01-20',
        appointment_time: '10:30 AM',
        reason: 'Stomach pain and digestion issues',
        status: 'confirmed',
        notes: 'Need endoscopy test',
        created_at: '2024-01-13T16:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 8,
        patient: {
          id: 108,
          name: 'Grace Lee',
          email: 'grace.lee@example.com',
          phone: '+1 (555) 890-1234',
          age: 33,
          gender: 'Female'
        },
        doctor: {
          id: 207,
          name: 'Dr. Thomas Clark',
          specialization: 'Ophthalmology',
          department: 'Eye Care'
        },
        appointment_date: '2024-01-21',
        appointment_time: '4:00 PM',
        reason: 'Eye checkup and vision test',
        status: 'completed',
        notes: 'Prescription updated. Follow-up in 6 months.',
        created_at: '2024-01-10T13:45:00Z',
        updated_at: '2024-01-21T17:00:00Z'
      }
    ];
  };

  const getMockStatistics = () => {
    const mockApps = getMockAppointments();
    return {
      total: mockApps.length,
      pending: mockApps.filter(a => a.status === 'pending').length,
      confirmed: mockApps.filter(a => a.status === 'confirmed').length,
      completed: mockApps.filter(a => a.status === 'completed').length,
      cancelled: mockApps.filter(a => a.status === 'cancelled').length,
      today: 2, 
      upcoming: 4 
    };
  };

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setError(null);
      setUsingMockData(false);
      setConnectionTested(false);
      
      console.log('Initializing appointments data...');
      
      // Test connection to backend
      let backendConnected = false;
      try {
        console.log('Testing backend connection...');
        // Use the test endpoint from your API
        const testResponse = await fetch('http://localhost:8000/api/test/');
        if (testResponse.ok) {
          console.log('✅ Backend connection successful');
          backendConnected = true;
          setConnectionTested(true);
        } else {
          throw new Error(`Backend responded with status: ${testResponse.status}`);
        }
      } catch (connError) {
        console.warn('⚠️ Backend connection failed:', connError.message);
        setError(`Note: Using demo data - ${connError.message}`);
        setUsingMockData(true);
        backendConnected = false;
      }
      
      // Fetch data based on connection status
      if (backendConnected) {
        try {
          await Promise.all([
            fetchAppointmentsFromBackend(),
            fetchStatisticsFromBackend()
          ]);
        } catch (fetchError) {
          console.warn('Backend fetch failed, using mock data:', fetchError);
          setError(`Failed to fetch real data: ${fetchError.userMessage || fetchError.message}`);
          setUsingMockData(true);
          loadMockData();
        }
      } else {
        // Use mock data directly
        loadMockData();
      }
      
    } catch (error) {
      console.error('Unexpected initialization error:', error);
      setError('System error. Loading demo data...');
      setUsingMockData(true);
      loadMockData();
    }
  };

  const fetchAppointmentsFromBackend = async () => {
    try {
      console.log('Fetching appointments from backend...');
      const response = await appointmentsApi.getAppointments();
      const data = response.data || response;
      
      // Format the data to match our expected structure
      const formattedAppointments = Array.isArray(data) 
        ? data.map(formatAppointmentData)
        : Array.isArray(data.results) 
          ? data.results.map(formatAppointmentData)
          : [];
      
      console.log(`✅ Fetched ${formattedAppointments.length} appointments from backend`);
      setAppointments(formattedAppointments);
      updateLocalStats(formattedAppointments);
      
      // Check if returned data looks like mock data (fallback case)
      if (formattedAppointments.length > 0 && formattedAppointments[0].mock === true) {
        console.log('Backend returned mock data');
        setUsingMockData(true);
      }
    } catch (error) {
      console.error('Failed to fetch appointments from backend:', error);
      throw error;
    }
  };

  const formatAppointmentData = (appointment) => {
    // This function formats the backend data to match our frontend structure
    return {
      id: appointment.id,
      patient: {
        id: appointment.patient?.id || appointment.patient_id,
        name: appointment.patient?.user 
          ? `${appointment.patient.user.first_name || ''} ${appointment.patient.user.last_name || ''}`.trim()
          : appointment.patient_name || 'Unknown Patient',
        email: appointment.patient?.user?.email || appointment.patient_email,
        phone: appointment.patient?.user?.phone || appointment.patient_phone,
        age: appointment.patient?.age,
        gender: appointment.patient?.gender
      },
      doctor: {
        id: appointment.doctor?.id || appointment.doctor_id,
        name: appointment.doctor?.user
          ? `Dr. ${appointment.doctor.user.first_name || ''} ${appointment.doctor.user.last_name || ''}`.trim()
          : appointment.doctor_name || 'Unknown Doctor',
        specialization: appointment.doctor?.specialization,
        department: appointment.doctor?.department
      },
      appointment_date: appointment.appointment_date || appointment.date,
      appointment_time: appointment.appointment_time || appointment.time,
      reason: appointment.reason || appointment.description,
      status: appointment.status?.toLowerCase() || 'pending',
      notes: appointment.notes || appointment.additional_notes,
      created_at: appointment.created_at,
      updated_at: appointment.updated_at,
      cancellation_reason: appointment.cancellation_reason
    };
  };

  const fetchStatisticsFromBackend = async () => {
    try {
      const response = await appointmentsApi.getStatistics();
      const data = response.data || response;
      console.log('Fetched statistics from backend:', data);
      setStats(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.warn('Failed to fetch statistics from backend, using local calculation:', error);
      // Will use local stats calculated from appointments
    }
  };

  const loadMockData = () => {
    console.log('Loading mock appointments data...');
    const mockApps = getMockAppointments();
    setAppointments(mockApps);
    updateLocalStats(mockApps);
    
    const mockStats = getMockStatistics();
    setStats(mockStats);
  };

  const updateLocalStats = (appointmentsList) => {
    const today = new Date().toISOString().split('T')[0];
    
    const newStats = {
      total: appointmentsList.length,
      pending: appointmentsList.filter(a => 
        a.status === 'pending' || a.status === 'PENDING'
      ).length,
      confirmed: appointmentsList.filter(a => 
        a.status === 'confirmed' || a.status === 'CONFIRMED'
      ).length,
      completed: appointmentsList.filter(a => 
        a.status === 'completed' || a.status === 'COMPLETED'
      ).length,
      cancelled: appointmentsList.filter(a => 
        a.status === 'cancelled' || a.status === 'CANCELLED'
      ).length,
      today: appointmentsList.filter(a => {
        return a.appointment_date === today;
      }).length,
      upcoming: appointmentsList.filter(a => {
        const appointmentDate = new Date(a.appointment_date);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        return appointmentDate > todayDate && 
               (a.status === 'confirmed' || a.status === 'pending');
      }).length
    };
    setStats(newStats);
  };

  const handleViewAppointment = (appointment) => {
    console.log('View appointment:', appointment);
    alert(`Viewing appointment #${appointment.id}\nPatient: ${appointment.patient.name}\nDoctor: ${appointment.doctor.name}\nDate: ${appointment.appointment_date} ${appointment.appointment_time}`);
    // In real app: navigate(`/admin/appointments/${appointment.id}/`);
  };

  const handleEditAppointment = (appointment) => {
    console.log('Edit appointment:', appointment);
    alert(`Edit appointment #${appointment.id}\nThis feature will open edit modal in production.`);
  };

  const handleCancelAppointment = async (appointmentId, cancellationReason = 'Cancelled by admin') => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // Use optimistic updates for better UX
        await optimisticAppointmentOperations.cancelAppointment(
          appointmentId,
          cancellationReason,
          () => appointmentsApi.cancelAppointment(appointmentId, { cancellation_reason: cancellationReason })
        );
        
        notificationService.showSuccess('Appointment cancelled successfully');
        updateLocalStats(appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled', cancellation_reason: cancellationReason }
            : apt
        ));
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
        // Error is already handled by optimistic operations
      }
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      // Use optimistic updates for better UX
      await optimisticAppointmentOperations.updateStatus(
        appointmentId,
        newStatus,
        () => appointmentsApi.updateStatus(appointmentId, { status: newStatus })
      );
      
      notificationService.showSuccess(`Appointment status updated to ${newStatus}`);
      updateLocalStats(appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus }
          : apt
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
      // Error is already handled by optimistic operations
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return '';
    return status.toLowerCase();
  };

  const filteredAppointments = appointments.filter(apt => {
    // Apply status filter
    if (filter !== 'all' && normalizeStatus(apt.status) !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        apt.patient?.name?.toLowerCase().includes(searchLower) ||
        apt.doctor?.name?.toLowerCase().includes(searchLower) ||
        apt.reason?.toLowerCase().includes(searchLower) ||
        apt.notes?.toLowerCase().includes(searchLower) ||
        apt.appointment_date?.includes(searchTerm)
      );
    }
    
    return true;
  });

  const handleRetry = () => {
    initializeData();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCreateAppointment = () => {
    alert('Create appointment feature coming soon');
    // In production: navigate('/admin/appointments/create/');
  };

  const handleExportData = () => {
    // Simple CSV export for demo
    const csvContent = [
      ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status', 'Reason'],
      ...filteredAppointments.map(apt => [
        apt.id,
        apt.patient.name,
        apt.doctor.name,
        apt.appointment_date,
        apt.appointment_time,
        apt.status,
        apt.reason
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert('Appointments exported successfully!');
  };

  if (loading) {
    return (
      <div className="all-appointments-loading">
        <div className="loading-spinner"></div>
        <p>
          {connectionTested 
            ? 'Loading appointments data...' 
            : 'Testing connection to backend server...'}
        </p>
        {!connectionTested && (
          <p className="loading-subtext">This may take a few moments</p>
        )}
      </div>
    );
  }

  return (
    <div className="all-appointments-container">
      <div className="all-appointments-header">
        <div className="header-main">
          <h1 className="all-appointments-title">Appointment Management</h1>
          <p className="all-appointments-subtitle">
            Manage, monitor, and track all patient appointments
          </p>
        </div>
        
        <div className="header-status-section">
          <div className="connection-status">
            {usingMockData ? (
              <div className="status-mock">
                <span className="status-icon">⚠️</span>
                <div className="status-details">
                  <span className="status-text">Demo Mode</span>
                  <span className="status-subtext">Using sample data</span>
                </div>
              </div>
            ) : (
              <div className="status-connected">
                <span className="status-icon"></span>
                <div className="status-details">
                  <span className="status-subtext"></span>
                </div>
              </div>
            )}
          </div>
          
          {/* Real-time connection status */}
          <div className="realtime-status">
            <span className={`realtime-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢' : '🔴'}
            </span>
            <span className="realtime-text">
              {isConnected ? 'Real-time updates active' : 'Real-time updates offline'}
            </span>
            {lastUpdate && (
              <span className="last-update">
                Last update: {lastUpdate.timestamp.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="header-actions">
            <button 
              onClick={handleRetry}
              className="refresh-btn"
              disabled={loading}
              title="Refresh appointments data"
            >
              <span className="btn-icon">🔄</span>
              Refresh Data
            </button>
            <button 
              className="create-btn" 
              onClick={handleCreateAppointment}
              title="Create new appointment"
            >
              <span className="btn-icon">+</span>
              New Appointment
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="appointments-alert">
          <div className="alert-content">
            <span className="alert-icon">ℹ️</span>
            <div className="alert-text">
              <strong>Note:</strong> {error}
            </div>
          </div>
          <button 
            onClick={() => setError(null)}
            className="alert-close"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="appointments-stats-grid">
        <div className="stat-card stat-card-total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-trend">All Time</div>
        </div>
        
        <div className="stat-card stat-card-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-trend">Awaiting confirmation</div>
        </div>
        
        <div className="stat-card stat-card-confirmed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-trend">Scheduled</div>
        </div>
        
        <div className="stat-card stat-card-completed">
          <div className="stat-icon">🏁</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-trend">Finished</div>
        </div>
        
        <div className="stat-card stat-card-cancelled">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{stats.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
          <div className="stat-trend">Cancelled/Rescheduled</div>
        </div>
        
        <div className="stat-card stat-card-today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today's</div>
          </div>
          <div className="stat-trend">Today: {formatDate(new Date().toISOString())}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="appointments-filters-container">
        <div className="filters-section">
          <h3 className="filters-title">Filter by Status</h3>
          <div className="filters-buttons">
            <button
              onClick={() => setFilter('all')}
              className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : ''}`}
            >
              All <span className="filter-count">({stats.total})</span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`filter-btn filter-btn-yellow ${filter === 'pending' ? 'filter-btn-active' : ''}`}
            >
              Pending <span className="filter-count">({stats.pending})</span>
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`filter-btn filter-btn-green ${filter === 'confirmed' ? 'filter-btn-active' : ''}`}
            >
              Confirmed <span className="filter-count">({stats.confirmed})</span>
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`filter-btn filter-btn-blue ${filter === 'completed' ? 'filter-btn-active' : ''}`}
            >
              Completed <span className="filter-count">({stats.completed})</span>
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`filter-btn filter-btn-red ${filter === 'cancelled' ? 'filter-btn-active' : ''}`}
            >
              Cancelled <span className="filter-count">({stats.cancelled})</span>
            </button>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by patient, doctor, reason, or date..."
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={handleClearSearch}
                className="search-clear"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="search-info">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="appointments-table-container">
        {filteredAppointments.length > 0 ? (
          <>
            <div className="table-header">
              <div className="table-info">
                <span className="table-count">
                  Displaying {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                </span>
                {filter !== 'all' && (
                  <span className="table-filter-active">
                    Filtered by: <strong>{filter}</strong>
                  </span>
                )}
                {searchTerm && (
                  <span className="table-search-active">
                    Search: <strong>"{searchTerm}"</strong>
                  </span>
                )}
              </div>
              <div className="table-actions">
                <button 
                  onClick={() => window.print()}
                  className="action-btn"
                >
                  🖨️ Print
                </button>
                <button 
                  onClick={handleExportData}
                  className="action-btn"
                >
                  📊 Export
                </button>
              </div>
            </div>
            
            <AppointmentTable
              appointments={filteredAppointments}
              onView={handleViewAppointment}
              onEdit={handleEditAppointment}
              onCancel={handleCancelAppointment}
              onStatusUpdate={handleUpdateStatus}
              userRole="admin"
            />
            
            <div className="table-footer">
              <div className="footer-info">
                {usingMockData && (
                  <div className="demo-notice">
                    <span className="demo-icon">💡</span>
                    <span>You're viewing demo data. Connect to backend for real data.</span>
                  </div>
                )}
                <div className="last-updated">
                  Last updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
              {filteredAppointments.length > 5 && (
                <div className="footer-pagination">
                  <button className="pagination-btn" disabled>← Previous</button>
                  <span className="pagination-info">Page 1 of 1</span>
                  <button className="pagination-btn" disabled>Next →</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-appointments">
            <div className="no-data-icon">📭</div>
            <h3>No Appointments Found</h3>
            <p>
              {searchTerm 
                ? `No appointments match "${searchTerm}"`
                : `No appointments with status "${filter}" found`
              }
            </p>
            <div className="no-data-actions">
              {(searchTerm || filter !== 'all') && (
                <button 
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              )}
              <button 
                onClick={handleRetry}
                className="retry-btn"
              >
                Try Again
              </button>
              <button 
                onClick={handleCreateAppointment}
                className="create-btn"
              >
                Create New Appointment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <details className="help-details">
          <summary className="help-summary">
            <span className="help-icon">❓</span>
            <span>Need help with appointments?</span>
          </summary>
          <div className="help-content">
            <h4>Appointment Management Guide</h4>
            <ul>
              <li><strong>Pending:</strong> Appointments awaiting confirmation</li>
              <li><strong>Confirmed:</strong> Scheduled and confirmed appointments</li>
              <li><strong>Completed:</strong> Finished appointments</li>
              <li><strong>Cancelled:</strong> Cancelled or rescheduled appointments</li>
              <li>Click on any appointment to view details</li>
              <li>Use filters to narrow down your view</li>
              <li>Click on status badges to update appointment status</li>
              {usingMockData && (
                <li><strong>Demo Mode:</strong> You're viewing sample data. Connect backend for real data.</li>
              )}
            </ul>
            <div className="help-contact">
              For technical support, contact: <strong>support@medicalsystem.com</strong>
            </div>
          </div>
        </details>
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AllAppointments;