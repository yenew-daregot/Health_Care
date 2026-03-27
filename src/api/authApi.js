// import axiosClient from './axiosClient';

// /**
//  * Authentication API
//  * Handles user authentication, registration, and profile management
//  * Base URL: /api/auth/
//  */
// const authApi = {
//   // ===== JWT TOKEN AUTHENTICATION =====
//   /**
//    * Login with JWT tokens
//    * @param {Object} credentials - {username, password}
//    * @returns {Promise} {access, refresh, user}
//    */
//   login: (credentials) => axiosClient.post('auth/token/', credentials),

//   /**
//    * Refresh access token
//    * @param {string} refreshToken - Refresh token
//    * @returns {Promise} {access}
//    */
//   refreshToken: (refreshToken) => axiosClient.post('auth/token/refresh/', { refresh: refreshToken }),

//   /**
//    * Verify token validity
//    * @param {string} token - Access token to verify
//    * @returns {Promise} Token validity status
//    */
//   verifyToken: (token) => axiosClient.post('auth/token/verify/', { token }),

//   // ===== SESSION AUTHENTICATION =====
//   /**
//    * Login with session (alternative to JWT)
//    * @param {Object} credentials - {username, password}
//    * @returns {Promise} User data and session info
//    */
//   loginSession: (credentials) => axiosClient.post('auth/login/', credentials),

//   /**
//    * Logout and blacklist refresh token
//    * @param {string} refreshToken - Refresh token to blacklist
//    * @returns {Promise} Logout confirmation
//    */
//   logout: (refreshToken) => axiosClient.post('auth/logout/', { refresh: refreshToken }),

//   // ===== USER REGISTRATION =====
//   /**
//    * Register new user
//    * @param {Object} userData - {username, email, password, confirmPassword, first_name, last_name, role, phone_number}
//    * @returns {Promise} {user, tokens}
//    */
//   register: (userData) => axiosClient.post('auth/register/', userData),

//   // ===== USER PROFILE =====
//   /**
//    * Get current user profile
//    * @returns {Promise} User profile data
//    */
//   getProfile: () => axiosClient.get('auth/profile/'),

//   /**
//    * Update user profile
//    * @param {Object} profileData - Profile fields to update
//    * @returns {Promise} Updated profile data
//    */
//   updateProfile: (profileData) => axiosClient.put('auth/profile/', profileData),

//   /**
//    * Partial update user profile
//    * @param {Object} profileData - Profile fields to update
//    * @returns {Promise} Updated profile data
//    */
//   patchProfile: (profileData) => axiosClient.patch('auth/profile/', profileData),

//   // ===== USER MANAGEMENT =====
//   /**
//    * Get user details
//    * @returns {Promise} User details
//    */
//   getUserDetail: () => axiosClient.get('auth/user/'),

//   /**
//    * Update user information
//    * @param {Object} userData - User fields to update
//    * @returns {Promise} Updated user data
//    */
//   updateUser: (userData) => axiosClient.put('auth/user/update/', userData),

//   /**
//    * Get current authenticated user
//    * @returns {Promise} Current user data
//    */
//   getCurrentUser: () => axiosClient.get('auth/current-user/'),

//   /**
//    * Change user password
//    * @param {Object} passwordData - {old_password, new_password, confirm_password}
//    * @returns {Promise} Password change confirmation
//    */
//   changePassword: (passwordData) => axiosClient.post('auth/user/change-password/', passwordData),

//   // ===== ADMIN USER MANAGEMENT =====
//   admin: {
//     /**
//      * List all users (Admin only)
//      * @param {Object} params - Query parameters {role, is_active, search, page}
//      * @returns {Promise} Paginated list of users
//      */
//     getUsers: (params = {}) => axiosClient.get('auth/admin/users/', { params }),

//     /**
//      * Create new user (Admin only)
//      * @param {Object} userData - User data
//      * @returns {Promise} Created user data
//      */
//     createUser: (userData) => axiosClient.post('auth/admin/users/', userData),

//     /**
//      * Get user details (Admin only)
//      * @param {number} userId - User ID
//      * @returns {Promise} User details
//      */
//     getUser: (userId) => axiosClient.get(`auth/admin/users/${userId}/`),

//     /**
//      * Update user (Admin only)
//      * @param {number} userId - User ID
//      * @param {Object} userData - User data to update
//      * @returns {Promise} Updated user data
//      */
//     updateUser: (userId, userData) => axiosClient.put(`auth/admin/users/${userId}/`, userData),

//     /**
//      * Partial update user (Admin only)
//      * @param {number} userId - User ID
//      * @param {Object} userData - User data to update
//      * @returns {Promise} Updated user data
//      */
//     patchUser: (userId, userData) => axiosClient.patch(`auth/admin/users/${userId}/`, userData),

