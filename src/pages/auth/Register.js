import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Shield, 
  Stethoscope, 
  Lock, 
  Calendar,
  UserPlus,
  Mail,
  Phone,
  User,
  Key,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import './Register.css';
import registerImage from '../../images/icon.png';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'PATIENT',
    phone_number: ''
  });
  
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Theme and UI state
  const [theme, setTheme] = useState('blue');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [step, setStep] = useState(1);

  // Apply theme and dark mode
  useEffect(() => {
    const container = document.querySelector('.health-portal-container');
    if (container) {
      container.className = `health-portal-container theme-${theme}`;
      container.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }
  }, [theme, darkMode]);

  // Calculate password strength
  const calculatePasswordStrength = useMemo(() => (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    
    if (score >= 6) return 'very-strong';
    if (score >= 4) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
  }, []);

  // Update password strength on password change
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength('weak');
    }
  }, [formData.password, calculatePasswordStrength]);

  // Password requirements
  const passwordRequirements = [
    { id: 'length', label: 'At least 8 characters', met: formData.password.length >= 8 },
    { id: 'lowercase', label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { id: 'uppercase', label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { id: 'number', label: 'Contains number', met: /[0-9]/.test(formData.password) },
    { id: 'special', label: 'Contains special character', met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  // Validate step 1 (basic info)
  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!acceptedTerms) errors.terms = 'You must accept the terms and conditions';
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  // Validate step 2 
  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.password.trim()) errors.password = 'Password is required';
    if (!formData.confirmPassword.trim()) errors.confirmPassword = 'Please confirm password';
    
    if (formData.password) {
      passwordRequirements.forEach(req => {
        if (!req.met && req.id === 'length') {
          errors.password = 'Password must be at least 8 characters';
        }
      });
    }
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Validate complete form for final submission
  const validateCompleteForm = () => {
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    return { ...step1Errors, ...step2Errors };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle continue to step 2
  const handleContinue = (e) => {
    e.preventDefault();
    clearError();
    
    const errors = validateStep1();
    
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    // Clear any password-related errors from previous attempts
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.password;
      delete newErrors.confirmPassword;
      return newErrors;
    });
    
    setStep(2);
  };

  // Handle back to step 1
  const handleBack = () => {
    setStep(1);
    // Clear password errors when going back
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.password;
      delete newErrors.confirmPassword;
      return newErrors;
    });
  };

  // Handle final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Validate both steps
    const errors = validateCompleteForm();
    
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      
      // If there are step 1 errors, go back to step 1
      const step1Fields = ['username', 'email', 'first_name', 'last_name', 'terms'];
      const hasStep1Errors = step1Fields.some(field => errors[field]);
      
      if (hasStep1Errors) {
        setStep(1);
      }
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    const registrationData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role,
      phone_number: formData.phone_number.trim() || ''
    };
    
    try {
      await register(registrationData);
      setRegistrationSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      // If error is about password, stay on step 2
      if (err.message && err.message.toLowerCase().includes('password')) {
        setStep(2);
      }
    }
  };

  const generateStrongPassword = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lower + upper + numbers + symbols;
    let password = '';
    
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 0; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
    
    // Clear password errors when generating new password
    setLocalErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.password;
      delete newErrors.confirmPassword;
      return newErrors;
    });
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'very-strong': return '#10b981';
      case 'strong': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'weak': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStrengthLabel = (strength) => {
    switch (strength) {
      case 'very-strong': return 'Very Strong';
      case 'strong': return 'Strong';
      case 'medium': return 'Medium';
      case 'weak': return 'Weak';
      default: return 'Very Weak';
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay active">
        <div className="loading-spinner"></div>
        <p className="loading-text">Creating your account...</p>
      </div>
    );
  }

  const themes = ['blue', 'green', 'purple', 'red'];

  return (
    <div className={`health-portal-container theme-${theme}`}>
      {/* Theme Selector */}
      <div className="theme-selector">
        {themes.map((t) => (
          <button
            key={t}
            className={`theme-button theme-${t} ${theme === t ? 'active' : ''}`}
            onClick={() => setTheme(t)}
            aria-label={`Select ${t} theme`}
          >
            <span />
          </button>
        ))}
      </div>

      {/* Dark Mode Toggle */}
      <button
        className="dark-mode-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="health-portal-card">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="brand-section">
            <div className="logo">
              <Stethoscope className="logo-icon" size={32} />
              <span>Healthcare+</span>
            </div>
            <h1 className="tagline">
              {step === 1 ? 'Start Your Health Journey' : 'Complete Your Profile'}
            </h1>
            <p className="description">
              {step === 1 
                ? 'Join thousands who trust us with their healthcare needs. Get instant access to medical professionals and personalized care.'
                : 'Just a few more details to complete your registration and access all features.'}
            </p>
          </div>

          <div className="features-section">
            <div className="feature-item">
              <div className="feature-icon">
                <Shield size={20} />
              </div>
              <span className="feature-text">HIPAA Compliant & Secure</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Calendar size={20} />
              </div>
              <span className="feature-text">24/7 Appointment Access</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Lock size={20} />
              </div>
              <span className="feature-text">End-to-End Encryption</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
            <div className="progress-text">
              Step {step} of 2 • {step === 1 ? 'Basic Information' : 'Account Setup'}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="form-container">
            {registrationSuccess ? (
              <div className="success-container">
                <div className="success-icon">
                  <CheckCircle size={80} />
                </div>
                <h2 className="success-title">Welcome to Healthcare+!</h2>
                <p className="success-message">
                  Your account has been created successfully. You'll be redirected to your dashboard shortly.
                </p>
                <div className="success-actions">
                  <div className="loading-spinner small"></div>
                  <span className="redirect-countdown">3s</span>
                </div>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <div className="form-image-container">
                    <img src={registerImage}
                         alt="Medical Registration" 
                          className="register-image"
                    />
                  </div>
                  <h2 className="form-title">
                    {step === 1 ? 'Create Account' : 'Set Up Password'}
                  </h2>
                  <p className="form-subtitle">
                    {step === 1 
                      ? 'Enter your basic information to get started'
                      : 'Create a secure password to protect your account'}
                  </p>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={20} className="alert-icon" />
                    <div className="alert-content">
                      <strong>Registration Error</strong>
                      <div className="alert-message">{error}</div>
                      {error.toLowerCase().includes('password') && (
                        <button
                          type="button"
                          className="alert-action"
                          onClick={generateStrongPassword}
                        >
                          <Sparkles size={16} />
                          Generate Strong Password
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <form className="register-form" onSubmit={step === 1 ? handleContinue : handleSubmit} noValidate>
                  {step === 1 ? (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="first_name" className="form-label required">
                            <User size={16} color='blue' />
                            First Name
                          </label>
                          <div className="form-input-wrapper">
                            <input
                              id="first_name"
                              name="first_name"
                              type="text"
                              className={`form-input ${localErrors.first_name ? 'error' : ''}`}
                              placeholder="first name"
                              value={formData.first_name}
                              onChange={handleChange}
                              disabled={loading}
                            />
                          </div>
                          {localErrors.first_name && (
                            <div className="validation-message error">
                              {localErrors.first_name}
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="last_name" className="form-label required">
                            <User size={16} color='blue' />
                            Last Name
                          </label>
                          <div className="form-input-wrapper">
                            <input
                              id="last_name"
                              name="last_name"
                              type="text"
                              className={`form-input ${localErrors.last_name ? 'error' : ''}`}
                              placeholder="last name"
                              value={formData.last_name}
                              onChange={handleChange}
                              disabled={loading}
                            />
                          </div>
                          {localErrors.last_name && (
                            <div className="validation-message error">
                              {localErrors.last_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="username" className="form-label required">
                          <User size={16} color='blue' />
                          Username
                        </label>
                        <div className="form-input-wrapper">
                          <input
                            id="username"
                            name="username"
                            type="text"
                            className={`form-input ${localErrors.username ? 'error' : ''}`}
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {localErrors.username && (
                          <div className="validation-message error">
                            {localErrors.username}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="email" className="form-label required">
                          <Mail size={16} color='blue' />
                          Email Address
                        </label>
                        <div className="form-input-wrapper">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className={`form-input ${localErrors.email ? 'error' : ''}`}
                            placeholder="email address"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                        {localErrors.email && (
                          <div className="validation-message error">
                            {localErrors.email}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone_number" className="form-label">
                          <Phone size={16} color='blue' />
                          Phone Number
                        </label>
                        <div className="form-input-wrapper">
                          <input
                            id="phone_number"
                            name="phone_number"
                            type="tel"
                            className="form-input"
                            placeholder="251..."
                            value={formData.phone_number}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="role" className="form-label required">
                          Role
                        </label>
                        <div className="form-input-wrapper">
                          <select
                            id="role"
                            name="role"
                            className="form-input"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                          >
                            <option value="PATIENT">Patient</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        </div>
                      </div>

                      <div className="terms-group">
                        <label className="terms-checkbox">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => {
                              setAcceptedTerms(e.target.checked);
                              if (localErrors.terms) {
                                setLocalErrors(prev => ({ ...prev, terms: '' }));
                              }
                            }}
                            disabled={loading}
                          />
                          <div className="checkbox-custom" />
                          <span className="terms-text">
                            I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and{' '}
                            <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                          </span>
                        </label>
                        {localErrors.terms && (
                          <div className="validation-message error">
                            {localErrors.terms}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group password-field">
                        <label htmlFor="password" className="form-label required">
                          <Key size={16} />
                          Password
                        </label>
                        <div className="form-input-wrapper">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className={`form-input ${localErrors.password ? 'error' : ''}`}
                            placeholder="strong password. min 8 character"
                            value={formData.password}
                            onChange={handlePasswordChange}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        
                        {/* Password Strength */}
                        <div className="password-strength">
                          <div className="strength-label">
                            <span>Strength:</span>
                            <span 
                              className="strength-text"
                              style={{ color: getStrengthColor(passwordStrength) }}
                            >
                              {getStrengthLabel(passwordStrength)}
                            </span>
                          </div>
                          <div className="strength-bar">
                            <div 
                              className="strength-fill"
                              style={{ 
                                width: `${(passwordRequirements.filter(r => r.met).length / passwordRequirements.length) * 100}%`,
                                backgroundColor: getStrengthColor(passwordStrength)
                              }}
                            />
                          </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="password-requirements">
                          {passwordRequirements.map(req => (
                            <div 
                              key={req.id}
                              className={`requirement-item ${req.met ? 'met' : ''}`}
                            >
                              <div className="requirement-icon">
                                {req.met ? '✓' : '○'}
                              </div>
                              <span className="requirement-text">{req.label}</span>
                            </div>
                          ))}
                        </div>
                        
                        {localErrors.password && (
                          <div className="validation-message error">
                            {localErrors.password}
                          </div>
                        )}
                        
                        <button
                          type="button"
                          className="generate-password"
                          onClick={generateStrongPassword}
                          disabled={loading}
                        >
                          <Sparkles size={16} />
                          Generate Strong Password
                        </button>
                      </div>

                      <div className="form-group password-field">
                        <label htmlFor="confirmPassword" className="form-label required">
                          <Key size={16} />
                          Confirm Password
                        </label>
                        <div className="form-input-wrapper">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`form-input ${localErrors.confirmPassword ? 'error' : ''}`}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {localErrors.confirmPassword && (
                          <div className="validation-message error">
                            {localErrors.confirmPassword}
                          </div>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                          <div className="validation-message success">
                            ✓ Passwords match
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="form-navigation">
                    {step === 2 && (
                      <button
                        type="button"
                        className="navigation-button back"
                        onClick={handleBack}
                        disabled={loading}
                      >
                        ← Back
                      </button>
                    )}
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="spinner"></div>
                          {step === 1 ? 'Checking...' : 'Creating Account...'}
                        </>
                      ) : step === 1 ? (
                        'Continue →'
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>

                <div className="login-link">
                  <p className="login-link-text">
                    Already have an account?{' '}
                    <Link to="/login" className="login-link-action">
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;