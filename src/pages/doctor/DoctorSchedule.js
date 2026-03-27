import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Calendar, Plus, Edit, Trash2, 
  Power, PowerOff, Save, X, AlertCircle, CheckCircle,
  Coffee, Moon, Sun, Settings, Eye, EyeOff
} from 'lucide-react';
import doctorsApi from '../../api/doctorsApi';
import notificationService from '../../services/notificationService';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const navigate = useNavigate();
  
  // State management
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: [], exceptions: [],
    availability: null, doctor_info: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExceptionModal, setShowExceptionModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleSummary, setScheduleSummary] = useState(null);
  
  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    days: [],
    start_time: '09:00',
    end_time: '17:00',
    break_start: '12:00',
    break_end: '13:00',
    slot_duration: 30,
    max_patients_per_slot: 1,
    notes: ''
  });
  
  const [exceptionForm, setExceptionForm] = useState({
    date: '',
    exception_type: 'blocked',
    start_time: '',
    end_time: '',
    is_available: false,
    reason: '',
    notes: ''
  });

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load data on component mount
  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const [weeklyData, summaryData] = await Promise.all([
        doctorsApi.getWeeklySchedule(),
        doctorsApi.getScheduleSummary()
      ]);
      
      setWeeklySchedule(weeklyData.data);
      setScheduleSummary(summaryData.data);
    } catch (error) {
      console.error('Error loading schedule:', error);
      notificationService.showError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await doctorsApi.toggleAvailability();
      setWeeklySchedule(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          is_online: response.data.is_online
        }
      }));
      notificationService.showSuccess(response.data.message);
    } catch (error) {
      console.error('Error toggling availability:', error);
      notificationService.showError('Failed to update availability status');
    }
  };

  const handleCreateSchedule = async () => {
    try {
      setSaving(true);
      await doctorsApi.createBulkSchedule(scheduleForm);
      await loadScheduleData();
      setShowCreateModal(false);
      resetScheduleForm();
      notificationService.showSuccess('Schedule created successfully!');
    } catch (error) {
      console.error('Error creating schedule:', error);
      notificationService.showError('Failed to create schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      setSaving(true);
      await doctorsApi.updateSchedule(editingSchedule.id, scheduleForm);
      await loadScheduleData();
      setEditingSchedule(null);
      setShowCreateModal(false);
      resetScheduleForm();
      notificationService.showSuccess('Schedule updated successfully!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      notificationService.showError('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await doctorsApi.deleteSchedule(scheduleId);
      await loadScheduleData();
      notificationService.showSuccess('Schedule deleted successfully!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      notificationService.showError('Failed to delete schedule');
    }
  };

  const handleCreateException = async () => {
    try {
      setSaving(true);
      await doctorsApi.createScheduleException(exceptionForm);
      await loadScheduleData();
      setShowExceptionModal(false);
      resetExceptionForm();
      notificationService.showSuccess('Schedule exception created successfully!');
    } catch (error) {
      console.error('Error creating exception:', error);
      notificationService.showError('Failed to create schedule exception');
    } finally {
      setSaving(false);
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      days: [],
      start_time: '09:00',
      end_time: '17:00',
      break_start: '12:00',
      break_end: '13:00',
      slot_duration: 30,
      max_patients_per_slot: 1,
      notes: ''
    });
  };

  const resetExceptionForm = () => {
    setExceptionForm({
      date: '',
      exception_type: 'blocked',
      start_time: '',
      end_time: '',
      is_available: false,
      reason: '',
      notes: ''
    });
  };

  const openEditModal = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      days: [schedule.day_of_week],
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      break_start: schedule.break_start || '',
      break_end: schedule.break_end || '',
      slot_duration: schedule.slot_duration,
      max_patients_per_slot: schedule.max_patients_per_slot,
      notes: schedule.notes || ''
    });
    setShowCreateModal(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="doctor-schedule-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-schedule-container">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/doctor/dashboard')} 
            className="back-button"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="header-title">
            <h1><Clock size={28} /> Schedule Management</h1>
            <p>Manage your availability and working hours</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="availability-toggle">
            <button
              onClick={handleToggleAvailability}
              className={`availability-btn ${weeklySchedule.availability?.is_online ? 'online' : 'offline'}`}
            >
              {weeklySchedule.availability?.is_online ? (
                <>
                  <Power size={18} />
                  Online
                </>
              ) : (
                <>
                  <PowerOff size={18} />
                  Offline
                </>
              )}
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="create-schedule-btn"
          >
            <Plus size={18} />
            Add Schedule
          </button>
          
          <button
            onClick={() => setShowExceptionModal(true)}
            className="create-exception-btn"
          >
            <Calendar size={18} />
            Add Exception
          </button>
        </div>
      </div>

      {/* Schedule Summary Cards */}
      {scheduleSummary && (
        <div className="schedule-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={24} />
            </div>
            <div className="summary-content">
              <h3>{scheduleSummary.total_weekly_hours}h</h3>
              <p>Weekly Hours</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <Calendar size={24} />
            </div>
            <div className="summary-content">
              <h3>{scheduleSummary.active_days}</h3>
              <p>Active Days</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              <AlertCircle size={24} />
            </div>
            <div className="summary-content">
              <h3>{scheduleSummary.upcoming_exceptions}</h3>
              <p>Upcoming Exceptions</p>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">
              {weeklySchedule.availability?.is_online ? (
                <CheckCircle size={24} className="online" />
              ) : (
                <PowerOff size={24} className="offline" />
              )}
            </div>
            <div className="summary-content">
              <h3>{weeklySchedule.availability?.is_online ? 'Online' : 'Offline'}</h3>
              <p>Current Status</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Schedule Grid */}
      <div className="weekly-schedule">
        <h2>Weekly Schedule</h2>
        <div className="schedule-grid">
          {dayLabels.map((dayLabel, index) => {
            const dayKey = dayNames[index];
            const daySchedules = weeklySchedule[dayKey] || [];
            
            return (
              <div key={dayKey} className="day-column">
                <div className="day-header">
                  <h3>{dayLabel}</h3>
                  <span className="schedule-count">{daySchedules.length} slots</span>
                </div>
                
                <div className="day-schedules">
                  {daySchedules.length === 0 ? (
                    <div className="no-schedule">
                      <Moon size={32} />
                      <p>No schedule</p>
                    </div>
                  ) : (
                    daySchedules.map((schedule) => (
                      <div key={schedule.id} className="schedule-card">
                        <div className="schedule-time">
                          <Sun size={16} />
                          <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                        </div>
                        
                        {schedule.break_start && schedule.break_end && (
                          <div className="schedule-break">
                            <Coffee size={14} />
                            <span>Break: {formatTime(schedule.break_start)} - {formatTime(schedule.break_end)}</span>
                          </div>
                        )}
                        
                        <div className="schedule-details">
                          <span className="slot-duration">{schedule.slot_duration}min slots</span>
                          <span className="max-patients">Max {schedule.max_patients_per_slot} patient(s)</span>
                        </div>
                        
                        {schedule.notes && (
                          <div className="schedule-notes">
                            <p>{schedule.notes}</p>
                          </div>
                        )}
                        
                        <div className="schedule-actions">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="edit-btn"
                            title="Edit Schedule"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="delete-btn"
                            title="Delete Schedule"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Exceptions */}
      {weeklySchedule.exceptions && weeklySchedule.exceptions.length > 0 && (
        <div className="schedule-exceptions">
          <h2>Upcoming Exceptions</h2>
          <div className="exceptions-list">
            {weeklySchedule.exceptions.map((exception) => (
              <div key={exception.id} className={`exception-card ${exception.exception_type}`}>
                <div className="exception-header">
                  <div className="exception-date">
                    <Calendar size={16} />
                    <span>{new Date(exception.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`exception-type ${exception.exception_type}`}>
                    {exception.exception_type.replace('_', ' ')}
                  </span>
                </div>
                
                {exception.start_time && exception.end_time && (
                  <div className="exception-time">
                    <Clock size={14} />
                    <span>{formatTime(exception.start_time)} - {formatTime(exception.end_time)}</span>
                  </div>
                )}
                
                {exception.reason && (
                  <div className="exception-reason">
                    <p>{exception.reason}</p>
                  </div>
                )}
                
                <div className="exception-status">
                  {exception.is_available ? (
                    <span className="available">Available</span>
                  ) : (
                    <span className="unavailable">Unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Schedule Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content schedule-modal">
            <div className="modal-header">
              <h3>
                {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSchedule(null);
                  resetScheduleForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              {!editingSchedule && (
                <div className="form-group">
                  <label>Select Days</label>
                  <div className="days-selector">
                    {dayLabels.map((day, index) => (
                      <label key={index} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={scheduleForm.days.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setScheduleForm(prev => ({
                                ...prev,
                                days: [...prev.days, index]
                              }));
                            } else {
                              setScheduleForm(prev => ({
                                ...prev,
                                days: prev.days.filter(d => d !== index)
                              }));
                            }
                          }}
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={scheduleForm.start_time}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      start_time: e.target.value
                    }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={scheduleForm.end_time}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      end_time: e.target.value
                    }))}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Break Start (Optional)</label>
                  <input
                    type="time"
                    value={scheduleForm.break_start}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      break_start: e.target.value
                    }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>Break End (Optional)</label>
                  <input
                    type="time"
                    value={scheduleForm.break_end}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      break_end: e.target.value
                    }))}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Slot Duration (minutes)</label>
                  <select
                    value={scheduleForm.slot_duration}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      slot_duration: parseInt(e.target.value)
                    }))}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Max Patients per Slot</label>
                  <select
                    value={scheduleForm.max_patients_per_slot}
                    onChange={(e) => setScheduleForm(prev => ({
                      ...prev,
                      max_patients_per_slot: parseInt(e.target.value)
                    }))}
                  >
                    <option value={1}>1 Patient</option>
                    <option value={2}>2 Patients</option>
                    <option value={3}>3 Patients</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Add any notes about this schedule..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSchedule(null);
                  resetScheduleForm();
                }}
                className="cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
                className="save-btn"
                disabled={saving || (!editingSchedule && scheduleForm.days.length === 0)}
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exception Modal */}
      {showExceptionModal && (
        <div className="modal-overlay">
          <div className="modal-content exception-modal">
            <div className="modal-header">
              <h3>Create Schedule Exception</h3>
              <button
                onClick={() => {
                  setShowExceptionModal(false);
                  resetExceptionForm();
                }}
                className="close-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={exceptionForm.date}
                  onChange={(e) => setExceptionForm(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Exception Type</label>
                <select
                  value={exceptionForm.exception_type}
                  onChange={(e) => setExceptionForm(prev => ({
                    ...prev,
                    exception_type: e.target.value
                  }))}
                >
                  <option value="holiday">Holiday</option>
                  <option value="blocked">Blocked Time</option>
                  <option value="special_hours">Special Hours</option>
                  <option value="emergency">Emergency Block</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time (Optional)</label>
                  <input
                    type="time"
                    value={exceptionForm.start_time}
                    onChange={(e) => setExceptionForm(prev => ({
                      ...prev,
                      start_time: e.target.value
                    }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time (Optional)</label>
                  <input
                    type="time"
                    value={exceptionForm.end_time}
                    onChange={(e) => setExceptionForm(prev => ({
                      ...prev,
                      end_time: e.target.value
                    }))}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={exceptionForm.is_available}
                    onChange={(e) => setExceptionForm(prev => ({
                      ...prev,
                      is_available: e.target.checked
                    }))}
                  />
                  <span>Available during this time</span>
                </label>
              </div>
              
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={exceptionForm.reason}
                  onChange={(e) => setExceptionForm(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  placeholder="e.g., Conference, Personal leave, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={exceptionForm.notes}
                  onChange={(e) => setExceptionForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowExceptionModal(false);
                  resetExceptionForm();
                }}
                className="cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateException}
                className="save-btn"
                disabled={saving || !exceptionForm.date}
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Create Exception
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;