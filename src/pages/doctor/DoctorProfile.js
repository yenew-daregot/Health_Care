import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Stethoscope, 
  DollarSign,
  MapPin,
  BriefcaseMedical,
  Award,
  Clock,
  Edit,
  Save,
  X,
  Loader2,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import doctorsApi from '../../api/doctorsApi';
import { toast } from 'react-hot-toast';
import './DoctorProfile.css';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    years_of_experience: '',
    consultation_fee: '',
    address: '',
    qualification: '',
    bio: '',
    available_hours: '',
    available_days: '',
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await doctorsApi.getProfile();
      setDoctor(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        specialization: response.data.specialization?.name || response.data.specialization || '',
        years_of_experience: response.data.years_of_experience || '',
        consultation_fee: response.data.consultation_fee || '',
        address: response.data.address || '',
        qualification: response.data.qualification || '',
        bio: response.data.bio || '',
        available_hours: response.data.available_hours || '',
        available_days: response.data.available_days || '',
      });
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      console.log('Saving profile with data:', formData);
      
      // Prepare data for update - include all fields, not just non-empty ones
      const updateData = {
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        phone: formData.phone || '', // This will be mapped to phone_number in backend
        qualification: formData.qualification || '',
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : 0,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : 0,
        address: formData.address || '',
        bio: formData.bio || '',
        available_hours: formData.available_hours || '',
        available_days: formData.available_days || '',
      };

      // Handle specialization - send as specialization_name
      if (formData.specialization) {
        updateData.specialization_name = formData.specialization;
      }

      console.log('Sending update data:', updateData);

      // Use PATCH for partial updates instead of PUT
      const response = await doctorsApi.patchProfile(updateData);
      
      console.log('Profile update response:', response);
      console.log('Response data:', response?.data);
      
      if (response && response.data) {
        setDoctor(response.data);
        setEditing(false);
        
        // Show success toast
        toast.success('Profile updated successfully! 🎉');
        
        // Refresh profile data to ensure UI is in sync
        await fetchDoctorProfile();
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to update profile';
      
      if (error.response) {
        // Server responded with error status
        console.error('Server error response:', error.response.data);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network error:', error.request);
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      first_name: doctor?.first_name || '',
      last_name: doctor?.last_name || '',
      email: doctor?.email || '',
      phone: doctor?.phone || '',
      specialization: doctor?.specialization?.name || doctor?.specialization || '',
      years_of_experience: doctor?.years_of_experience || '',
      consultation_fee: doctor?.consultation_fee || '',
      address: doctor?.address || '',
      qualification: doctor?.qualification || '',
      bio: doctor?.bio || '',
      available_hours: doctor?.available_hours || '',
      available_days: doctor?.available_days || '',
    });
    setEditing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFullName = () => {
    if (!doctor) return '';
    return `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();
  };

  if (loading) {
    return (
      <div className="doctor-profile-container">
        <div className="doctor-profile-wrapper">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-profile-container">
        <div className="doctor-profile-wrapper">
          <button 
            onClick={() => navigate('/doctor/dashboard')} 
            className="back-button"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="profile-card">
            <div className="error-state">
              <AlertCircle size={64} color="#fbbf24" />
              <h2>Profile Not Found</h2>
              <p>We couldn't load your profile data. This might be a temporary issue.</p>
              <button 
                onClick={fetchDoctorProfile}
                className="btn btn-primary"
              >
                <Loader2 size={18} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-container">
      <div className="doctor-profile-wrapper fade-in">
        <button 
          onClick={() => navigate('/doctor/dashboard')} 
          className="back-button"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="profile-card slide-up">
          {/* Header Section */}
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-header-info">
                <h1>Doctor Profile</h1>
                <p className="profile-header-subtitle">
                  Manage your professional information and settings
                </p>
              </div>
              <div className="profile-header-actions">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn btn-primary"
                  >
                    <Edit size={18} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn btn-success"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} /> Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="btn btn-secondary"
                    >
                      <X size={18} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-content">
            <div className="profile-grid">
              {/* Personal Information */}
              <div className="profile-section">
                <div className="section-header">
                  <div className="section-icon">
                    <User size={24} />
                  </div>
                  <h2 className="section-title">Personal Information</h2>
                </div>
                
                <div className="form-group">
                  <label className="form-label" data-tooltip="Enter your full legal name as it appears on your medical license">Full Name</label>
                  {editing ? (
                    <div className="form-field">
                      <User className="field-icon" size={20} />
                      <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Last Name"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="form-field">
                      <User className="field-icon" size={20} />
                      <div className={`form-display ${!getFullName() ? 'empty' : ''}`}>
                        {getFullName() || 'Not provided'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" data-tooltip="Professional email address for patient communications">Email Address</label>
                  <div className="form-field">
                    <Mail className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Email Address"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.email ? 'empty' : ''}`}>
                        {doctor.email || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" data-tooltip="Contact number for appointment scheduling and emergencies">Phone Number</label>
                  <div className="form-field">
                    <Phone className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Phone Number"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.phone ? 'empty' : ''}`}>
                        {doctor.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <div className="form-field">
                    <MapPin className="field-icon" size={20} />
                    {editing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="form-input form-textarea"
                        placeholder="Professional Address"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.address ? 'empty' : ''}`}>
                        {doctor.address || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                {(doctor.bio || editing) && (
                  <div className="form-group">
                    <label className="form-label">Professional Bio</label>
                    <div className="form-field">
                      <BriefcaseMedical className="field-icon" size={20} />
                      {editing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="4"
                          className="form-input form-textarea"
                          placeholder="Tell patients about your experience and approach to medicine..."
                        />
                      ) : (
                        <div className={`form-display ${!doctor.bio ? 'empty' : ''}`}>
                          {doctor.bio || 'No bio provided'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="profile-section">
                <div className="section-header">
                  <div className="section-icon">
                    <BriefcaseMedical size={24} />
                  </div>
                  <h2 className="section-title">Professional Information</h2>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Medical Specialization</label>
                  <div className="form-field">
                    <Stethoscope className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Cardiology, Pediatrics, General Medicine"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.specialization?.name && !doctor.specialization ? 'empty' : ''}`}>
                        {doctor.specialization?.name || doctor.specialization || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <div className="form-field">
                    <Calendar className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="number"
                        name="years_of_experience"
                        value={formData.years_of_experience}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        className="form-input"
                        placeholder="Years of practice"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.years_of_experience ? 'empty' : ''}`}>
                        {doctor.years_of_experience ? `${doctor.years_of_experience} years` : 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Qualification</label>
                  <div className="form-field">
                    <Award className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., MBBS, MD, MS"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.qualification ? 'empty' : ''}`}>
                        {doctor.qualification || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee</label>
                  <div className="form-field">
                    <DollarSign className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="number"
                        name="consultation_fee"
                        value={formData.consultation_fee}
                        onChange={handleInputChange}
                        min="0"
                        step="50"
                        className="form-input"
                        placeholder="Fee per consultation"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.consultation_fee ? 'empty' : ''}`}>
                        {doctor.consultation_fee ? formatCurrency(doctor.consultation_fee) : 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Hours</label>
                  <div className="form-field">
                    <Clock className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="text"
                        name="available_hours"
                        value={formData.available_hours}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 9:00 AM - 6:00 PM"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.available_hours ? 'empty' : ''}`}>
                        {doctor.available_hours || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Available Days</label>
                  <div className="form-field">
                    <Calendar className="field-icon" size={20} />
                    {editing ? (
                      <input
                        type="text"
                        name="available_days"
                        value={formData.available_days}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Monday - Friday"
                      />
                    ) : (
                      <div className={`form-display ${!doctor.available_days ? 'empty' : ''}`}>
                        {doctor.available_days || 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                {!editing && (
                  <div className="status-grid">
                    <div className={`status-card ${doctor.is_available ? 'available' : 'unavailable'}`}>
                      <div className="status-label">Availability Status</div>
                      <div className="status-value">
                        {doctor.is_available ? (
                          <>
                            <CheckCircle size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Available
                          </>
                        ) : (
                          <>
                            <X size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Not Available
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`status-card ${doctor.is_verified ? 'verified' : 'pending'}`}>
                      <div className="status-label">Verification Status</div>
                      <div className="status-value">
                        {doctor.is_verified ? (
                          <>
                            <Shield size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Verified
                          </>
                        ) : (
                          <>
                            <AlertCircle size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
                            Pending
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
