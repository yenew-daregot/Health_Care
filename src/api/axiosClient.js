import axios from 'axios';

// Determine base URL -
const getBaseURL = () => {
  // Option 1: Using environment variable
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Option 2: Default to your backend structure
  return 'http://localhost:8000/api/';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, 
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from various possible storage locations
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') ||
                  sessionStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if using session authentication
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true') {
      console.log(`📤 API Request:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL + config.url,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true') {
      console.log(`✅ API Response:`, {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      responseData: error.response?.data,
      fullUrl: error.config?.baseURL + error.config?.url
    });
    
    // Handle 401 Unauthorized - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Attempt to refresh token
          const response = await axios.post(
            `${getBaseURL()}auth/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear all auth data
        clearAuthData();
        redirectToLogin();
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('⚠️ Access forbidden - insufficient permissions');
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.warn('⚠️ Resource not found:', error.config.url);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('🔥 Server error occurred');
      // Optionally show a server error message to user
    }
    
    // If it's a network error (no response)
    if (!error.response) {
      console.error('🌐 Network Error - Check your connection');
      // Optionally show a network error message
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('access_token');
};

const redirectToLogin = () => {
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// Export axios instance and helper methods
export { clearAuthData, redirectToLogin };
export default axiosClient;