//     /**
//      * Delete user (Admin only)
//      * @param {number} userId - User ID
//      * @returns {Promise} Deletion confirmation
//      */
//     deleteUser: (userId) => axiosClient.delete(`auth/admin/users/${userId}/`),

//     /**
//      * Update user status/role (Admin only)
//      * @param {number} userId - User ID
//      * @param {Object} statusData - {is_active, role}
//      * @returns {Promise} Updated user data
//      */
//     updateUserStatus: (userId, statusData) => axiosClient.patch(`auth/admin/users/${userId}/update-status/`, statusData),

//     /**
//      * Bulk delete users (Admin only)
//      * @param {Array} userIds - Array of user IDs
//      * @returns {Promise} Deletion confirmation
//      */
//     bulkDeleteUsers: (userIds) => axiosClient.post('auth/admin/users/bulk-delete/', { ids: userIds }),

//     /**
//      * Export users as CSV (Admin only)
//      * @param {Object} filters - {role, status, search}
//      * @returns {Promise} CSV file blob
//      */
//     exportUsers: (filters = {}) => axiosClient.get('auth/admin/users/export/', { 
//       params: filters,
//       responseType: 'blob'
//     })
//   },

//   // ===== TEST ENDPOINTS (Development only) =====
//   /**
//    * Test authentication endpoint
//    * @returns {Promise} Auth test results
//    */
//   testAuth: () => axiosClient.get('auth/test/'),

//   /**
//    * Create test users (Development only)
//    * @returns {Promise} Created test users
//    */
//   createTestUsers: () => axiosClient.post('auth/create-test-users/')
// };

// // ===== TOKEN HELPERS =====
// export const tokenHelpers = {
//   /**
//    * Store JWT tokens in localStorage
//    * @param {Object} tokens - {access, refresh}
//    */
//   storeTokens: (tokens) => {
//     if (tokens.access) localStorage.setItem('access_token', tokens.access);
//     if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh);
//   },

//   /**
//    * Get stored tokens from localStorage
//    * @returns {Object} {access, refresh}
//    */
//   getTokens: () => ({
//     access: localStorage.getItem('access_token'),
//     refresh: localStorage.getItem('refresh_token')
//   }),

//   /**
//    * Clear all stored tokens
//    */
//   clearTokens: () => {
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     localStorage.removeItem('user');
//   },

//   /**
//    * Check if user is authenticated
//    * @returns {boolean} Authentication status
//    */
//   isAuthenticated: () => !!localStorage.getItem('access_token'),

//   /**
//    * Get stored user data
//    * @returns {Object|null} User data or null
//    */
//   getStoredUser: () => {
//     const userStr = localStorage.getItem('user');
//     return userStr ? JSON.parse(userStr) : null;
//   },

//   /**
//    * Store user data in localStorage
//    * @param {Object} user - User data
//    */
//   storeUser: (user) => {
//     localStorage.setItem('user', JSON.stringify(user));
//   }
// };

// export default authApi;

import axiosClient from './axiosClient';

/**
 * Authentication API
 * Handles user authentication, registration, and profile management
 * Base URL: /api/auth/
 */
