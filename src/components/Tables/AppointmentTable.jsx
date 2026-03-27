import React from 'react';
import { format, parseISO, isValid, parse } from 'date-fns';
import './AppointmentTable.css';

const AppointmentTable = ({ 
  appointments = [], 
  onView, 
  onEdit, 
  onCancel, 
  onStatusUpdate,
  userRole = 'admin' 
}) => {
  
  // Safe date formatting with date-fns
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      
      // Try ISO format first
      try {
        date = parseISO(dateString);
      } catch {
        date = null;
      }
      
      // If ISO parsing failed or invalid, try other formats
      if (!date || !isValid(date)) {
        // Try YYYY-MM-DD format
        try {
          date = parse(dateString, 'yyyy-MM-dd', new Date());
        } catch {
          date = null;
        }
      }
      
      // If still invalid, try native Date
      if (!date || !isValid(date)) {
        date = new Date(dateString);
      }
      
      // Check if we have a valid date
      if (!isValid(date)) {
        console.warn('Invalid date string:', dateString);
        return dateString; // Return original string
      }
      
      // Format the date nicely
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString || 'N/A';
    }
  };
  
  // Safe time formatting
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      // If it's already formatted with AM/PM, return as is
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // Try to parse as a time string (HH:MM:SS or HH:MM)
      const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      }
      
      // If it's an ISO string, extract time
      try {
        const date = parseISO(`2000-01-01T${timeString}`);
        if (isValid(date)) {
          return format(date, 'hh:mm a');
        }
      } catch {
        // Ignore and try next method
      }
      
      return timeString; // Return original if can't parse
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString || 'N/A';
    }
  };
  
  // Format full datetime
  const formatDateTime = (dateString, timeString) => {
    const date = formatDate(dateString);
    const time = formatTime(timeString);
    
    if (date === 'N/A' && time === 'N/A') return 'N/A';
    if (date === 'N/A') return `Time: ${time}`;
    if (time === 'N/A') return date;
    
    return `${date}, ${time}`;
  };
  
  // Get status badge class
  const getStatusClass = (status) => {
    if (!status) return 'status-unknown';
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };
  
  // Get status display text
  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };
  
  // Handle empty appointments
  if (!appointments || appointments.length === 0) {
    return (
      <div className="appointments-empty">
        <div className="empty-icon">📅</div>
        <h3>No Appointments Found</h3>
        <p>There are no appointments to display at the moment.</p>
      </div>
    );
  }

  return (
    <div className="appointments-table-wrapper">
      <div className="table-header-info">
        <span className="table-count">
          Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="table-responsive">
        <table className="appointments-table">
          <thead>
            <tr>
              <th className="column-id">ID</th>
              <th className="column-patient">Patient</th>
              <th className="column-doctor">Doctor</th>
              <th className="column-datetime">Date & Time</th>
              <th className="column-reason">Reason</th>
              <th className="column-status">Status</th>
              <th className="column-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => {
              // Safely extract values with fallbacks
              const id = appointment.id || 'N/A';
              const patientName = appointment.patient?.name || 'Unknown Patient';
              const patientEmail = appointment.patient?.email || '';
              const doctorName = appointment.doctor?.name || 'Unknown Doctor';
              const doctorSpecialization = appointment.doctor?.specialization || '';
              const appointmentDate = appointment.appointment_date || appointment.date || '';
              const appointmentTime = appointment.appointment_time || appointment.time || '';
              const reason = appointment.reason || 'No reason provided';
              const status = appointment.status || 'unknown';
              const notes = appointment.notes || '';
              
              return (
                <tr key={id} className={`appointment-row ${getStatusClass(status)}-row`}>
                  <td className="appointment-id">
                    <span className="id-badge">#{id}</span>
                  </td>
                  
                  <td className="patient-cell">
                    <div className="patient-info">
                      <div className="patient-name">{patientName}</div>
                      {patientEmail && (
                        <div className="patient-email">{patientEmail}</div>
                      )}
                      {notes && (
                        <div className="patient-notes" title={notes}>
                          📝 Note available
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="doctor-cell">
                    <div className="doctor-info">
                      <div className="doctor-name">{doctorName}</div>
                      {doctorSpecialization && (
                        <div className="doctor-specialization">
                          🩺 {doctorSpecialization}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="datetime-cell">
                    <div className="datetime-info">
                      <div className="appointment-date">
                        📅 {formatDate(appointmentDate)}
                      </div>
                      <div className="appointment-time">
                        🕒 {formatTime(appointmentTime)}
                      </div>
                      <div className="datetime-full">
                        {formatDateTime(appointmentDate, appointmentTime)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="reason-cell">
                    <div className="reason-wrapper">
                      <div className="reason-text" title={reason}>
                        {reason.length > 60 ? `${reason.substring(0, 60)}...` : reason}
                      </div>
                      {appointment.cancellation_reason && status === 'cancelled' && (
                        <div className="cancellation-reason" title={appointment.cancellation_reason}>
                          ❌ {appointment.cancellation_reason.substring(0, 40)}...
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="status-cell">
                    <div className="status-wrapper">
                      <span className={`status-badge ${getStatusClass(status)}`}>
                        {getStatusText(status)}
                      </span>
                      {status === 'pending' && (
                        <span className="status-indicator">⏳</span>
                      )}
                      {status === 'confirmed' && (
                        <span className="status-indicator">✅</span>
                      )}
                      {status === 'completed' && (
                        <span className="status-indicator">🏁</span>
                      )}
                      {status === 'cancelled' && (
                        <span className="status-indicator">❌</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        onClick={() => onView && onView(appointment)}
                        className="action-btn view-btn"
                        title="View Details"
                      >
                        <span className="btn-icon">👁️</span>
                        <span className="btn-text">View</span>
                      </button>
                      
                      <button
                        onClick={() => onEdit && onEdit(appointment)}
                        className="action-btn edit-btn"
                        title="Edit Appointment"
                      >
                        <span className="btn-icon">✏️</span>
                        <span className="btn-text">Edit</span>
                      </button>
                      
                      {status !== 'cancelled' && (
                        <button
                          onClick={() => onCancel && onCancel(appointment.id)}
                          className="action-btn cancel-btn"
                          title="Cancel Appointment"
                        >
                          <span className="btn-icon">❌</span>
                          <span className="btn-text">Cancel</span>
                        </button>
                      )}
                      
                      {/* Status update dropdown for admin */}
                      {userRole === 'admin' && status !== 'cancelled' && (
                        <div className="status-update-dropdown">
                          <select
                            value={status}
                            onChange={(e) => onStatusUpdate && onStatusUpdate(appointment.id, e.target.value)}
                            className="status-select"
                            title="Update Status"
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="confirmed">✅ Confirm</option>
                            <option value="completed">🏁 Complete</option>
                            <option value="cancelled">❌ Cancel</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="table-footer">
        <div className="status-summary">
          <div className="summary-item status-pending">Pending: {appointments.filter(a => a.status === 'pending').length}</div>
          <div className="summary-item status-confirmed">Confirmed: {appointments.filter(a => a.status === 'confirmed').length}</div>
          <div className="summary-item status-completed">Completed: {appointments.filter(a => a.status === 'completed').length}</div>
          <div className="summary-item status-cancelled">Cancelled: {appointments.filter(a => a.status === 'cancelled').length}</div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;