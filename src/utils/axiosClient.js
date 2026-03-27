
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';

// const axiosClient = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
// });

// // Request interceptor
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor
// axiosClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If error is 401 and we haven't tried refreshing yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       try {
//         const refreshToken = localStorage.getItem('refresh_token');
//         if (refreshToken) {
//           const response = await axios.post(
//             `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api'}/auth/token/refresh/`,
//             { refresh: refreshToken }
//           );
          
//           const { access, refresh } = response.data;
//           localStorage.setItem('access_token', access);
//           localStorage.setItem('refresh_token', refresh);
          
//           // Update the Authorization header
//           originalRequest.headers.Authorization = `Bearer ${access}`;
          
//           // Retry the original request
//           return axiosClient(originalRequest);
//         }
//       } catch (refreshError) {
//         // Refresh failed, logout user
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default axiosClient;