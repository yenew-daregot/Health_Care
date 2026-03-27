
// import axios from 'axios';

// // Create axios instance with base URL
// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     // Get token from localStorage
//     let token = localStorage.getItem('access_token');
    
//     // Also check sessionStorage as fallback
//     if (!token) {
//       token = sessionStorage.getItem('access_token');
//     }
    
//     console.log('🚀 Request interceptor - Token:', token ? 'Present' : 'Missing');
//     console.log('🚀 Request URL:', config.url);
    
//     if (token) {
//       // Ensure token starts with 'Bearer '
//       const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
//       config.headers.Authorization = authToken;
//       console.log('✅ Authorization header set:', config.headers.Authorization);
//     } else {
//       console.warn('⚠️ No authentication token found');
//       // You might want to redirect to login here
//       // window.location.href = '/login';
//     }
    
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ Response received:', {
//       status: response.status,
//       url: response.config.url
//     });
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
    
//     console.error('❌ Response error:', {
//       status: error.response?.status,
//       url: originalRequest?.url,
//       message: error.message
//     });
    
//     // Handle 401 errors (token expired)
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log('🔄 Attempting token refresh...');
//       originalRequest._retry = true;
      
//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         if (refreshToken) {
//           const response = await axios.post(
//             `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'}/auth/token/refresh/`,
//             { refresh: refreshToken }
//           );
          
//           const newAccessToken = response.data.access;
//           localStorage.setItem('access_token', newAccessToken);
//           console.log('✅ Token refreshed successfully');
          
//           // Retry original request with new token
//           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error('❌ Token refresh failed:', refreshError);
//         // Clear tokens and redirect to login
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }
    
//     // Handle 403 errors (forbidden)
//     if (error.response?.status === 403) {
//       console.error('❌ Access forbidden - insufficient permissions');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;