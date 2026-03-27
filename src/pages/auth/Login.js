import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Mail,
  LogIn,
  UserPlus,
  Key,
  HelpCircle,
  Sun,
  Moon,
  Sparkles,
  Smartphone,
  Calendar,
  ChevronRight,
  Bell
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: true
  });
  
  const [loginState, setLoginState] = useState({
    error: '',
    success: '',
    isLoading: false,
    showPassword: false,
    showForgotPassword: false,
    resetStep: 1,
    resetEmail: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
    isResetting: false,
    resetMessage: '',
    resetError: ''
  });
  
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [theme, setTheme] = useState('blue');
  const [darkMode, setDarkMode] = useState(false);
  
  const { login, forgotPassword, verifyResetCode, resetPassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const inputRef = useRef(null);
  
  // Apply theme and dark mode
  useEffect(() => {
    const container = document.querySelector('.health-portal-container');
    if (container) {
      container.className = `health-portal-container theme-${theme}`;
      container.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }
  }, [theme, darkMode]);
  
  // Auto-focus username input on mount
  useEffect(() => {
    const from = location.state?.from?.pathname || '/dashboard';
    console.log('📍 From location:', from);
    
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
    
    // Clear any previous auth errors on mount
    localStorage.removeItem('auth_error');
  }, [location]);
  
  // Check password strength
  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);
  
  // Check new password strength in reset flow
  useEffect(() => {
    if (loginState.resetStep === 3 && loginState.newPassword) {
      calculatePasswordStrength(loginState.newPassword);
    }
  }, [loginState.newPassword, loginState.resetStep]);
  
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    setPasswordStrength(Math.min(score, 100));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoginState(prev => ({ 
      ...prev, 
      error: '', 
      success: '', 
      isLoading: true 
    }));
    
    // Validate inputs
    if (!formData.username.trim()) {
      setLoginState(prev => ({ 
        ...prev, 
        error: 'Please enter your username',
        isLoading: false 
      }));
      return;
    }
    
    if (!formData.password.trim()) {
      setLoginState(prev => ({ 
        ...prev, 
        error: 'Please enter your password',
        isLoading: false 
      }));
      return;
    }
    
    try {
      // Prepare login data
      const loginData = {
        username: formData.username.trim(),
        password: formData.password
      };
      
      console.log('🔑 [LOGIN] Attempting login with:', loginData);
      
      // Clear localStorage before new login attempt
      localStorage.removeItem('auth_error');
      
      // Login with username
      const userData = await login(loginData);
      
      console.log('✅ [LOGIN] Login successful, user data:', userData);
      
      // ⭐ CRITICAL DEBUG: Check if role is present
      console.log('🔍 [LOGIN] Role check:', {
        hasRole: 'role' in userData,
        roleValue: userData?.role,
        allKeys: Object.keys(userData || {})
      });
      
      // ⭐ Also check what's stored in localStorage
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          console.log('📦 [LOGIN] Stored user in localStorage:', storedUser);
          console.log('🎯 [LOGIN] Stored user role:', storedUser?.role);
        } catch (parseErr) {
          console.error('❌ Error parsing stored user:', parseErr);
        }
      }
      
      // Get user role - IMPORTANT: Use actual role from userData
      const userRole = (userData?.role || 'PATIENT').toUpperCase();
      console.log('🎯 [LOGIN] Determined user role:', userRole);
      
      // Validate role against known roles
      const validRoles = ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE', 'STAFF', 'LABORATORIST'];
      const finalRole = validRoles.includes(userRole) ? userRole : 'PATIENT';
      
      console.log('🎯 [LOGIN] Final role after validation:', finalRole);
      
      setLoginState(prev => ({ 
        ...prev, 
        success: 'Authentication successful!',
        isLoading: false
      }));
      
      // Role-based redirect paths (matching your Django model)
      const roleRedirects = {
        'ADMIN': '/admin/dashboard',
        'DOCTOR': '/doctor/dashboard',
        'PATIENT': '/patient/dashboard',
        'NURSE': '/nurse/dashboard',
        'STAFF': '/staff/dashboard',
        'LABORATORIST': '/laboratorist/dashboard'
      };
      
      const redirectPath = roleRedirects[finalRole] || '/dashboard';
      console.log('📍 [LOGIN] Redirecting to:', redirectPath);
      
      // Store role info for debugging
      localStorage.setItem('last_login_role', finalRole);
      localStorage.setItem('last_login_time', new Date().toISOString());
      
      // Show success animation
      setTimeout(() => {
        navigate(redirectPath, { 
          replace: true,
          state: { 
            from: location,
            welcomeMessage: `Welcome back, ${userData.first_name || userData.username || 'User'}!`,
            userRole: finalRole
          }
        });
      }, 1000);
      
    } catch (err) {
      console.error('❌ [LOGIN] Error caught in handleSubmit:', {
        message: err.message,
        stack: err.stack,
        fullError: err
      });
      
      let errorMessage = err.message || 'Authentication failed';
      
      // Enhanced error messages
      if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Invalid username')) {
        errorMessage = 'Invalid username or password.';
      } else if (errorMessage.includes('disabled')) {
        errorMessage = 'Account is disabled. Please contact support.';
      } else if (errorMessage.includes('not found')) {
        errorMessage = 'Account not found. Please register first.';
      } else if (errorMessage.includes('too many')) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (errorMessage.includes('network') || errorMessage.includes('connect')) {
        errorMessage = 'Cannot connect to server. Please check your network connection.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Access denied. Your account may not have permission to access this system.';
        
        // Store error for debugging
        localStorage.setItem('auth_error', JSON.stringify({
          error: '403 Forbidden',
          timestamp: new Date().toISOString(),
          username: formData.username
        }));
      }
      
      setLoginState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isLoading: false
      }));
      
      // Shake animation on error
      if (formRef.current) {
        formRef.current.classList.add('shake-animation');
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.classList.remove('shake-animation');
          }
        }, 500);
      }
    }
  };
  
  const handleForgotPassword = () => {
    setLoginState(prev => ({ 
      ...prev, 
      showForgotPassword: true,
      resetStep: 1,
      resetEmail: '',
      resetError: '',
      resetMessage: ''
    }));
  };
  
  const handleResetEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginState.resetEmail.trim()) {
      setLoginState(prev => ({ ...prev, resetError: 'Please enter your email address' }));
      return;
    }
    
    setLoginState(prev => ({ ...prev, isResetting: true, resetError: '', resetMessage: '' }));
    
    try {
      console.log('🔄 Sending reset code to:', loginState.resetEmail);
      await forgotPassword({ email: loginState.resetEmail });
      setLoginState(prev => ({ 
        ...prev, 
        resetStep: 2,
        resetMessage: 'Reset code has been sent to your email. Please check your inbox.',
        isResetting: false
      }));
    } catch (err) {
      console.error('Forgot password error:', err);
      setLoginState(prev => ({ 
        ...prev, 
        resetError: err.message || 'Failed to send reset code. Please try again.',
        isResetting: false
      }));
    }
  };
  
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!loginState.resetCode.trim()) {
      setLoginState(prev => ({ ...prev, resetError: 'Please enter the reset code' }));
      return;
    }
    
    setLoginState(prev => ({ ...prev, isResetting: true, resetError: '', resetMessage: '' }));
    
    try {
      console.log('🔄 Verifying reset code:', loginState.resetCode);
      await verifyResetCode({
        email: loginState.resetEmail,
        code: loginState.resetCode
      });
      setLoginState(prev => ({ 
        ...prev, 
        resetStep: 3,
        resetMessage: 'Code verified! Please set your new password.',
        isResetting: false
      }));
    } catch (err) {
      console.error('Verify code error:', err);
      setLoginState(prev => ({ 
        ...prev, 
        resetError: err.message || 'Invalid reset code. Please try again.',
        isResetting: false
      }));
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!loginState.newPassword.trim()) {
      setLoginState(prev => ({ ...prev, resetError: 'Please enter a new password' }));
      return;
    }
    
    if (loginState.newPassword !== loginState.confirmPassword) {
      setLoginState(prev => ({ ...prev, resetError: 'Passwords do not match' }));
      return;
    }
    
    if (passwordStrength < 40) {
      setLoginState(prev => ({ ...prev, resetError: 'Password is too weak. Please use a stronger password.' }));
      return;
    }
    
    setLoginState(prev => ({ ...prev, isResetting: true, resetError: '', resetMessage: '' }));
    
    try {
      console.log('🔄 Resetting password for:', loginState.resetEmail);
      await resetPassword({
        email: loginState.resetEmail,
        code: loginState.resetCode,
        new_password: loginState.newPassword,
        confirm_password: loginState.confirmPassword
      });
      
      setLoginState(prev => ({ 
        ...prev, 
        resetMessage: 'Password reset successful! You can now login with your new password.',
        isResetting: false,
        showForgotPassword: false,
        resetStep: 1,
        resetEmail: '',
        resetCode: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Clear form after successful reset
      setFormData(prev => ({ ...prev, password: '' }));
      
    } catch (err) {
      console.error('Reset password error:', err);
      setLoginState(prev => ({ 
        ...prev, 
        resetError: err.message || 'Failed to reset password. Please try again.',
        isResetting: false
      }));
    }
  };
  
  const togglePasswordVisibility = () => {
    setLoginState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength >= 80) return '#10b981'; 
    if (passwordStrength >= 60) return '#3b82f6'; 
    if (passwordStrength >= 40) return '#f59e0b'; 
    return '#ef4444';
  };
  
  const getPasswordStrengthLabel = () => {
    if (passwordStrength >= 80) return 'Very Strong';
    if (passwordStrength >= 60) return 'Strong';
    if (passwordStrength >= 40) return 'Medium';
    if (passwordStrength >= 20) return 'Weak';
    return 'Very Weak';
  };
  
  const renderForgotPasswordForm = () => {
    switch (loginState.resetStep) {
      case 1:
        return (
          <div className="forgot-password-modal">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button 
                className="close-modal"
                onClick={() => setLoginState(prev => ({ ...prev, showForgotPassword: false }))}
              >
                ×
              </button>
            </div>
            <p className="modal-subtitle">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            
            <form onSubmit={handleResetEmailSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <Mail size={18} />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={loginState.resetEmail}
                  onChange={(e) => setLoginState(prev => ({ ...prev, resetEmail: e.target.value }))}
                  disabled={loginState.isResetting}
                  required
                />
              </div>
              
              {loginState.resetError && (
                <div className="status-message error">
                  <AlertCircle size={20} />
                  <div className="message-content">
                    <p>{loginState.resetError}</p>
                  </div>
                </div>
              )}
              
              {loginState.resetMessage && (
                <div className="status-message success">
                  <CheckCircle size={20} />
                  <div className="message-content">
                    <p>{loginState.resetMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setLoginState(prev => ({ ...prev, showForgotPassword: false }))}
                  disabled={loginState.isResetting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loginState.isResetting}
                >
                  {loginState.isResetting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      
      case 2:
        return (
          <div className="forgot-password-modal">
            <div className="modal-header">
              <h3>Enter Reset Code</h3>
              <button 
                className="close-modal"
                onClick={() => setLoginState(prev => ({ ...prev, showForgotPassword: false }))}
              >
                ×
              </button>
            </div>
            <p className="modal-subtitle">
              Enter the 6-digit code sent to {loginState.resetEmail}
            </p>
            
            <form onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label className="form-label">
                  <Key size={18} />
                  <span>Reset Code</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 6-digit code"
                  value={loginState.resetCode}
                  onChange={(e) => setLoginState(prev => ({ ...prev, resetCode: e.target.value }))}
                  maxLength={6}
                  disabled={loginState.isResetting}
                  required
                />
                <small className="input-hint">
                  Check your email for the reset code
                </small>
              </div>
              
              {loginState.resetError && (
                <div className="status-message error">
                  <AlertCircle size={20} />
                  <div className="message-content">
                    <p>{loginState.resetError}</p>
                  </div>
                </div>
              )}
              
              {loginState.resetMessage && (
                <div className="status-message success">
                  <CheckCircle size={20} />
                  <div className="message-content">
                    <p>{loginState.resetMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setLoginState(prev => ({ 
                    ...prev, 
                    resetStep: 1,
                    resetMessage: '',
                    resetError: ''
                  }))}
                  disabled={loginState.isResetting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loginState.isResetting}
                >
                  {loginState.isResetting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      
      case 3:
        return (
          <div className="forgot-password-modal">
            <div className="modal-header">
              <h3>Set New Password</h3>
              <button 
                className="close-modal"
                onClick={() => setLoginState(prev => ({ ...prev, showForgotPassword: false }))}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">
                  <Lock size={18} />
                  <span>New Password</span>
                </label>
                <input
                  type={loginState.showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter new password"
                  value={loginState.newPassword}
                  onChange={(e) => setLoginState(prev => ({ ...prev, newPassword: e.target.value }))}
                  disabled={loginState.isResetting}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Lock size={18} />
                  <span>Confirm Password</span>
                </label>
                <input
                  type={loginState.showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirm new password"
                  value={loginState.confirmPassword}
                  onChange={(e) => setLoginState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={loginState.isResetting}
                  required
                />
              </div>
              
              {loginState.newPassword && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    />
                  </div>
                  <div className="strength-labels">
                    <span>Strength:</span>
                    <span 
                      className="strength-text"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={loginState.showPassword}
                    onChange={() => setLoginState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    disabled={loginState.isResetting}
                  />
                  <div className="checkbox-custom" />
                  <span>Show password</span>
                </label>
              </div>
              
              {loginState.resetError && (
                <div className="status-message error">
                  <AlertCircle size={20} />
                  <div className="message-content">
                    <p>{loginState.resetError}</p>
                  </div>
                </div>
              )}
              
              {loginState.resetMessage && (
                <div className="status-message success">
                  <CheckCircle size={20} />
                  <div className="message-content">
                    <p>{loginState.resetMessage}</p>
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setLoginState(prev => ({ 
                    ...prev, 
                    resetStep: 2,
                    resetMessage: '',
                    resetError: ''
                  }))}
                  disabled={loginState.isResetting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loginState.isResetting}
                >
                  {loginState.isResetting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        );
      
      default:
        return null;
    }
  };

  const themes = ['blue', 'green', 'purple', 'red'];

  if (loginState.isLoading || authLoading) {
    return (
      <div className="loading-overlay active">
        <div className="loading-spinner"></div>
        <p className="loading-text">Signing you in...</p>
      </div>
    );
  }

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

      {/* Forgot Password Modal Overlay */}
      {loginState.showForgotPassword && (
        <div className="modal-overlay">
          {renderForgotPasswordForm()}
        </div>
      )}

      <div className="health-portal-card">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="brand-section">
            <div className="logo">
              <Stethoscope className="logo-icon" size={32} />
              <span>MediCare+</span>
            </div>
            <h1 className="tagline">
              Welcome Back to Your Health Journey
            </h1>
            <p className="description">
              Securely access your medical records, appointments, and connect with healthcare professionals.
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
                <Smartphone size={20} />
              </div>
              <span className="feature-text">Mobile-Friendly Interface</span>
            </div>
          </div>

          {/* Security Info */}
          <div className="security-info">
            <h4 className="security-title">Your Security Matters</h4>
            <ul className="security-list">
              <li>End-to-end encryption</li>
              <li>Two-factor authentication ready</li>
              <li>Automatic session timeout</li>
              <li>Real-time security monitoring</li>
            </ul>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="form-container">
            <div className="form-header">
              <div className="heart-icon">
                <LogIn size={32} />
              </div>
              <h2 className="form-title">
                Secure Login
              </h2>
              <p className="form-subtitle">
                Access your healthcare portal with your credentials
              </p>
            </div>

            {/* Status Messages */}
            {loginState.success && (
              <div className="status-message success">
                <CheckCircle size={20} />
                <div className="message-content">
                  <strong>Success!</strong>
                  <p>{loginState.success}</p>
                </div>
              </div>
            )}
            
            {loginState.error && (
              <div className="status-message error">
                <AlertCircle size={20} />
                <div className="message-content">
                  <strong>Authentication Error</strong>
                  <p>{loginState.error}</p>
                  {loginState.error.toLowerCase().includes('password') && (
                    <button
                      type="button"
                      className="alert-action"
                      onClick={handleForgotPassword}
                    >
                      <Sparkles size={16} />
                      Reset Password
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="debug-info">
                <details>
                  <summary>Debug Info</summary>
                  <div className="debug-content">
                    <p>Last login attempt: {localStorage.getItem('last_login_time') || 'Never'}</p>
                    <p>Last role detected: {localStorage.getItem('last_login_role') || 'None'}</p>
                    <p>Auth error: {localStorage.getItem('auth_error') || 'None'}</p>
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="debug-button"
                    >
                      Clear Storage & Reload
                    </button>
                  </div>
                </details>
              </div>
            )}

            {/* Login Form */}
            <form 
              ref={formRef}
              onSubmit={handleSubmit}
              className="login-form"
              noValidate
            >
              <div className="form-group">
                <label htmlFor="username" className="form-label required">
                  <User size={16} />
                  Username
                </label>
                <div className="form-input-wrapper">
                  <input
                    ref={inputRef}
                    id="username"
                    name="username"
                    type="text"
                    className="form-input"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    autoComplete="username"
                    disabled={loginState.isLoading}
                    required
                  />
                </div>
              </div>

              <div className="form-group password-field">
                <div className="password-header">
                  <label htmlFor="password" className="form-label required">
                    <Key size={16} />
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={handleForgotPassword}
                    disabled={loginState.isLoading}
                  >
                    <HelpCircle size={14} />
                    Forgot Password?
                  </button>
                </div>
                <div className="form-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={loginState.showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    autoComplete="current-password"
                    disabled={loginState.isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loginState.isLoading}
                    aria-label={loginState.showPassword ? 'Hide password' : 'Show password'}
                  >
                    {loginState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-label">
                      <span>Strength:</span>
                      <span 
                        className="strength-text"
                        style={{ color: getPasswordStrengthColor() }}
                      >
                        {getPasswordStrengthLabel()}
                      </span>
                    </div>
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    disabled={loginState.isLoading}
                  />
                  <div className="checkbox-custom" />
                  <span>Remember this device</span>
                </label>
                
                <div className="security-note">
                  <Shield size={14} />
                  <span>Your session is encrypted</span>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loginState.isLoading}
              >
                {loginState.isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Secure Sign In
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Registration Section */}
            <div className="registration-prompt">
              <div className="prompt-content">
                <Bell size={20} />
                <div className="prompt-text">
                  <strong>New to MediCare+?</strong>
                  <p>Register now to access comprehensive healthcare services</p>
                </div>
              </div>
              <Link to="/register" className="register-button">
                <UserPlus size={18} />
                <span>Create Account</span>
              </Link>
            </div>

            <div className="login-link">
              <p className="login-link-text">
                Need help?{' '}
                <a 
                  href="https://t.me/SMD192112" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="login-link-action"
                >
                  Contact Support
                </a>
              </p>
              <div className="footer-links">
                <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                <span className="separator">•</span>
                <Link to="/terms" className="footer-link">Terms of Service</Link>
              </div>
              <div className="copyright">
                © {new Date().getFullYear()} MediCare+. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;