import React, { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, DollarSign, ShieldAlert, Settings, BarChart3, Users, UserPlus, UserCog, ChevronDown,
         ArrowLeft, Edit, Trash2, Eye, Phone, Mail, MapPin, Droplets, Calendar as CalendarIcon, Stethoscope,
         Heart, Brain, Bone, Activity, Scissors, Microscope, Thermometer, Eye as EyeIcon, Clock, FileText,
         RefreshCw, CheckCircle, AlertCircle, Save, X, Pill, AlertTriangle } from 'lucide-react';
import adminApi from '../../api/adminApi';  
import doctorsApi from '../../api/doctorsApi';
import patientsApi from '../../api/patientsApi';
import './AdminDashboard.css';
// Dashboard Header Component
const DashboardHeader = ({ onShowAddPatient, onShowViewPatients, onShowAddDoctor, onShowViewDoctors }) => {
  const [patientsDropdownOpen, setPatientsDropdownOpen] = useState(false);
  const [doctorsDropdownOpen, setDoctorsDropdownOpen] = useState(false);
  return (
    <div className="dashboard-navbar">
      <div className="navbar-brand">
        <h2>Admin Dashboard</h2>
      </div>
      <div className="navbar-links">
        <div 
          className="dropdown"
          onMouseEnter={() => setPatientsDropdownOpen(true)}
          onMouseLeave={() => setPatientsDropdownOpen(false)}
        >
          <button className="dropdown-toggle">
            <User size={16} />
            Patients <ChevronDown size={14} />
          </button>
          {patientsDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={onShowAddPatient} className="dropdown-item">
                <UserPlus size={16} /> Add Patient
              </button>
              <button onClick={onShowViewPatients} className="dropdown-item">
                <Eye size={16} /> View Patients
              </button>
            </div>
          )}
        </div>

        <div 
          className="dropdown"
          onMouseEnter={() => setDoctorsDropdownOpen(true)}
          onMouseLeave={() => setDoctorsDropdownOpen(false)}
        >
          <button className="dropdown-toggle">
            <UserCog size={16} />
            Doctors <ChevronDown size={14} />
          </button>
          {doctorsDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={onShowAddDoctor} className="dropdown-item">
                <UserPlus size={16} /> Add Doctor
              </button>
              <button onClick={onShowViewDoctors} className="dropdown-item">
                <UserCog size={16} /> View Doctors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Icon Card Component with Enhanced Display
const IconCard = ({ icon: Icon, title, value, subtext, color = 'icon-card-blue', onClick, actionIcon, loading = false }) => (
  <div className={`icon-card ${color} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div className="icon-card-icon-container">
      <Icon className="icon-card-icon" size={24} />
      {actionIcon && (
        <div className="icon-card-action">
          {actionIcon}
        </div>
      )}
    </div>
    <div className="icon-card-header">
      <div className="icon-card-value">
        {loading ? (
          <div className="spinner-small"></div>
        ) : (
          value
        )}
      </div>
      <div className="icon-card-title">{title}</div>
    </div>
    {subtext && <div className="icon-card-subtext">{subtext}</div>}
    {onClick && (
      <div className="icon-card-hover-text">
        Click to view details
      </div>
    )}
  </div>
);

// Edit Patient Form Component (Using adminApi)
const EditPatientForm = ({ patient, onPatientUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    date_of_birth: '',
    age: '',
    gender: '',
    blood_group: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    insurance_id: '',
    allergy_notes: '',
    chronic_conditions: '',
    height: '',
    weight: ''
  });
  
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    username: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const genderChoices = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupChoices = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  useEffect(() => {
    if (patient) {
      // Set patient data
      setFormData({
        date_of_birth: patient.date_of_birth || '',
        age: patient.age || '',
        gender: patient.gender || '',
        blood_group: patient.blood_group || '',
        emergency_contact: patient.emergency_contact || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        insurance_id: patient.insurance_id || '',
        allergy_notes: patient.allergy_notes || '',
        chronic_conditions: patient.chronic_conditions || '',
        height: patient.height || '',
        weight: patient.weight || ''
      });
      
      // Set user data
      if (patient.user) {
        setUserData({
          first_name: patient.user.first_name || '',
          last_name: patient.user.last_name || '',
          email: patient.user.email || '',
          phone: patient.user.phone || '',
          address: patient.user.address || '',
          username: patient.user.username || ''
        });
      }
    }
  }, [patient]);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format data for update - use flat structure for user fields
      const updateData = {
        // Patient fields
        ...formData,
        // User fields (flat structure)
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address
      };
      // Clean up data
      if (updateData.age) updateData.age = parseInt(updateData.age);
      if (updateData.height) updateData.height = parseFloat(updateData.height);
      if (updateData.weight) updateData.weight = parseFloat(updateData.weight);
      console.log('Updating patient with data:', updateData);
      // Use regular patients API for update
      const updatedPatient = await patientsApi.updatePatient(patient.id, updateData);      
      setSuccess('Patient updated successfully!');      
      setTimeout(() => {
        onPatientUpdated(updatedPatient);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating patient:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          err.response?.data?.user?.email?.[0] ||
                          err.response?.data?.user?.phone?.[0] ||
                          'Failed to update patient. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const patientName = patient?.user ? 
    `${patient.user.first_name || ''} ${patient.user.last_name || ''}`.trim() : 
    'Unknown Patient';

  return (
    <div className="add-patient-container">
      <div className="form-header">
        <button onClick={onCancel} className="back-button">
          <ArrowLeft size={20} />
          Back to Patients
        </button>
        <h1>Edit Patient: {patientName}</h1>
      </div>
      
      <div className="form-card">
        <div className="patient-id-display">
          <span className="patient-id-label">Patient ID:</span>
          <span className="patient-id-value">#{patient?.id}</span>
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} />
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  className="form-input"
                  placeholder="Username"
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <Activity size={16} />
              Medical Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Age"
                  min="0"
                  max="150"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="">Select Gender</option>
                  {genderChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleFormChange}
                  className="form-select"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroupChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Height in cm"
                  min="50"
                  max="250"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Weight in kg"
                  min="2"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Allergy Notes</label>
                <textarea
                  name="allergy_notes"
                  value={formData.allergy_notes}
                  onChange={handleFormChange}
                  className="form-textarea"
                  placeholder="Any known allergies..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chronic Conditions</label>
                <textarea
                  name="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={handleFormChange}
                  className="form-textarea"
                  placeholder="Any chronic medical conditions..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <ShieldAlert size={16} />
              Emergency & Insurance Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Insurance ID</label>
              <input
                type="text"
                name="insurance_id"
                value={formData.insurance_id}
                onChange={handleFormChange}
                className="form-input"
                placeholder="Insurance policy number"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// Edit Doctor Form Component (Using doctorsApi)
const EditDoctorForm = ({ doctor, onDoctorUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    specialization: '',
    license_number: '',
    qualification: '',
    years_of_experience: '',
    consultation_fee: '',
    bio: '',
    is_available: true,
    is_verified: true,
    consultation_hours: {}
  });
  
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    username: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    // Fetch specializations
    const fetchSpecializations = async () => {
      try {
        console.log('Fetching specializations for EditDoctorForm...');
        const response = await doctorsApi.getSpecializations();
        console.log('Specializations response:', response);
        
        let specializationsData = [];
        
        // Handle different response formats
        if (Array.isArray(response)) {
          specializationsData = response;
        } else if (response && Array.isArray(response.results)) {
          specializationsData = response.results;
        } else if (response && response.data) {
          if (Array.isArray(response.data)) {
            specializationsData = response.data;
          } else if (Array.isArray(response.data.results)) {
            specializationsData = response.data.results;
          }
        }       
        // Ensure each specialization has required fields
        specializationsData = specializationsData.filter(spec => 
          spec && typeof spec === 'object' && spec.id && spec.name
        );       
        console.log('Processed specializations for EditDoctorForm:', specializationsData);
        setSpecializations(specializationsData);        
        if (specializationsData.length === 0) {
          console.warn('No valid specializations found. Creating fallback options.');
          // Provide fallback specializations if none are loaded
          setSpecializations([
            { id: 1, name: 'General Medicine' },
            { id: 2, name: 'Cardiology' },
            { id: 3, name: 'Dermatology' },
            { id: 4, name: 'Neurology' },
            { id: 5, name: 'Orthopedics' },
            { id: 6, name: 'Pediatrics' },
            { id: 7, name: 'Psychiatry' },
            { id: 8, name: 'Surgery' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching specializations in EditDoctorForm:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });        
        // Set fallback specializations on error
        setSpecializations([
          { id: 1, name: 'General Medicine' },
          { id: 2, name: 'Cardiology' },
          { id: 3, name: 'Dermatology' },
          { id: 4, name: 'Neurology' },
          { id: 5, name: 'Orthopedics' },
          { id: 6, name: 'Pediatrics' },
          { id: 7, name: 'Psychiatry' },
          { id: 8, name: 'Surgery' }
        ]);       
        setError('Failed to load specializations. Using default options.');
      }
    };
    fetchSpecializations();
    // Set initial data
    if (doctor) {
      setFormData({
        specialization: doctor.specialization?.id || doctor.specialization || '',
        license_number: doctor.license_number || '',
        qualification: doctor.qualification || '',
        years_of_experience: doctor.years_of_experience || '',
        consultation_fee: doctor.consultation_fee || '',
        bio: doctor.bio || '',
        is_available: doctor.is_available !== undefined ? doctor.is_available : true,
        is_verified: doctor.is_verified !== undefined ? doctor.is_verified : true,
        consultation_hours: doctor.consultation_hours || {}
      });     
      if (doctor.user) {
        setUserData({
          first_name: doctor.user.first_name || '',
          last_name: doctor.user.last_name || '',
          email: doctor.user.email || '',
          phone: doctor.user.phone || '',
          address: doctor.user.address || '',
          username: doctor.user.username || ''
        });
      }
    }
  }, [doctor]);
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Format data for update - use flat structure for user fields
      const updateData = {
        // Doctor fields
        specialization_id: formData.specialization ? parseInt(formData.specialization) : null,
        license_number: formData.license_number,
        qualification: formData.qualification,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : 0,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0,
        bio: formData.bio,
        is_available: formData.is_available,
        is_verified: formData.is_verified,
        consultation_hours: formData.consultation_hours,
        // User fields (flat structure) - now including editable fields
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_email: userData.email,
        phone: userData.phone,
        address: userData.address
      };
      console.log('Updating doctor with data:', updateData);
      // Update doctor using doctors API
      const updatedDoctor = await doctorsApi.updateDoctor(doctor.id, updateData);
      setSuccess('Doctor updated successfully!');     
      setTimeout(() => {
        onDoctorUpdated(updatedDoctor);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating doctor:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          err.response?.data?.user?.phone?.[0] ||
                          'Failed to update doctor. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const doctorName = doctor?.user ? 
    `Dr. ${doctor.user.first_name || ''} ${doctor.user.last_name || ''}`.trim() : 
    'Unknown Doctor';
  return (
    <div className="add-patient-container">
      <div className="form-header">
        <button onClick={onCancel} className="back-button">
          <ArrowLeft size={20} />
          Back to Doctors
        </button>
        <h1>Edit Doctor: {doctorName}</h1>
      </div>      
      <div className="form-card">
        <div className="patient-id-display">
          <span className="patient-id-label">Doctor ID:</span>
          <span className="patient-id-value">#{doctor?.id}</span>
        </div>       
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}       
        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            {success}
          </div>
        )}       
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} />
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={userData.first_name}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="First name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={userData.last_name}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={userData.username}
                  className="form-input"
                  placeholder="Username"
                  readOnly
                  disabled
                  title="Username cannot be changed"
                />
                <small className="form-hint">Username cannot be modified</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleUserChange}
                  className="form-input"
                  placeholder="Address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <Stethoscope size={16} />
              Professional Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleFormChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Specialization</option>
                  {Array.isArray(specializations) && specializations.length > 0 ? (
                    specializations.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading specializations...</option>
                  )}
                </select>
                {(!Array.isArray(specializations) || specializations.length === 0) && (
                  <small className="form-hint text-warning">
                    If specializations don't load, please refresh the page or contact support.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">License Number *</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Medical license number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Qualifications *</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="e.g., MBBS, MD, MS"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Consultation fee"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Availability Status</label>
                <div className="checkbox-group-inline">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_available: e.target.checked
                      }))}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Available</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_verified: e.target.checked
                      }))}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Verified</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleFormChange}
                className="form-textarea"
                placeholder="Brief professional biography..."
                rows="4"
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// Add Patient Form Component (Using adminApi.createPatient)
const AddPatientForm = ({ onPatientAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    age: '',
    gender: '',
    blood_group: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    insurance_id: '',
    allergy_notes: '',
    chronic_conditions: '',
    height: '',
    weight: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const genderChoices = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];
  const bloodGroupChoices = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const calculateAge = (dateString) => {
    if (!dateString) return '';
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };
  const handleDateOfBirthChange = (e) => {
    const dateValue = e.target.value;
    setFormData(prev => ({
      ...prev,
      date_of_birth: dateValue,
      age: calculateAge(dateValue)
    }));
  };
  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.email || !formData.username || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      // Format the data correctly for the admin API - nested structure
      const patientData = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone || '',  
          address: formData.address || ''
        },
        date_of_birth: formData.date_of_birth || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || '',
        blood_group: formData.blood_group || '',
        emergency_contact: formData.emergency_contact || '',
        emergency_contact_phone: formData.emergency_contact_phone || '',
        insurance_id: formData.insurance_id || '',
        allergy_notes: formData.allergy_notes || '',
        chronic_conditions: formData.chronic_conditions || '',
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null
      };      
      console.log('Creating patient with admin API:', patientData);
      console.log('Data structure check:', {
        hasUser: !!patientData.user,
        userFields: patientData.user ? Object.keys(patientData.user) : [],
        patientFields: Object.keys(patientData).filter(key => key !== 'user')
      });     
      // Use admin API to create patient (admin/create-patient/)
      const response = await adminApi.createPatient(patientData);
      console.log('Patient creation response:', response);     
      setSuccess('Patient added successfully!');     
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        date_of_birth: '',
        age: '',
        gender: '',
        blood_group: '',
        emergency_contact: '',
        emergency_contact_phone: '',
        insurance_id: '',
        allergy_notes: '',
        chronic_conditions: '',
        height: '',
        weight: ''
      });     
      setTimeout(() => {
        onPatientAdded(response);
      }, 1500);
      
    } catch (err) {
      console.error('Patient creation error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers
      });     
      let errorMessage = 'Failed to add patient. Please try again.';      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Detailed error data:', errorData);       
        // Handle different error response formats
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.errors) {
          // Handle validation errors
          const firstError = Object.values(errorData.errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = firstError;
          }
        } else if (errorData.user) {
          // Handle nested user validation errors
          const userErrors = errorData.user;
          const firstUserError = Object.values(userErrors)[0];
          if (Array.isArray(firstUserError)) {
            errorMessage = `User ${Object.keys(userErrors)[0]}: ${firstUserError[0]}`;
          } else {
            errorMessage = `User ${Object.keys(userErrors)[0]}: ${firstUserError}`;
          }
        } else if (typeof errorData === 'object') {
          // Handle any other object-based errors
          for (const [field, fieldErrors] of Object.entries(errorData)) {
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              errorMessage = `${field}: ${fieldErrors[0]}`;
              break;
            } else if (typeof fieldErrors === 'string') {
              errorMessage = `${field}: ${fieldErrors}`;
              break;
            }
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.response?.status) {
        errorMessage = `Server error (${err.response.status}): ${err.response.statusText || 'Unknown error'}`;
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-container">
      <div className="form-header">
        <button onClick={onCancel} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Add Patient</h1>
      </div>
      
      <div className="form-card">
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} />
              Login Credentials
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter password (min 8 characters)"
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm password"
                  required
                  minLength="8"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} />
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g, +251...."
                />
                <small className="form-hint">Format: 10-15 digits, optionally starting with +</small>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <Activity size={16} />
              Medical Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleDateOfBirthChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  className="form-input"
                  placeholder="Auto-calculated"
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Gender</option>
                  {genderChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroupChoices.map(choice => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Height in cm"
                  min="50"
                  max="250"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Weight in kg"
                  min="2"
                  max="300"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Allergy Notes</label>
                <textarea
                  name="allergy_notes"
                  value={formData.allergy_notes}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Any known allergies..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chronic Conditions</label>
                <textarea
                  name="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Any chronic medical conditions..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <ShieldAlert size={16} />
              Emergency & Insurance Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Emergency contact name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g, +251...."
                />
                <small className="form-hint">Format: 10-15 digits, optionally starting with +</small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Insurance ID</label>
              <input
                type="text"
                name="insurance_id"
                value={formData.insurance_id}
                onChange={handleChange}
                className="form-input"
                placeholder="Insurance policy number"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Adding Patient...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add Patient
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Doctor Form Component (Using adminApi.createDoctor)
const AddDoctorForm = ({ onDoctorAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    specialization: '',
    license_number: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    bio: '',
    is_available: true,
    is_verified: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        console.log('Fetching specializations...');
        const response = await doctorsApi.getSpecializations();
        console.log('Specializations response:', response);
        
        let specializationsData = [];
        
        // Handle different response formats
        if (Array.isArray(response)) {
          specializationsData = response;
        } else if (response && Array.isArray(response.results)) {
          specializationsData = response.results;
        } else if (response && response.data) {
          if (Array.isArray(response.data)) {
            specializationsData = response.data;
          } else if (Array.isArray(response.data.results)) {
            specializationsData = response.data.results;
          }
        }
        
        // Ensure each specialization has required fields
        specializationsData = specializationsData.filter(spec => 
          spec && typeof spec === 'object' && spec.id && spec.name
        );
        
        console.log('Processed specializations:', specializationsData);
        setSpecializations(specializationsData);
        
        if (specializationsData.length === 0) {
          console.warn('No valid specializations found. Creating fallback options.');
          // Provide fallback specializations if none are loaded
          setSpecializations([
            { id: 1, name: 'General Medicine' },
            { id: 2, name: 'Cardiology' },
            { id: 3, name: 'Dermatology' },
            { id: 4, name: 'Neurology' },
            { id: 5, name: 'Orthopedics' },
            { id: 6, name: 'Pediatrics' },
            { id: 7, name: 'Psychiatry' },
            { id: 8, name: 'Surgery' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching specializations:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Set fallback specializations on error
        setSpecializations([
          { id: 1, name: 'General Medicine' },
          { id: 2, name: 'Cardiology' },
          { id: 3, name: 'Dermatology' },
          { id: 4, name: 'Neurology' },
          { id: 5, name: 'Orthopedics' },
          { id: 6, name: 'Pediatrics' },
          { id: 7, name: 'Psychiatry' },
          { id: 8, name: 'Surgery' }
        ]);
        
        setError('Failed to load specializations. Using default options.');
      }
    };
    fetchSpecializations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const validateForm = () => {
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!formData.email || !formData.username || !formData.first_name || 
        !formData.last_name || !formData.specialization || !formData.license_number || !formData.qualification) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!formData.specialization || formData.specialization === '') {
      setError('Please select a specialization');
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    // License number validation
    if (formData.license_number && formData.license_number.length < 6) {
      setError('License number must be at least 6 characters');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      // Format data for API using admin API format - nested structure
      const doctorData = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone || '',  // Note: backend expects phone_number
          address: formData.address || ''
        },
        specialization: parseInt(formData.specialization), // Convert to integer ID
        license_number: formData.license_number,
        qualification: formData.qualification,
        years_of_experience: formData.experience_years ? parseInt(formData.experience_years) : 0,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0,
        bio: formData.bio || '',
        is_available: formData.is_available,
        is_verified: formData.is_verified
      };
      console.log('Creating doctor with admin API:', doctorData);
      console.log('Data structure check:', {
        hasUser: !!doctorData.user,
        userFields: doctorData.user ? Object.keys(doctorData.user) : [],
        doctorFields: Object.keys(doctorData).filter(key => key !== 'user')
      });     
      // Use admin API to create doctor (admin/create-doctor/)
      const response = await adminApi.createDoctor(doctorData);
      console.log('Doctor creation response:', response);     
      setSuccess('Doctor added successfully!');      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        specialization: '',
        license_number: '',
        qualification: '',
        experience_years: '',
        consultation_fee: '',
        bio: '',
        is_available: true,
        is_verified: true
      });      
      setTimeout(() => {
        onDoctorAdded(response);
      }, 1500);     
    } catch (err) {
      console.error('Doctor creation error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers
      });     
      let errorMessage = 'Failed to add doctor. Please try again.';     
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Detailed error data:', errorData);
        
        // Handle different error response formats
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.errors) {
          // Handle validation errors
          const firstError = Object.values(errorData.errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = firstError;
          }
        } else if (errorData.user) {
          // Handle nested user validation errors
          const userErrors = errorData.user;
          const firstUserError = Object.values(userErrors)[0];
          if (Array.isArray(firstUserError)) {
            errorMessage = `User ${Object.keys(userErrors)[0]}: ${firstUserError[0]}`;
          } else {
            errorMessage = `User ${Object.keys(userErrors)[0]}: ${firstUserError}`;
          }
        } else if (typeof errorData === 'object') {
          // Handle any other object-based errors
          for (const [field, fieldErrors] of Object.entries(errorData)) {
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              errorMessage = `${field}: ${fieldErrors[0]}`;
              break;
            } else if (typeof fieldErrors === 'string') {
              errorMessage = `${field}: ${fieldErrors}`;
              break;
            }
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.response?.status) {
        errorMessage = `Server error (${err.response.status}): ${err.response.statusText || 'Unknown error'}`;
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }
      
      console.log('Final error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-container">
      <div className="form-header">
        <button onClick={onCancel} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Add Doctor</h1>
      </div>
      
      <div className="form-card">
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <CheckCircle size={16} />
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="patient-form">
          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} />
              Login Credentials
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter password (min 8 characters)"
                  required
                  minLength="8"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm password"
                  required
                  minLength="8"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <User size={16} />
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">
              <Stethoscope size={16} />
              Professional Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Specialization</option>
                  {!Array.isArray(specializations) || specializations.length === 0 ? (
                    <option value="" disabled>Loading specializations...</option>
                  ) : (
                    specializations.map(spec => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))
                  )}
                </select>
                {(!Array.isArray(specializations) || specializations.length === 0) && (
                  <small className="form-hint text-warning">
                    If specializations don't load, please refresh the page or contact support.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Medical License Number *</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Medical license number"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Qualifications *</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., MBBS, MD, MS"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Consultation fee"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Availability Status</label>
                <div className="checkbox-group-inline">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_available: e.target.checked
                      }))}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Available</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_verified: e.target.checked
                      }))}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">Verified</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Brief professional biography..."
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Adding Doctor...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Patients Component 
const ViewPatients = ({ patients, onCancel, onDeletePatient, onEditPatient, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    const patientName = getFullName(patient);
    
    const confirmMessage = `Are you sure you want to delete patient "${patientName}"?\n\nThis will permanently delete:\n- Patient profile and medical data\n- Associated user account\n- All appointment history\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      try {
        console.log(`Attempting to delete patient ${patientId}...`);
        await patientsApi.deletePatient(patientId);
        console.log(`✅ Patient ${patientId} deleted successfully`);
        
        // Update local state
        onDeletePatient(patientId);
        
        // Show success message
        alert(`Patient "${patientName}" has been successfully deleted.`);
        
      } catch (error) {
        console.error('Error deleting patient:', error);
        
        let errorMessage = 'Failed to delete patient. ';
        if (error.response?.status === 404) {
          errorMessage += 'Patient not found.';
        } else if (error.response?.status === 403) {
          errorMessage += 'You do not have permission to delete this patient.';
        } else if (error.response?.status === 400) {
          errorMessage += 'Cannot delete patient with existing appointments or medical records.';
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += 'Please try again or contact support.';
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`.toLowerCase();
    const email = (patient.user?.email || '').toLowerCase();
    const phone = patient.user?.phone || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           phone.includes(searchTerm);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFullName = (patient) => {
    console.log('Getting full name for patient:', patient);
    
    if (!patient) return 'Unknown Patient';
    
    // Try different possible structures
    let firstName = '';
    let lastName = '';
    
    //patient.user.first_name, patient.user.last_name (most common)
    if (patient.user && (patient.user.first_name || patient.user.last_name)) {
      firstName = patient.user.first_name || '';
      lastName = patient.user.last_name || '';
    }
    //patient.first_name, patient.last_name (direct fields)
    else if (patient.first_name || patient.last_name) {
      firstName = patient.first_name || '';
      lastName = patient.last_name || '';
    }
    //patient.user_first_name, patient.user_last_name (flattened)
    else if (patient.user_first_name || patient.user_last_name) {
      firstName = patient.user_first_name || '';
      lastName = patient.user_last_name || '';
    }
    // patient.user__first_name, patient.user__last_name (Django ORM style)
    else if (patient.user__first_name || patient.user__last_name) {
      firstName = patient.user__first_name || '';
      lastName = patient.user__last_name || '';
    }
    
    const fullName = `${firstName} ${lastName}`.trim();
    console.log('Computed full name:', fullName, 'from:', { firstName, lastName });
    
    // If still no name found, try to extract from email or username
    if (!fullName) {
      if (patient.user?.email) {
        const emailName = patient.user.email.split('@')[0];
        return emailName.charAt(0).toUpperCase() + emailName.slice(1);
      } else if (patient.user?.username) {
        return patient.user.username.charAt(0).toUpperCase() + patient.user.username.slice(1);
      }
    }
    
    return fullName || 'Unknown Patient';
  };

  return (
    <div className="view-patients-container">
      <div className="form-header">
        <button onClick={onCancel} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Patient Records</h1>
        <button onClick={onRefresh} className="refresh-button" disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="patients-table-container">
        <div className="table-header">
          <div className="table-header-content">
            <h3>Patient Database ({filteredPatients.length} records)</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        <div className="table-wrapper">
          <div className="scroll-hint">
            <span className="scroll-hint-text">← Scroll horizontally to see all columns →</span>
          </div>
          <table className="patients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Contact Info</th>
                <th>Age/DOB</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Emergency Contact</th>
                <th>Insurance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? 'No patients found matching your search' : 'No patients found'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="patient-id">#{patient.id}</td>
                    <td>
                      <div className="patient-name">
                        <strong>{getFullName(patient)}</strong>
                        {patient.user?.email && (
                          <div className="patient-email">
                            <Mail size={12} />
                            {patient.user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        {patient.user?.phone && (
                          <div className="phone-number">
                            <Phone size={12} />
                            {patient.user.phone}
                          </div>
                        )}
                        <div className="username">
                          @{patient.user?.username || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="age-dob-info">
                        {patient.age && (
                          <div className="age">
                            <strong>{patient.age} years</strong>
                          </div>
                        )}
                        {patient.date_of_birth && (
                          <div className="dob">
                            <CalendarIcon size={12} />
                            {formatDate(patient.date_of_birth)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {patient.gender && (
                        <span className={`gender-badge gender-${patient.gender.toLowerCase()}`}>
                          {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>
                      {patient.blood_group ? (
                        <span className="blood-group-badge">
                          <Droplets size={12} />
                          {patient.blood_group}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {patient.emergency_contact ? (
                        <div className="emergency-contact">
                          <div className="emergency-name">
                            {patient.emergency_contact}
                          </div>
                          {patient.emergency_contact_phone && (
                            <div className="emergency-phone">
                              <Phone size={12} />
                              {patient.emergency_contact_phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      {patient.insurance_id ? (
                        <div className="insurance-info">
                          <div className="insurance-id">
                            ID: {patient.insurance_id}
                          </div>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="btn btn-edit btn-sm"
                          title="Edit Patient"
                          disabled={loading}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          disabled={loading}
                          className="btn btn-danger btn-sm"
                          title="Delete Patient"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// View Doctors Component 
const ViewDoctors = ({ doctors, onCancel, onDeleteDoctor, onEditDoctor, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    const doctorName = getFullName(doctor);
    
    const confirmMessage = `Are you sure you want to delete doctor "${doctorName}"?\n\nThis will permanently delete:\n- Doctor profile and professional data\n- Associated user account\n- All appointment history and schedules\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      try {
        console.log(`Attempting to delete doctor ${doctorId}...`);
        await doctorsApi.deleteDoctor(doctorId);
        console.log(`✅ Doctor ${doctorId} deleted successfully`);
        
        // Update local state
        onDeleteDoctor(doctorId);
        
        // Show success message
        alert(`Doctor "${doctorName}" has been successfully deleted.`);
        
      } catch (error) {
        console.error('Error deleting doctor:', error);
        
        let errorMessage = 'Failed to delete doctor. ';
        if (error.response?.status === 404) {
          errorMessage += 'Doctor not found.';
        } else if (error.response?.status === 403) {
          errorMessage += 'You do not have permission to delete this doctor.';
        } else if (error.response?.status === 400) {
          errorMessage += 'Cannot delete doctor with existing appointments or patients.';
        } else if (error.response?.data?.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += 'Please try again or contact support.';
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `Dr. ${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.toLowerCase();
    const email = (doctor.user?.email || '').toLowerCase();
    const specialization = (doctor.specialization?.name || '').toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           specialization.includes(searchTerm.toLowerCase());
  });

  const getFullName = (doctor) => {
    console.log('Getting full name for doctor:', doctor);
    
    if (!doctor) return 'Unknown Doctor';
    
    // Try different possible structures
    let firstName = '';
    let lastName = '';
    
    // Structure 1: doctor.user.first_name, doctor.user.last_name (most common)
    if (doctor.user && (doctor.user.first_name || doctor.user.last_name)) {
      firstName = doctor.user.first_name || '';
      lastName = doctor.user.last_name || '';
    }
    // Structure 2: doctor.first_name, doctor.last_name (direct fields)
    else if (doctor.first_name || doctor.last_name) {
      firstName = doctor.first_name || '';
      lastName = doctor.last_name || '';
    }
    // Structure 3: doctor.user_first_name, doctor.user_last_name (flattened)
    else if (doctor.user_first_name || doctor.user_last_name) {
      firstName = doctor.user_first_name || '';
      lastName = doctor.user_last_name || '';
    }
    // Structure 4: doctor.user__first_name, doctor.user__last_name (Django ORM style)
    else if (doctor.user__first_name || doctor.user__last_name) {
      firstName = doctor.user__first_name || '';
      lastName = doctor.user__last_name || '';
    }
    
    const fullName = `Dr. ${firstName} ${lastName}`.trim();
    console.log('Computed doctor full name:', fullName, 'from:', { firstName, lastName });
    
    // If still no name found, try to extract from email or username
    if (fullName === 'Dr.' || fullName === 'Dr. ') {
      if (doctor.user?.email) {
        const emailName = doctor.user.email.split('@')[0];
        return `Dr. ${emailName.charAt(0).toUpperCase() + emailName.slice(1)}`;
      } else if (doctor.user?.username) {
        return `Dr. ${doctor.user.username.charAt(0).toUpperCase() + doctor.user.username.slice(1)}`;
      }
    }
    
    return fullName || 'Unknown Doctor';
  };

  return (
    <div className="view-patients-container">
      <div className="form-header">
        <button onClick={onCancel} className="back-button">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1>Doctor Records</h1>
        <button onClick={onRefresh} className="refresh-button" disabled={loading}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="patients-table-container">
        <div className="table-header">
          <div className="table-header-content">
            <h3>Doctor Database ({filteredDoctors.length} records)</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
        
        <div className="table-wrapper">
          <div className="scroll-hint">
            <span className="scroll-hint-text">← Scroll horizontally to see all columns →</span>
          </div>
          <table className="patients-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor Name</th>
                <th>Specialization</th>
                <th>Qualifications</th>
                <th>Experience</th>
                <th>Contact Info</th>
                <th>Availability</th>
                <th>Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? 'No doctors found matching your search' : 'No doctors found'}
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="patient-id">#{doctor.id}</td>
                    <td>
                      <div className="patient-name">
                        <strong>{getFullName(doctor)}</strong>
                        {doctor.user?.email && (
                          <div className="patient-email">
                            <Mail size={12} />
                            {doctor.user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="specialization-info">
                        <span className="specialization-badge">
                          <Stethoscope size={12} />
                          {doctor.specialization?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="qualifications-info">
                        <span className="qualifications-text">
                          {doctor.qualification || 'N/A'}
                        </span>
                        {doctor.license_number && (
                          <div className="license-number">
                            License: {doctor.license_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="experience-info">
                        {doctor.years_of_experience && (
                          <div className="experience-years">
                            <strong>{doctor.years_of_experience} years</strong>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        {doctor.user?.phone && (
                          <div className="phone-number">
                            <Phone size={12} />
                            {doctor.user.phone}
                          </div>
                        )}
                        <div className="username">
                          @{doctor.user?.username || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="availability-info">
                        <div className="status-badges">
                          {doctor.is_available ? (
                            <span className="status-badge status-available">Available</span>
                          ) : (
                            <span className="status-badge status-unavailable">Unavailable</span>
                          )}
                          {doctor.is_verified && (
                            <span className="status-badge status-verified">Verified</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {doctor.consultation_fee ? (
                        <div className="consultation-fee">
                          ${doctor.consultation_fee}
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => onEditDoctor(doctor)}
                          className="btn btn-edit btn-sm"
                          title="Edit Doctor"
                          disabled={loading}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          disabled={loading}
                          className="btn btn-danger btn-sm"
                          title="Delete Doctor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
// Main Dashboard View Component
const DashboardMain = ({ adminData, onShowAddPatient, onShowViewPatients, onShowAddDoctor, onShowViewDoctors, onRefresh }) => {
  // Fetch real dashboard stats
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [statsResponse, analyticsResponse, activitiesResponse, pendingResponse] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getAnalytics(),
          adminApi.getRecentActivities(),
          adminApi.getPendingActions()
        ]);

        setDashboardStats({
          systemStats: statsResponse.data || {
            totalUsers: 0,
            patients: 0,
            doctors: 0,
            todayAppointments: 0,
            revenue: 0,
            pendingApprovals: 0
          },
          analytics: analyticsResponse.data || {},
          recentActivities: activitiesResponse.data || [],
          pendingActions: pendingResponse.data || []
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Use fallback data
        setDashboardStats(adminData);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = dashboardStats?.systemStats || adminData?.systemStats;

  return (
    <div className="dashboard-content">
      <div className="dashboard-content-header">
        <h1>Admin Overview</h1>
        <p className="adimdashboard-subtitle">Welcome to the hospital management system</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onRefresh} className="refresh-button">
            <RefreshCw size={16} />
            Refresh Data
          </button>
           
        </div>
      </div>

      <div className="stats-grid">
        <IconCard 
          icon={UserCog} 
          title="Doctors" 
          value={stats?.doctors || 0}
          subtext="Total registered doctors" 
          color="icon-card-blue"
          onClick={onShowViewDoctors}
          actionIcon={<Eye size={16} />}
          loading={!stats}
        />
        <IconCard 
          icon={Users} 
          title="Patients" 
          value={stats?.patients || 0}
          subtext="Total registered patients" 
          color="icon-card-green"
          onClick={onShowViewPatients}
          actionIcon={<Eye size={16} />}
          loading={!stats}
        />
        <IconCard 
          icon={Calendar} 
          title="Appointments" 
          value={stats?.todayAppointments || 0}
          subtext="Appointments today" 
          color="icon-card-red"
        />
        <IconCard 
          icon={DollarSign} 
          title="Revenue" 
          value={`$${(stats?.revenue || 0).toLocaleString()}`} 
          subtext="Monthly revenue" 
          color="icon-card-purple"
        />
        <IconCard 
          icon={ShieldAlert} 
          title="Pending Approvals" 
          value={stats?.pendingApprovals || 0}
          subtext="Awaiting review" 
          color="icon-card-yellow"
        />
        <IconCard 
          icon={BarChart3} 
          title="Total Users" 
          value={stats?.totalUsers || 0}
          subtext="All system users" 
          color="icon-card-indigo"
        />
      </div>

      <div className="content-grid">
        <div className="dashboard-column">
          <div className="card">
            <h2 className="card-title">
              <ShieldAlert className="card-title-icon" />
              Quick Actions
            </h2>
            <div className="quick-actions">
              <button onClick={onShowAddPatient} className="quick-action-btn">
                <UserPlus className="quick-action-icon" />
                Add Patient
              </button>
              <button onClick={onShowViewPatients} className="quick-action-btn">
                <Eye className="quick-action-icon" />
                View Patients
              </button>
              <button onClick={onShowAddDoctor} className="quick-action-btn">
                <UserPlus className="quick-action-icon" />
                Add Doctor
              </button>
              <button onClick={onShowViewDoctors} className="quick-action-btn">
                <UserCog className="quick-action-icon" />
                View Doctors
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className="card">
            <h3 className="card-title">Recent Activity</h3>
            <div className="space-y-4">
              {(dashboardStats?.recentActivities || adminData?.recentActivities || []).length === 0 ? (
                <div className="no-data-message">No recent activities</div>
              ) : (
                (dashboardStats?.recentActivities || adminData?.recentActivities || []).map((activity, index) => (
                  <div key={index} className="list-item">
                    <div className="activity-content">
                      <h4 className="list-item-title">{activity.action}</h4>
                      <p className="list-item-subtitle">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Check if user is admin
  useEffect(() => {
    console.log('AdminDashboard - Auth Check:', {
      user: user,
      userRole: user?.role,
      isAuthenticated: !!user,
      hasToken: !!localStorage.getItem('access_token'),
      token: localStorage.getItem('access_token')?.substring(0, 20) + '...'
    });
    
    if (user && user.role !== 'ADMIN') {
      console.warn('User is not admin, redirecting to unauthorized');
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch patients and doctors in parallel
      const [patientsResponse, doctorsResponse] = await Promise.all([
        patientsApi.getPatients(),
        doctorsApi.getDoctors()
      ]);

      console.log('Patients response:', patientsResponse);
      console.log('Doctors response:', doctorsResponse);

      // Handle both possible response formats
      const patientsData = Array.isArray(patientsResponse.results) 
        ? patientsResponse.results 
        : Array.isArray(patientsResponse) 
          ? patientsResponse 
          : Array.isArray(patientsResponse.data?.results)
            ? patientsResponse.data.results
            : Array.isArray(patientsResponse.data)
              ? patientsResponse.data
              : [];
      
      const doctorsData = Array.isArray(doctorsResponse.results) 
        ? doctorsResponse.results 
        : Array.isArray(doctorsResponse) 
          ? doctorsResponse 
          : Array.isArray(doctorsResponse.data?.results)
            ? doctorsResponse.data.results
            : Array.isArray(doctorsResponse.data)
              ? doctorsResponse.data
              : [];

      console.log('Processed patients data:', patientsData);
      console.log('Processed doctors data:', doctorsData);
      
      // Log first patient to see structure
      if (patientsData.length > 0) {
        console.log('First patient structure:', patientsData[0]);
        console.log('First patient user data:', patientsData[0]?.user);
        console.log('First patient name test:', {
          user_first_name: patientsData[0]?.user?.first_name,
          user_last_name: patientsData[0]?.user?.last_name,
          direct_first_name: patientsData[0]?.first_name,
          direct_last_name: patientsData[0]?.last_name
        });
      }
      
      // Log first doctor to see structure
      if (doctorsData.length > 0) {
        console.log('First doctor structure:', doctorsData[0]);
        console.log('First doctor user data:', doctorsData[0]?.user);
        console.log('First doctor specialization:', doctorsData[0]?.specialization);
      }

      setPatients(patientsData);
      setDoctors(doctorsData);
      
      // Generate admin stats based on real data
      const adminStats = {
        systemStats: {
          totalUsers: patientsData.length + doctorsData.length + 1,
          patients: patientsData.length,
          doctors: doctorsData.length,
          pendingApprovals: Math.floor(Math.random() * 10) + 1,
          revenue: patientsData.length * 100 + doctorsData.length * 500,
          todayAppointments: Math.floor(patientsData.length * 0.1)
        },
        pendingActions: [
          { 
            id: 1, 
            type: 'Doctor Approval', 
            user: doctorsData.length > 0 ? `Dr. ${doctorsData[0]?.user?.first_name || 'Unknown'}` : 'Dr. Wilson', 
            daysPending: 3 
          },
          { 
            id: 2, 
            type: 'Lab Results', 
            user: patientsData.length > 0 ? `${patientsData[0]?.user?.first_name || 'Unknown'} Patient` : 'Patient John', 
            daysPending: 1 
          },
        ],
        recentActivities: [
          { 
            id: 1, 
            action: `Loaded ${patientsData.length} patients`, 
            user: 'System', 
            time: 'Just now' 
          },
          { 
            id: 2, 
            action: `Loaded ${doctorsData.length} doctors`, 
            user: 'System', 
            time: 'Just now' 
          },
          { 
            id: 3, 
            action: 'System updated', 
            user: 'Admin', 
            time: '1 hour ago' 
          },
        ],
        analytics: {
          serverUptime: '99.9%',
          activeSessions: patientsData.length + doctorsData.length,
          storageUsed: `${Math.round((patientsData.length + doctorsData.length) * 1.5)} GB / 1 TB`,
          apiRequests: patientsData.length + doctorsData.length,
        }
      };

      setAdminData(adminStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data
      setAdminData({
        systemStats: {
          totalUsers: 0,
          patients: 0,
          doctors: 0,
          pendingApprovals: 0,
          revenue: 0,
          todayAppointments: 0
        },
        pendingActions: [],
        recentActivities: [
          { id: 1, action: 'System initialized', user: 'Admin', time: 'Just now' }
        ],
        analytics: {
          serverUptime: '99.9%',
          activeSessions: 0,
          storageUsed: '0 GB / 1 TB',
          apiRequests: 0,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleShowAddPatient = () => {
    setCurrentView('addPatient');
  };

  const handleShowViewPatients = () => {
    setCurrentView('viewPatients');
  };

  const handleShowAddDoctor = () => {
    setCurrentView('addDoctor');
  };

  const handleShowViewDoctors = () => {
    setCurrentView('viewDoctors');
  };

  const handleCancel = () => {
    setCurrentView('dashboard');
  };

  const handlePatientAdded = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    
    if (adminData) {
      setAdminData(prev => ({
        ...prev,
        systemStats: {
          ...prev.systemStats,
          patients: prev.systemStats.patients + 1,
          totalUsers: prev.systemStats.totalUsers + 1
        },
        recentActivities: [
          { 
            id: Date.now(), 
            action: 'Patient registered', 
            user: `${newPatient.user?.first_name || 'New'} ${newPatient.user?.last_name || 'Patient'}`, 
            time: 'Just now' 
          },
          ...prev.recentActivities.slice(0, 3)
        ]
      }));
    }
    setCurrentView('dashboard');
  };

  const handleDoctorAdded = (newDoctor) => {
    setDoctors(prev => [newDoctor, ...prev]);
    
    if (adminData) {
      setAdminData(prev => ({
        ...prev,
        systemStats: {
          ...prev.systemStats,
          doctors: prev.systemStats.doctors + 1,
          totalUsers: prev.systemStats.totalUsers + 1
        },
        recentActivities: [
          { 
            id: Date.now(), 
            action: 'Doctor registered', 
            user: `Dr. ${newDoctor.user?.first_name || 'New'} ${newDoctor.user?.last_name || 'Doctor'}`, 
            time: 'Just now' 
          },
          ...prev.recentActivities.slice(0, 3)
        ]
      }));
    }
    setCurrentView('dashboard');
  };

  const handleDeletePatient = (patientId) => {
    setPatients(prev => prev.filter(patient => patient.id !== patientId));
    
    if (adminData) {
      setAdminData(prev => ({
        ...prev,
        systemStats: {
          ...prev.systemStats,
          patients: Math.max(0, prev.systemStats.patients - 1),
          totalUsers: Math.max(0, prev.systemStats.totalUsers - 1)
        }
      }));
    }
  };

  const handleDeleteDoctor = (doctorId) => {
    setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
    
    if (adminData) {
      setAdminData(prev => ({
        ...prev,
        systemStats: {
          ...prev.systemStats,
          doctors: Math.max(0, prev.systemStats.doctors - 1),
          totalUsers: Math.max(0, prev.systemStats.totalUsers - 1)
        }
      }));
    }
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setCurrentView('editPatient');
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView('editDoctor');
  };

  const handlePatientUpdated = (updatedPatient) => {
    setPatients(prev => prev.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    ));

    if (adminData) {
      setAdminData(prev => ({
        ...prev,
        recentActivities: [
          { 
            id: Date.now(), 
            action: 'Patient updated', 
            user: `${updatedPatient.user?.first_name || ''} ${updatedPatient.user?.last_name || ''}`, 
            time: 'Just now' 
          },
          ...prev.recentActivities.slice(0, 3)
        ]
      }));
    }

    setCurrentView('viewPatients');
  };

  const handleDoctorUpdated = (updatedDoctor) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === updatedDoctor.id ? updatedDoctor : doctor
    ));

    if (adminData) {
      setAdminData(prev => ({
        ...prev,
        recentActivities: [
          { 
            id: Date.now(), 
            action: 'Doctor updated', 
            user: `Dr. ${updatedDoctor.user?.first_name || ''} ${updatedDoctor.user?.last_name || ''}`, 
            time: 'Just now' 
          },
          ...prev.recentActivities.slice(0, 3)
        ]
      }));
    }

    setCurrentView('viewDoctors');
  };

  if (loading && currentView === 'dashboard') {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader 
        onShowAddPatient={handleShowAddPatient}
        onShowViewPatients={handleShowViewPatients}
        onShowAddDoctor={handleShowAddDoctor}
        onShowViewDoctors={handleShowViewDoctors}
      />

      {currentView === 'addPatient' ? (
        <AddPatientForm 
          onPatientAdded={handlePatientAdded}
          onCancel={handleCancel}
        />
      ) : currentView === 'viewPatients' ? (
        <ViewPatients 
          patients={patients}
          onCancel={handleCancel}
          onDeletePatient={handleDeletePatient}
          onEditPatient={handleEditPatient}
          onRefresh={handleRefresh}
        />
      ) : currentView === 'editPatient' && selectedPatient ? (
        <EditPatientForm 
          patient={selectedPatient}
          onPatientUpdated={handlePatientUpdated}
          onCancel={() => setCurrentView('viewPatients')}
        />
      ) : currentView === 'addDoctor' ? (
        <AddDoctorForm 
          onDoctorAdded={handleDoctorAdded}
          onCancel={handleCancel}
        />
      ) : currentView === 'viewDoctors' ? (
        <ViewDoctors 
          doctors={doctors}
          onCancel={handleCancel}
          onDeleteDoctor={handleDeleteDoctor}
          onEditDoctor={handleEditDoctor}
          onRefresh={handleRefresh}
        />
      ) : currentView === 'editDoctor' && selectedDoctor ? (
        <EditDoctorForm 
          doctor={selectedDoctor}
          onDoctorUpdated={handleDoctorUpdated}
          onCancel={() => setCurrentView('viewDoctors')}
        />
      ) : (
        <DashboardMain 
          adminData={adminData}
          onShowAddPatient={handleShowAddPatient}
          onShowViewPatients={handleShowViewPatients}
          onShowAddDoctor={handleShowAddDoctor}
          onShowViewDoctors={handleShowViewDoctors}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};
export default AdminDashboard;