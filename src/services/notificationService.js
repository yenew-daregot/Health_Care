/**
 * Enhanced Notification Service
 * Handles in-app notifications, browser notifications, SMS, and push notifications
 * Integrates with backend notification service
 */

import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = new Map();
    this.permission = 'default';
    this.fcmToken = null;
    this.serviceWorkerRegistration = null;
    this.init();
  }

  async init() {
    // Request browser notification permission
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }

    // Initialize service worker for push notifications
    await this.initServiceWorker();
    
    // Initialize FCM token
    await this.initFCMToken();
    
    // Load notification preferences
    await this.loadNotificationPreferences();
  }

  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async initFCMToken() {
    // This would integrate with Firebase Cloud Messaging
    // For now, we'll simulate token generation
    try {
      // In a real implementation, you'd use Firebase SDK here
      // const messaging = getMessaging();
      // this.fcmToken = await getToken(messaging, { vapidKey: 'your-vapid-key' });
      
      // Simulate FCM token for demo
      this.fcmToken = 'demo_fcm_token_' + Math.random().toString(36).substring(2, 11);
      
      // Send token to backend
      await this.updateFCMToken(this.fcmToken);
    } catch (error) {
      console.error('Failed to initialize FCM token:', error);
    }
  }

  async updateFCMToken(token) {
    try {
      await axiosClient.post('/notifications/update-fcm-token/', {
        fcm_token: token
      });
    } catch (error) {
      console.error('Failed to update FCM token:', error);
    }
  }

  async loadNotificationPreferences() {
    try {
      const response = await axiosClient.get('/notifications/preferences/');
      this.preferences = response.data;
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      // Set default preferences
      this.preferences = {
        sms: true,
        push: true,
        email: true,
        in_app: true,
        appointment_reminders: true,
        health_alerts: true,
        emergency_notifications: true
      };
    }
  }

  // Enhanced notification sending with backend integration
  async sendNotification(title, message, type = 'info', channels = ['in_app'], data = {}) {
    try {
      const response = await axiosClient.post('/notifications/send/', {
        title,
        message,
        notification_type: type,
        channels,
        data
      });
      
      // Show local notification immediately for better UX
      this.showToast(message, type);
      
      return response.data;
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Fallback to local notification
      this.showToast(message, type);
      return { success: false, error: error.message };
    }
  }

  // In-app notifications using react-toastify
  showToast(message, type = 'info', options = {}) {
    const defaultOptions = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch (type) {
      case 'success':
        return toast.success(message, defaultOptions);
      case 'error':
        return toast.error(message, defaultOptions);
      case 'warning':
        return toast.warning(message, defaultOptions);
      case 'urgent':
      case 'emergency':
        return toast.error(message, {
          ...defaultOptions,
          autoClose: false,
          closeOnClick: false,
          className: 'emergency-notification'
        });
      case 'info':
      default:
        return toast.info(message, defaultOptions);
    }
  }

  // Browser notifications with enhanced features
  showBrowserNotification(title, options = {}) {
    if (this.permission === 'granted' && 'Notification' in window) {
      const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'healthcare-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        ...options
      };

      // Add urgency-based options
      if (options.urgent || options.emergency) {
        defaultOptions.requireInteraction = true;
        defaultOptions.vibrate = [300, 100, 300, 100, 300];
        defaultOptions.tag = 'urgent-notification';
      }

      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) {
          options.onClick();
        }
      };

      return notification;
    }
  }

  // Healthcare-specific notification methods
  async notifyAppointmentUpdate(appointment, updateType) {
    const messages = {
      created: `New appointment scheduled with ${appointment.doctor_name || 'doctor'}`,
      updated: `Appointment with ${appointment.doctor_name || 'doctor'} has been updated`,
      confirmed: `Appointment with ${appointment.doctor_name || 'doctor'} confirmed`,
      cancelled: `Appointment with ${appointment.doctor_name || 'doctor'} cancelled`,
      rescheduled: `Appointment with ${appointment.doctor_name || 'doctor'} rescheduled`,
      completed: `Appointment with ${appointment.doctor_name || 'doctor'} completed`,
      reminder: `Reminder: Appointment with ${appointment.doctor_name || 'doctor'} in 1 hour`
    };

    const message = messages[updateType] || 'Appointment updated';
    const notificationType = this.getNotificationType(updateType);
    
    // Determine channels based on update type and user preferences
    let channels = ['in_app'];
    
    if (this.preferences.appointment_reminders && updateType === 'reminder') {
      channels = ['sms', 'push', 'in_app'];
    } else if (['confirmed', 'cancelled', 'rescheduled'].includes(updateType)) {
      channels = ['push', 'in_app'];
      if (this.preferences.sms) channels.push('sms');
    }

    // Send notification through backend
    await this.sendNotification(
      'Healthcare Appointment',
      message,
      notificationType,
      channels,
      {
        appointment_id: appointment.id,
        type: updateType,
        appointment
      }
    );

    // Show browser notification for important updates
    if (['confirmed', 'cancelled', 'rescheduled', 'reminder'].includes(updateType)) {
      this.showBrowserNotification('Healthcare Appointment', {
        body: message,
        icon: '/appointment-icon.png',
        urgent: updateType === 'reminder',
        onClick: () => {
          window.location.href = '/appointments';
        }
      });
    }

    // Store notification for history
    this.addNotification({
      id: Date.now(),
      type: updateType,
      message,
      appointment,
      timestamp: new Date(),
      read: false
    });
  }

  async notifyHealthAlert(vitalReading) {
    const message = `Alert: Abnormal ${vitalReading.vital_type} reading detected - ${vitalReading.value} ${vitalReading.unit}`;
    
    // Health alerts are always urgent
    const channels = this.preferences.health_alerts ? 
      ['sms', 'push', 'email', 'in_app'] : 
      ['in_app'];

    await this.sendNotification(
      'Health Alert',
      message,
      'urgent',
      channels,
      {
        vital_reading_id: vitalReading.id,
        type: 'health_alert',
        vital_reading: vitalReading
      }
    );

    // Show urgent browser notification
    this.showBrowserNotification('🚨 Health Alert', {
      body: message,
      icon: '/health-alert-icon.png',
      urgent: true,
      requireInteraction: true,
      onClick: () => {
        window.location.href = '/health-monitoring';
      }
    });

    // Add to notification history
    this.addNotification({
      id: Date.now(),
      type: 'health_alert',
      message,
      vitalReading,
      timestamp: new Date(),
      read: false,
      urgent: true
    });
  }

  async notifyEmergencyRequest(emergencyRequest) {
    const message = `EMERGENCY: Emergency assistance requested. Location: ${emergencyRequest.location}`;
    
    // Emergency notifications go through all channels
    const channels = ['sms', 'push', 'email', 'in_app'];

    await this.sendNotification(
      '🚨 EMERGENCY REQUEST',
      message,
      'emergency',
      channels,
      {
        emergency_request_id: emergencyRequest.id,
        type: 'emergency_request',
        emergency_request: emergencyRequest
      }
    );

    // Show emergency browser notification
    this.showBrowserNotification('🚨 EMERGENCY REQUEST', {
      body: message,
      icon: '/emergency-icon.png',
      emergency: true,
      requireInteraction: true,
      vibrate: [500, 100, 500, 100, 500],
      onClick: () => {
        window.location.href = '/emergency-requests';
      }
    });

    // Add to notification history
    this.addNotification({
      id: Date.now(),
      type: 'emergency_request',
      message,
      emergencyRequest,
      timestamp: new Date(),
      read: false,
      urgent: true,
      emergency: true
    });
  }

  async notifyPrescriptionReady(prescription) {
    const message = `Your prescription for ${prescription.medication_name} is ready for pickup`;
    
    const channels = ['push', 'in_app'];
    if (this.preferences.sms) channels.push('sms');

    await this.sendNotification(
      'Prescription Ready',
      message,
      'info',
      channels,
      {
        prescription_id: prescription.id,
        type: 'prescription_ready',
        prescription
      }
    );

    this.showBrowserNotification('Prescription Ready', {
      body: message,
      icon: '/prescription-icon.png',
      onClick: () => {
        window.location.href = '/prescriptions';
      }
    });
  }

  async notifyLabResults(labResult) {
    const message = `Your lab results for ${labResult.test_name} are now available`;
    
    const channels = ['push', 'email', 'in_app'];

    await this.sendNotification(
      'Lab Results Available',
      message,
      'info',
      channels,
      {
        lab_result_id: labResult.id,
        type: 'lab_results_available',
        lab_result: labResult
      }
    );

    this.showBrowserNotification('Lab Results Available', {
      body: message,
      icon: '/lab-results-icon.png',
      onClick: () => {
        window.location.href = '/lab-results';
      }
    });
  }

  // Notification preferences management
  async updateNotificationPreferences(preferences) {
    try {
      const response = await axiosClient.put('/notifications/preferences/', preferences);
      this.preferences = { ...this.preferences, ...preferences };
      return response.data;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  async getNotificationPreferences() {
    return this.preferences;
  }

  // Backend notification history
  async getNotificationHistory(page = 1, limit = 20) {
    try {
      const response = await axiosClient.get('/notifications/history/', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return { notifications: [], total: 0 };
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      await axiosClient.patch(`/notifications/${notificationId}/read/`);
      
      // Update local notification if exists
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        this.emit('notificationRead', notification);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllNotificationsAsRead() {
    try {
      await axiosClient.post('/notifications/mark-all-read/');
      
      // Update local notifications
      this.notifications.forEach(n => n.read = true);
      this.emit('allNotificationsRead');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Service status
  async getServiceStatus() {
    try {
      const response = await axiosClient.get('/notifications/service-status/');
      return response.data;
    } catch (error) {
      console.error('Failed to get service status:', error);
      return {
        sms: false,
        push: false,
        email: true,
        in_app: true
      };
    }
  }

  getNotificationType(updateType) {
    const typeMap = {
      created: 'info',
      updated: 'info',
      confirmed: 'success',
      cancelled: 'warning',
      rescheduled: 'warning',
      completed: 'success',
      reminder: 'warning',
      health_alert: 'urgent',
      emergency_request: 'emergency'
    };
    return typeMap[updateType] || 'info';
  }

  // Notification history management (local)
  addNotification(notification) {
    this.notifications.unshift(notification);
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.emit('notificationAdded', notification);
  }

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notificationRead', notification);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.emit('allNotificationsRead');
  }

  clearNotifications() {
    this.notifications = [];
    this.emit('notificationsCleared');
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in notification event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  showSuccess(message, options = {}) {
    return this.showToast(message, 'success', options);
  }

  showError(message, options = {}) {
    return this.showToast(message, 'error', options);
  }

  showWarning(message, options = {}) {
    return this.showToast(message, 'warning', options);
  }

  showInfo(message, options = {}) {
    return this.showToast(message, 'info', options);
  }

  showUrgent(message, options = {}) {
    return this.showToast(message, 'urgent', options);
  }

  showEmergency(message, options = {}) {
    return this.showToast(message, 'emergency', options);
  }

  // Appointment reminder scheduling
  scheduleAppointmentReminder(appointment) {
    const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const reminderTime = new Date(appointmentTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const now = new Date();

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        this.notifyAppointmentUpdate(appointment, 'reminder');
      }, timeUntilReminder);
    }
  }

  // Test notification (for development/testing)
  async testNotification(type = 'info') {
    const testMessages = {
      info: 'This is a test info notification',
      success: 'This is a test success notification',
      warning: 'This is a test warning notification',
      error: 'This is a test error notification',
      urgent: 'This is a test urgent notification',
      emergency: 'This is a test emergency notification'
    };

    await this.sendNotification(
      'Test Notification',
      testMessages[type],
      type,
      ['push', 'in_app'],
      { test: true }
    );
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;