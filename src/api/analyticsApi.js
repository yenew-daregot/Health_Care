import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const analyticsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
analyticsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
analyticsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Analytics API Service
export const analyticsApiService = {
  // Dashboard Statistics
  getDashboardStats: (timeframe = 'month') => 
    analyticsApi.get(`/admin/dashboard/stats/?timeframe=${timeframe}`),
  
  getRecentActivities: (limit = 20) => 
    analyticsApi.get(`/admin/recent-activities/?limit=${limit}`),
  
  getPendingActions: () => 
    analyticsApi.get('/admin/pending-actions/'),
  
  getSystemAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/analytics/?timeframe=${timeframe}`),

  // System Health and Performance
  getSystemStatus: () => 
    analyticsApi.get('/admin/system/status/'),
  
  getSystemHealth: () => 
    analyticsApi.get('/admin/system/health/'),
  
  getPerformanceMetrics: (timeframe = '24h') => 
    analyticsApi.get(`/admin/system/performance/?timeframe=${timeframe}`),
  
  getResourceUsage: () => 
    analyticsApi.get('/admin/system/resources/'),

  // User Analytics
  getUserStats: (timeframe = 'month') => 
    analyticsApi.get(`/admin/users/stats/?timeframe=${timeframe}`),
  
  getUserGrowth: (timeframe = 'month') => 
    analyticsApi.get(`/admin/users/growth/?timeframe=${timeframe}`),
  
  getUserEngagement: (timeframe = 'month') => 
    analyticsApi.get(`/admin/users/engagement/?timeframe=${timeframe}`),
  
  getUserDistribution: () => 
    analyticsApi.get('/admin/users/distribution/'),
  
  getActiveUsers: (period = '24h') => 
    analyticsApi.get(`/admin/users/active/?period=${period}`),

  // Appointment Analytics
  getAppointmentStats: (timeframe = 'month') => 
    analyticsApi.get(`/admin/appointments/stats/?timeframe=${timeframe}`),
  
  getAppointmentTrends: (timeframe = 'month') => 
    analyticsApi.get(`/admin/appointments/trends/?timeframe=${timeframe}`),
  
  getAppointmentsByStatus: (timeframe = 'month') => 
    analyticsApi.get(`/admin/appointments/by-status/?timeframe=${timeframe}`),
  
  getDoctorPerformance: (timeframe = 'month') => 
    analyticsApi.get(`/admin/doctors/performance/?timeframe=${timeframe}`),
  
  getAppointmentPatterns: (timeframe = 'month') => 
    analyticsApi.get(`/admin/appointments/patterns/?timeframe=${timeframe}`),

  // Financial Analytics
  getFinancialStats: (timeframe = 'month') => 
    analyticsApi.get(`/admin/financial/stats/?timeframe=${timeframe}`),
  
  getRevenueAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/financial/revenue/?timeframe=${timeframe}`),
  
  getBillingAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/billing/analytics/?timeframe=${timeframe}`),
  
  getPaymentTrends: (timeframe = 'month') => 
    analyticsApi.get(`/admin/payments/trends/?timeframe=${timeframe}`),

  // Medical Analytics
  getPrescriptionAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/prescriptions/analytics/?timeframe=${timeframe}`),
  
  getMedicationUsage: (timeframe = 'month') => 
    analyticsApi.get(`/admin/medications/usage/?timeframe=${timeframe}`),
  
  getLabAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/labs/analytics/?timeframe=${timeframe}`),
  
  getHealthMetrics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/health/metrics/?timeframe=${timeframe}`),

  // Emergency Analytics
  getEmergencyStats: (timeframe = 'month') => 
    analyticsApi.get(`/admin/emergency/stats/?timeframe=${timeframe}`),
  
  getEmergencyTrends: (timeframe = 'month') => 
    analyticsApi.get(`/admin/emergency/trends/?timeframe=${timeframe}`),
  
  getEmergencyResponseTimes: (timeframe = 'month') => 
    analyticsApi.get(`/admin/emergency/response-times/?timeframe=${timeframe}`),

  // Communication Analytics
  getChatAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/chat/analytics/?timeframe=${timeframe}`),
  
  getNotificationAnalytics: (timeframe = 'month') => 
    analyticsApi.get(`/admin/notifications/analytics/?timeframe=${timeframe}`),
  
  getMessageVolume: (timeframe = 'month') => 
    analyticsApi.get(`/admin/messages/volume/?timeframe=${timeframe}`),

  // Report Generation
  generateReport: (reportType, params = {}) => {
    const queryString = new URLSearchParams({
      report_type: reportType,
      format: params.format || 'json',
      start_date: params.startDate,
      end_date: params.endDate,
      ...params
    }).toString();
    return analyticsApi.post(`/admin/reports/generate/?${queryString}`, params);
  },
  
  getReportHistory: () => 
    analyticsApi.get('/admin/reports/history/'),
  
  downloadReport: (reportId, format = 'pdf') => 
    analyticsApi.get(`/admin/reports/${reportId}/download/?format=${format}`, {
      responseType: 'blob'
    }),
  
  scheduleReport: (reportConfig) => 
    analyticsApi.post('/admin/reports/schedule/', reportConfig),

  // Custom Analytics
  getCustomMetrics: (metricConfig) => 
    analyticsApi.post('/admin/analytics/custom/', metricConfig),
  
  saveCustomDashboard: (dashboardConfig) => 
    analyticsApi.post('/admin/dashboards/custom/', dashboardConfig),
  
  getCustomDashboards: () => 
    analyticsApi.get('/admin/dashboards/custom/'),
  
  updateCustomDashboard: (dashboardId, config) => 
    analyticsApi.put(`/admin/dashboards/custom/${dashboardId}/`, config),
  
  deleteCustomDashboard: (dashboardId) => 
    analyticsApi.delete(`/admin/dashboards/custom/${dashboardId}/`),

  // Real-time Analytics
  getRealtimeStats: () => 
    analyticsApi.get('/admin/analytics/realtime/'),
  
  getRealtimeUsers: () => 
    analyticsApi.get('/admin/analytics/realtime/users/'),
  
  getRealtimeActivity: () => 
    analyticsApi.get('/admin/analytics/realtime/activity/'),

  // Comparative Analytics
  getComparativeStats: (periods) => 
    analyticsApi.post('/admin/analytics/compare/', { periods }),
  
  getBenchmarkData: (metrics) => 
    analyticsApi.post('/admin/analytics/benchmark/', { metrics }),
  
  getTrendAnalysis: (metric, timeframe = 'month') => 
    analyticsApi.get(`/admin/analytics/trends/${metric}/?timeframe=${timeframe}`),

  // Predictive Analytics
  getForecast: (metric, periods = 12) => 
    analyticsApi.get(`/admin/analytics/forecast/${metric}/?periods=${periods}`),
  
  getAnomalyDetection: (metric, timeframe = 'month') => 
    analyticsApi.get(`/admin/analytics/anomalies/${metric}/?timeframe=${timeframe}`),
  
  getPredictiveInsights: (timeframe = 'month') => 
    analyticsApi.get(`/admin/analytics/insights/?timeframe=${timeframe}`),

  // Data Export
  exportAnalyticsData: (dataType, format = 'csv', params = {}) => {
    const queryString = new URLSearchParams({
      format,
      ...params
    }).toString();
    return analyticsApi.get(`/admin/analytics/export/${dataType}/?${queryString}`, {
      responseType: 'blob'
    });
  },
  
  bulkExport: (exportConfig) => 
    analyticsApi.post('/admin/analytics/bulk-export/', exportConfig, {
      responseType: 'blob'
    }),

  // Alert Management
  getAnalyticsAlerts: () => 
    analyticsApi.get('/admin/analytics/alerts/'),
  
  createAlert: (alertConfig) => 
    analyticsApi.post('/admin/analytics/alerts/', alertConfig),
  
  updateAlert: (alertId, alertConfig) => 
    analyticsApi.put(`/admin/analytics/alerts/${alertId}/`, alertConfig),
  
  deleteAlert: (alertId) => 
    analyticsApi.delete(`/admin/analytics/alerts/${alertId}/`),
  
  getAlertHistory: (alertId) => 
    analyticsApi.get(`/admin/analytics/alerts/${alertId}/history/`),

  // Data Quality and Validation
  getDataQualityReport: () => 
    analyticsApi.get('/admin/analytics/data-quality/'),
  
  validateAnalyticsData: (dataType, timeframe = 'month') => 
    analyticsApi.get(`/admin/analytics/validate/${dataType}/?timeframe=${timeframe}`),
  
  getDataCompleteness: (timeframe = 'month') => 
    analyticsApi.get(`/admin/analytics/completeness/?timeframe=${timeframe}`),

  // Configuration and Settings
  getAnalyticsConfig: () => 
    analyticsApi.get('/admin/analytics/config/'),
  
  updateAnalyticsConfig: (config) => 
    analyticsApi.put('/admin/analytics/config/', config),
  
  getMetricDefinitions: () => 
    analyticsApi.get('/admin/analytics/metrics/definitions/'),
  
  updateMetricDefinition: (metricId, definition) => 
    analyticsApi.put(`/admin/analytics/metrics/${metricId}/`, definition),

  // Audit and Logging
  getAnalyticsAuditLog: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return analyticsApi.get(`/admin/analytics/audit/${queryString ? `?${queryString}` : ''}`);
  },
  
  getSystemLogs: (logType = 'all', params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return analyticsApi.get(`/admin/system/logs/${logType}/${queryString ? `?${queryString}` : ''}`);
  },
  
  getErrorLogs: (timeframe = '24h') => 
    analyticsApi.get(`/admin/system/errors/?timeframe=${timeframe}`),
};

export default analyticsApiService;