const authApi = {
  // ===== JWT TOKEN AUTHENTICATION =====
  /**
   * Login with JWT tokens
   * @param {Object} credentials - {username, password}
   * @returns {Promise} {access, refresh, user}
   */
  login: (credentials) => axiosClient.post('auth/token/', credentials),

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} {access}
   */
  refreshToken: (refreshToken) => axiosClient.post('auth/token/refresh/', { refresh: refreshToken }),

  /**
   * Verify token validity
   * @param {string} token - Access token to verify
   * @returns {Promise} Token validity status
   */
  verifyToken: (token) => axiosClient.post('auth/token/verify/', { token }),

  //SESSION AUTHENTICATION 
  /**
   * Login with session (alternative to JWT)
   * @param {Object} credentials - {username, password}
   * @returns {Promise} User data and session info
   */
  loginSession: (credentials) => axiosClient.post('auth/login/', credentials),

  /**
   * Logout and blacklist refresh token
   * @param {string} refreshToken - Refresh token to blacklist
   * @returns {Promise} Logout confirmation
   */
  logout: (refreshToken) => axiosClient.post('auth/logout/', { refresh: refreshToken }),

  //USER REGISTRATION
  /**
   * Register new user
   * @param {Object} userData - {username, email, password, confirmPassword, first_name, last_name, role, phone_number}
   * @returns {Promise} {access, refresh, user}
   */
  register: (userData) => axiosClient.post('auth/register/', userData),

  //PASSWORD RESET 
  /**
   * Request password reset code
   * @param {Object} data - {email}
   * @returns {Promise} Reset code
   */
  forgotPassword: (data) => axiosClient.post('auth/password/forgot/', data),

  /**
   * Verify reset code
   * @param {Object} data - {email, code}
   * @returns {Promise} Verification status
   */
  verifyResetCode: (data) => axiosClient.post('auth/password/verify-code/', data),

  /**
   * Reset password with code
   * @param {Object} data - {email, code, new_password, confirm_password}
   * @returns {Promise} Reset confirmation
   */
  resetPassword: (data) => axiosClient.post('auth/password/reset/', data),

  //USER PROFILE 
  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: () => axiosClient.get('auth/profile/'),

  /**
   * Update user profile
   * @param {Object} profileData - Profile fields to update
   * @returns {Promise} Updated profile data
   */
  updateProfile: (profileData) => axiosClient.put('auth/profile/', profileData),

  /**
   * Partial update user profile
   * @param {Object} profileData - Profile fields to update
   * @returns {Promise} Updated profile data
   */
  patchProfile: (profileData) => axiosClient.patch('auth/profile/', profileData),

  //USER MANAGEMENT
  /**
   * Get user details
   * @returns {Promise} User details
   */
  getUserDetail: () => axiosClient.get('auth/user/'),

  /**
   * Update user information
   * @param {Object} userData - User fields to update
   * @returns {Promise} Updated user data
   */
  updateUser: (userData) => axiosClient.put('auth/user/update/', userData),

  /**
   * Get current authenticated user
   * @returns {Promise} Current user data
   */
  getCurrentUser: () => axiosClient.get('auth/current-user/'),

  /**
   * Change user password
   * @param {Object} passwordData - {old_password, new_password, confirm_password}
   * @returns {Promise} Password change confirmation
   */
  changePassword: (passwordData) => axiosClient.post('auth/user/change-password/', passwordData),

  //ADMIN USER MANAGEMENT 
  admin: {
    /**
     * List all users (Admin only)
     * @param {Object} params - Query parameters {role, is_active, search, page}
     * @returns {Promise} Paginated list of users
     */
    getUsers: (params = {}) => axiosClient.get('auth/admin/users/', { params }),

    /**
     * Create new user (Admin only)
     * @param {Object} userData - User data
     * @returns {Promise} Created user data
     */
    createUser: (userData) => axiosClient.post('auth/admin/users/', userData),

    /**
     * Get user details (Admin only)
     * @param {number} userId - User ID
     * @returns {Promise} User details
     */
    getUser: (userId) => axiosClient.get(`auth/admin/users/${userId}/`),

    /**
     * Update user (Admin only)
     * @param {number} userId - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} Updated user data
     */
    updateUser: (userId, userData) => axiosClient.put(`auth/admin/users/${userId}/`, userData),

    /**
     * Partial update user (Admin only)
     * @param {number} userId - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} Updated user data
     */
    patchUser: (userId, userData) => axiosClient.patch(`auth/admin/users/${userId}/`, userData),

    /**
     * Delete user (Admin only)
     * @param {number} userId - User ID
     * @returns {Promise} Deletion confirmation
     */
    deleteUser: (userId) => axiosClient.delete(`auth/admin/users/${userId}/`),

    /**
     * Update user status/role (Admin only)
     * @param {number} userId - User ID
     * @param {Object} statusData - {is_active, role}
     * @returns {Promise} Updated user data
     */
    updateUserStatus: (userId, statusData) => axiosClient.patch(`auth/admin/users/${userId}/update-status/`, statusData),

    /**
     * Bulk delete users (Admin only)
     * @param {Array} userIds - Array of user IDs
     * @returns {Promise} Deletion confirmation
     */
    bulkDeleteUsers: (userIds) => axiosClient.post('auth/admin/users/bulk-delete/', { ids: userIds }),

    /**
     * Export users as CSV (Admin only)
     * @param {Object} filters - {role, status, search}
     * @returns {Promise} CSV file blob
     */
    exportUsers: (filters = {}) => axiosClient.get('auth/admin/users/export/', { 
      params: filters,
      responseType: 'blob'
    })
  },

  //TEST ENDPOINTS (Development only)
  /**
   * Test authentication endpoint
   * @returns {Promise} Auth test results
   */
  testAuth: () => axiosClient.get('auth/test/'),

  /**
   * Create test users (Development only)
   * @returns {Promise} Created test users
   */
  createTestUsers: () => axiosClient.post('auth/create-test-users/')
};

//TOKEN HELPERS
export const tokenHelpers = {
  /**
   * Store JWT tokens in localStorage
   * @param {Object} tokens - {access, refresh}
   */
  storeTokens: (tokens) => {
    if (tokens.access) localStorage.setItem('access_token', tokens.access);
    if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh);
  },

  /**
   * Get stored tokens from localStorage
   * @returns {Object} {access, refresh}
   */
  getTokens: () => ({
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token')
  }),

  /**
   * Clear all stored tokens
   */
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => !!localStorage.getItem('access_token'),

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Store user data in localStorage
   * @param {Object} user - User data
   */
  storeUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export default authApi;