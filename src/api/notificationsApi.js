import axiosClient from './axiosClient';

export const notificationsApi = {
  // Notifications
  getNotifications: (params) => axiosClient.get('notifications/', { params }),
  getNotification: (id) => axiosClient.get(`notifications/${id}/`),
  markNotificationRead: (id) => axiosClient.post(`notifications/${id}/mark-read/`),
  markAllNotificationsRead: () => axiosClient.post('notifications/mark-all-read/'),
  getUnreadCount: () => axiosClient.get('notifications/unread-count/'),
  getRecentNotifications: () => axiosClient.get('notifications/recent/'),
  
  // Preferences
  getPreferences: () => axiosClient.get('notifications/preferences/'),
  updatePreferences: (data) => axiosClient.post('notifications/preferences/update/', data),
  
  // Templates
  getTemplates: () => axiosClient.get('notifications/templates/'),
  getTemplate: (id) => axiosClient.get(`notifications/templates/${id}/`),
  
  // Bulk Notifications
  getBulkNotifications: () => axiosClient.get('notifications/bulk/'),
  createBulkNotification: (data) => axiosClient.post('notifications/bulk/', data),
  getBulkNotification: (id) => axiosClient.get(`notifications/bulk/${id}/`),
  sendBulkNotification: (id) => axiosClient.post(`notifications/bulk/${id}/send/`),
  
  // Reminders
  getReminders: () => axiosClient.get('notifications/reminders/'),
  createReminder: (data) => axiosClient.post('notifications/reminders/', data),
  getReminder: (id) => axiosClient.get(`notifications/reminders/${id}/`),
  updateReminder: (id, data) => axiosClient.put(`notifications/reminders/${id}/`, data),
  toggleReminder: (id) => axiosClient.post(`notifications/reminders/${id}/toggle/`),
  
  // Analytics
  getDailyAnalytics: () => axiosClient.get('notifications/analytics/daily/'),
  getSummary: () => axiosClient.get('notifications/analytics/summary/'),
  
  // Test
  sendTestNotification: (data) => axiosClient.post('notifications/test/send/', data),
  
  // Mobile
  registerMobileDevice: (data) => axiosClient.post('notifications/mobile/register-device/', data),
  unregisterMobileDevice: () => axiosClient.post('notifications/mobile/unregister-device/'),
};

export default notificationsApi;