import axiosClient from './axiosClient';

const userApi = {
  // Get all users with filters (admin only)
  getUsers: (params) => axiosClient.get('auth/admin/users/', { params }),
  
  // Create new user (admin only)
  createUser: (data) => axiosClient.post('/auth/admin/users/', data),
  
  // Get single user details (admin only)
  getUser: (id) => axiosClient.get(`/auth/admin/users/${id}/`),
  
  // Update user (admin only)
  updateUser: (id, data) => axiosClient.put(`/auth/admin/users/${id}/`, data),
  
  // Partial update user (admin only)
  updateUserPartial: (id, data) => axiosClient.patch(`/auth/admin/users/${id}/`, data),
  
  // Delete user (admin only)
  deleteUser: (id) => axiosClient.delete(`auth/admin/users/${id}/`),
  
  // Update user status (is_active)
  updateUserStatus: (id, data) => axiosClient.patch(`auth/admin/users/${id}/update-status/`, data),
  
  // Bulk delete users
  bulkDeleteUsers: (ids) => axiosClient.post('auth/admin/users/bulk-delete/', { ids }),
  
  // Export users to CSV
  exportUsers: (params) => axiosClient.get('auth/admin/users/export/', {
    params,
    responseType: 'blob'
  }),
  //User registration (public)
  register: (data) => axiosClient.post('api/auth/register/', data),
  
  //User login (JWT)
  login: (data) => axiosClient.post('api/auth/token/', data),
  
  //Refresh JWT token
  refreshToken: (data) => axiosClient.post('api/auth/token/refresh/', data),
  
  //Get current user profile
  getCurrentUser: () => axiosClient.get('api/auth/user/'),
  
  //Update current user profile
  updateProfile: (data) => axiosClient.put('api/auth/user/update/', data),
  
  //Change password
  changePassword: (data) => axiosClient.post('api/auth/user/change-password/', data),
  
  //Logout
  logout: () => axiosClient.post('api/auth/logout/'),
};

export default userApi;