import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ⭐ UPDATED: Helper to normalize user object
  const normalizeUser = useCallback((userData) => {
    console.log('🔍 [NORMALIZE USER] Raw input:', userData);
    
    if (!userData) {
      console.log('❌ [NORMALIZE USER] No user data provided');
      return null;
    }
    
    const rawUser = userData.user || userData;
    
    console.log('🔍 [NORMALIZE USER] Raw user object keys:', Object.keys(rawUser));
    
    // ⭐ EXTRACT ROLE BASED ON YOUR DJANGO MODEL
    let userRole = 'PATIENT'; // Default from Django model
    
    // Check in order of likelihood
    if (rawUser.role) {
      userRole = rawUser.role;
      console.log('✅ Found role in "role" field:', userRole);
    } else if (rawUser.user_type) {
      userRole = rawUser.user_type;
      console.log('✅ Found role in "user_type" field:', userRole);
    } else if (rawUser.user_role) {
      userRole = rawUser.user_role;
      console.log('✅ Found role in "user_role" field:', userRole);
    } else {
      console.warn('⚠️ No role field found in response. Checking alternative fields...');
      
      // Check for is_staff/is_superuser to infer ADMIN role
      if (rawUser.is_staff || rawUser.is_superuser) {
        console.log('⚠️ User has is_staff/is_superuser flags. Setting role to ADMIN.');
        userRole = 'ADMIN';
      } else {
        console.warn('⚠️ No role information found. Defaulting to PATIENT.');
      }
    }
    
    // ⭐ FORCE UPPERCASE to match Django choices exactly
    userRole = (userRole || 'PATIENT').toUpperCase().trim();
    
    // ⭐ VALIDATE against Django model choices (from your CustomUser model)
    const validRoles = ['PATIENT', 'DOCTOR', 'LABORATORIST', 'ADMIN'];
    if (!validRoles.includes(userRole)) {
      console.warn(`⚠️ Invalid role "${userRole}". Defaulting to PATIENT.`);
      
      // Try to map common variations
      const roleMapping = {
        'ADMINISTRATOR': 'ADMIN',
        'PHYSICIAN': 'DOCTOR',
        'NURSE': 'PATIENT', // Your model doesn't have NURSE
        'STAFF': 'PATIENT', // Your model doesn't have STAFF
      };
      
      if (roleMapping[userRole]) {
        userRole = roleMapping[userRole];
        console.log(`✅ Mapped "${userRole}" to valid role`);
      } else {
        userRole = 'PATIENT';
      }
    }
    
    console.log('🎯 [NORMALIZE USER] Final normalized role:', userRole);
    
    // Build normalized user object
    const normalizedUser = {
      id: rawUser.id || rawUser.user_id || '',
      username: rawUser.username || '',
      email: rawUser.email || '',
      first_name: rawUser.first_name || rawUser.firstName || rawUser.given_name || '',
      last_name: rawUser.last_name || rawUser.lastName || rawUser.family_name || '',
      role: userRole, // ⭐ THIS IS NOW UPPERCASE AND VALIDATED
      is_active: rawUser.is_active !== false,
      phone_number: rawUser.phone_number || '',
      date_of_birth: rawUser.date_of_birth || '',
      address: rawUser.address || '',
      is_staff: rawUser.is_staff || false,
      is_superuser: rawUser.is_superuser || false,
      // Keep original for debugging
      _raw: rawUser
    };
    
    console.log('✅ [NORMALIZE USER] Normalized user:', normalizedUser);
    return normalizedUser;
  }, []);

  // Helper to store user data
  const storeUserData = useCallback((userData, accessToken, refreshToken = null) => {
    const normalizedUser = normalizeUser(userData);
    
    const userWithToken = {
      ...normalizedUser,
      token: accessToken
    };
    
    localStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    
    // Store the FULL normalized user (including _raw for debugging)
    localStorage.setItem('user', JSON.stringify(userWithToken));
    setUser(userWithToken);
    
    console.log('✅ [STORE USER] User stored:', {
      username: userWithToken.username,
      role: userWithToken.role,
      token: accessToken ? '✅ Present' : '❌ Missing'
    });
    
    return userWithToken;
  }, [normalizeUser]);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 [AUTH INIT] Checking localStorage:', {
        token: token ? '✅ Present' : '❌ Missing',
        userData: userData ? '✅ Present' : '❌ Missing'
      });
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔍 [AUTH INIT] Parsed user from localStorage:', {
            hasRole: 'role' in parsedUser,
            roleValue: parsedUser?.role
          });
          
          const normalizedUser = normalizeUser(parsedUser);
          normalizedUser.token = token;
          setUser(normalizedUser);
          
          console.log('✅ [AUTH INIT] User restored:', {
            username: normalizedUser.username,
            role: normalizedUser.role
          });
        } catch (err) {
          console.error('❌ [AUTH INIT] Error parsing user data:', err);
          logout();
        }
      } else {
        console.log('ℹ️ [AUTH INIT] No saved session found');
      }
      
      setLoading(false);
    };

    initAuth();
  }, [normalizeUser]);

  // Redirect based on user role
  const redirectBasedOnRole = useCallback((userRole) => {
    console.log('📍 [REDIRECT] Determining redirect for role:', userRole);
    
    const roleMap = {
      'ADMIN': '/admin/dashboard',
      'DOCTOR': '/doctor/dashboard',
      'PATIENT': '/patient/dashboard',
      'LABORATORIST': '/laboratorist/dashboard'
    };
    
    const normalizedRole = (userRole || '').toUpperCase();
    const path = roleMap[normalizedRole] || '/dashboard';
    
    console.log('📍 [REDIRECT] Navigating to:', path);
    navigate(path, { replace: true });
  }, [navigate]);

  // ========== LOGIN FUNCTION WITH DEBUGGING ==========
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 [LOGIN] Attempting login with:', credentials.username);
      
      // Try JWT endpoint first
      const response = await authApi.login(credentials);
      const responseData = response.data;
      
      console.log('📦 [LOGIN] Full API Response:', {
        hasAccessToken: !!responseData.access,
        hasRefreshToken: !!responseData.refresh,
        hasUserData: !!responseData.user,
        responseData: responseData
      });
      
      // EXPECTED FORMAT from CustomTokenObtainPairView: {refresh, access, user}
      if (!responseData.access) {
        throw new Error('No access token received from server');
      }
      
      const accessToken = responseData.access;
      const refreshToken = responseData.refresh;
      
      // Get user data from response
      let userResponse = responseData.user;
      
      // If user data not included, fetch it separately
      if (!userResponse) {
        console.log('🔄 [LOGIN] User data not in response, fetching separately...');
        try {
          const userInfo = await authApi.getCurrentUser();
          userResponse = userInfo.data;
          console.log('✅ [LOGIN] Fetched user data:', userResponse);
        } catch (userError) {
          console.warn('⚠️ [LOGIN] Could not fetch user info:', userError.message);
          userResponse = {
            username: credentials.username,
            role: 'PATIENT'
          };
        }
      } else {
        console.log('✅ [LOGIN] User data from response:', userResponse);
      }
      
      // Store user data
      const userWithToken = storeUserData(userResponse, accessToken, refreshToken);
      
      console.log('🎯 [LOGIN] User after normalization:', {
        username: userWithToken.username,
        role: userWithToken.role,
        isValidRole: ['PATIENT', 'DOCTOR', 'LABORATORIST', 'ADMIN'].includes(userWithToken.role)
      });
      
      // Redirect based on role
      setTimeout(() => {
        redirectBasedOnRole(userWithToken.role);
      }, 100);
      
      return userWithToken;
      
    } catch (err) {
      console.error('❌ [LOGIN] Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      let errorMsg = 'Login failed. Please check credentials.';
      
      if (err.response?.status === 401) {
        errorMsg = 'Invalid username or password';
      } else if (err.response?.status === 403) {
        errorMsg = 'Access denied. Your account may not have permission.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message.includes('Network Error')) {
        errorMsg = 'Cannot connect to server. Please check if the server is running.';
      } else if (err.response?.status === 404) {
        errorMsg = 'Server endpoint not found. Please check API configuration.';
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTER FUNCTION ==========
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔵 [REGISTER] Starting registration...');
      
      const response = await authApi.register(userData);
      const responseData = response.data;
      
      console.log('✅ [REGISTER] Response data:', responseData);
      
      // EXPECTED FORMAT from RegisterView: {refresh, access, user}
      if (!responseData.access) {
        throw new Error('No access token received from server');
      }
      
      const accessToken = responseData.access;
      const refreshToken = responseData.refresh;
      const userResponse = responseData.user;
      
      // Store user data
      const userWithToken = storeUserData(userResponse, accessToken, refreshToken);
      
      // Redirect based on role
      setTimeout(() => {
        redirectBasedOnRole(userWithToken.role);
      }, 1000);
      
      return userWithToken;
      
    } catch (err) {
      console.error('❌ [REGISTER] Error:', err.response?.data || err.message);
      
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.errors) {
          const errorMessages = [];
          for (const field in errorData.errors) {
            errorMessages.push(`${field}: ${errorData.errors[field]}`);
          }
          errorMsg = errorMessages.join('; ');
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (errorData.message) {
          errorMsg = errorData.message;
        } else if (errorData.username) {
          errorMsg = Object.keys(errorData)
            .map(key => `${key}: ${errorData[key].join(', ')}`)
            .join('; ');
        }
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ========== PASSWORD RESET FUNCTIONS ==========
  const forgotPassword = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [FORGOT PASSWORD] Requesting reset code for:', data.email);
      
      const response = await authApi.forgotPassword(data);
      return response.data;
      
    } catch (err) {
      console.error('❌ [FORGOT PASSWORD] Error:', err.response?.data || err.message);
      
      let errorMsg = 'Failed to send reset code. Please try again.';
      
      if (err.response?.status === 404) {
        errorMsg = 'Email not found. Please check your email address.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [VERIFY CODE] Verifying reset code for:', data.email);
      
      const response = await authApi.verifyResetCode(data);
      return response.data;
      
    } catch (err) {
      console.error('❌ [VERIFY CODE] Error:', err.response?.data || err.message);
      
      let errorMsg = 'Invalid reset code. Please try again.';
      
      if (err.response?.status === 400) {
        errorMsg = 'Invalid or expired reset code.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [RESET PASSWORD] Resetting password for:', data.email);
      
      const response = await authApi.resetPassword(data);
      
      // Clear tokens after password reset
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      
      return response.data;
      
    } catch (err) {
      console.error('❌ [RESET PASSWORD] Error:', err.response?.data || err.message);
      
      let errorMsg = 'Failed to reset password. Please try again.';
      
      if (err.response?.status === 400) {
        if (err.response?.data?.new_password) {
          errorMsg = `Password error: ${err.response.data.new_password.join(', ')}`;
        } else if (err.response?.data?.non_field_errors) {
          errorMsg = err.response.data.non_field_errors.join(', ');
        }
      }
      
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ========== OTHER AUTH FUNCTIONS ==========
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (err) {
      console.log('Logout endpoint error:', err.message);
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    
    console.log('✅ [LOGOUT] User logged out');
    navigate('/login', { replace: true });
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authApi.refreshToken(storedRefreshToken);
      const newAccessToken = response.data.access;
      
      if (!newAccessToken) {
        throw new Error('No new access token received');
      }
      
      localStorage.setItem('access_token', newAccessToken);
      
      if (user) {
        const updatedUser = { ...user, token: newAccessToken };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      return newAccessToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      throw err;
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await authApi.verifyToken(token);
      return response.data;
    } catch (err) {
      console.error('Token verification failed:', err);
      throw err;
    }
  };

  const getProfile = async () => {
    try {
      const response = await authApi.getProfile();
      return response.data;
    } catch (err) {
      console.error('Failed to get profile:', err);
      throw err;
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authApi.updateUser(data);
      const updatedUser = response.data;
      
      if (user) {
        const newUser = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      }
      
      return updatedUser;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const changePassword = async (data) => {
    try {
      const response = await authApi.changePassword(data);
      return response.data;
    } catch (err) {
      console.error('Failed to change password:', err);
      throw err;
    }
  };

  // ========== HELPER FUNCTIONS ==========
  const isAuthenticated = !!user && !!localStorage.getItem('access_token');
  
  const hasRole = (role) => {
    if (!user?.role) return false;
    return user.role.toUpperCase() === role.toUpperCase();
  };
  
  const getUserRole = () => user?.role || '';
  
  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    isAuthenticated,
    hasRole,
    getUserRole,
    refreshToken,
    verifyToken,
    getProfile,
    updateProfile,
    changePassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};