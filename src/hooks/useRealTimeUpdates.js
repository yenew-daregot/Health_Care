/**
 * Real-time Updates Hook
 * Manages WebSocket connections and real-time data synchronization
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import websocketService from '../services/websocketService';
import notificationService from '../services/notificationService';

export const useRealTimeUpdates = (options = {}) => {
  const { user, token } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const listenersRef = useRef(new Map());
  
  const {
    autoConnect = true,
    subscribeToUserAppointments = true,
    showConnectionNotifications = false,
    onAppointmentUpdate = null,
    onConnectionChange = null
  } = options;

  // Connection management
  const connect = useCallback(() => {
    if (token && user) {
      websocketService.connect(token);
      
      if (subscribeToUserAppointments) {
        // Subscribe to user-specific appointment updates
        websocketService.subscribeToUserAppointments(user.id, user.role);
      }
    }
  }, [token, user, subscribeToUserAppointments]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  // Event handlers
  const handleConnected = useCallback(() => {
    setConnectionStatus('connected');
    if (showConnectionNotifications) {
      notificationService.showSuccess('Connected to real-time updates');
    }
    if (onConnectionChange) {
      onConnectionChange('connected');
    }
  }, [showConnectionNotifications, onConnectionChange]);

  const handleDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    if (showConnectionNotifications) {
      notificationService.showWarning('Disconnected from real-time updates');
    }
    if (onConnectionChange) {
      onConnectionChange('disconnected');
    }
  }, [showConnectionNotifications, onConnectionChange]);

  const handleError = useCallback((data) => {
    setConnectionStatus('error');
    console.error('WebSocket error:', data.error);
    if (onConnectionChange) {
      onConnectionChange('error', data.error);
    }
  }, [onConnectionChange]);

  const handleAppointmentUpdated = useCallback((data) => {
    setLastUpdate({
      type: 'updated',
      appointment: data.appointment,
      timestamp: new Date()
    });
    
    notificationService.notifyAppointmentUpdate(data.appointment, 'updated');
    
    if (onAppointmentUpdate) {
      onAppointmentUpdate('updated', data.appointment);
    }
  }, [onAppointmentUpdate]);

  const handleAppointmentCreated = useCallback((data) => {
    setLastUpdate({
      type: 'created',
      appointment: data.appointment,
      timestamp: new Date()
    });
    
    notificationService.notifyAppointmentUpdate(data.appointment, 'created');
    
    if (onAppointmentUpdate) {
      onAppointmentUpdate('created', data.appointment);
    }
  }, [onAppointmentUpdate]);

  const handleAppointmentCancelled = useCallback((data) => {
    setLastUpdate({
      type: 'cancelled',
      appointment: data.appointment,
      timestamp: new Date()
    });
    
    notificationService.notifyAppointmentUpdate(data.appointment, 'cancelled');
    
    if (onAppointmentUpdate) {
      onAppointmentUpdate('cancelled', data.appointment);
    }
  }, [onAppointmentUpdate]);

  const handleAppointmentConfirmed = useCallback((data) => {
    setLastUpdate({
      type: 'confirmed',
      appointment: data.appointment,
      timestamp: new Date()
    });
    
    notificationService.notifyAppointmentUpdate(data.appointment, 'confirmed');
    
    if (onAppointmentUpdate) {
      onAppointmentUpdate('confirmed', data.appointment);
    }
  }, [onAppointmentUpdate]);

  const handleNotification = useCallback((data) => {
    // Handle general notifications
    notificationService.showToast(data.message, data.type || 'info');
  }, []);

  // Setup event listeners
  useEffect(() => {
    const listeners = [
      ['connected', handleConnected],
      ['disconnected', handleDisconnected],
      ['error', handleError],
      ['appointmentUpdated', handleAppointmentUpdated],
      ['appointmentCreated', handleAppointmentCreated],
      ['appointmentCancelled', handleAppointmentCancelled],
      ['appointmentConfirmed', handleAppointmentConfirmed],
      ['notification', handleNotification]
    ];

    listeners.forEach(([event, handler]) => {
      websocketService.on(event, handler);
      listenersRef.current.set(event, handler);
    });

    return () => {
      listeners.forEach(([event, handler]) => {
        websocketService.off(event, handler);
      });
      listenersRef.current.clear();
    };
  }, [
    handleConnected,
    handleDisconnected,
    handleError,
    handleAppointmentUpdated,
    handleAppointmentCreated,
    handleAppointmentCancelled,
    handleAppointmentConfirmed,
    handleNotification
  ]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && token && user) {
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, token, user]);

  // Subscription management
  const subscribeToAppointment = useCallback((appointmentId) => {
    websocketService.subscribeToAppointmentUpdates(appointmentId);
  }, []);

  const unsubscribeFromAppointment = useCallback((appointmentId) => {
    websocketService.unsubscribeFromAppointmentUpdates(appointmentId);
  }, []);

  // Send custom messages
  const sendMessage = useCallback((message) => {
    websocketService.send(message);
  }, []);

  return {
    connectionStatus,
    lastUpdate,
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
    subscribeToAppointment,
    unsubscribeFromAppointment,
    sendMessage
  };
};

// Hook for appointment-specific real-time updates
export const useAppointmentRealTimeUpdates = (appointmentId, options = {}) => {
  const [appointmentData, setAppointmentData] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([]);
  
  const handleAppointmentUpdate = useCallback((type, appointment) => {
    if (appointment.id === appointmentId) {
      setAppointmentData(appointment);
      setUpdateHistory(prev => [
        {
          type,
          appointment,
          timestamp: new Date()
        },
        ...prev.slice(0, 9) // Keep last 10 updates
      ]);
    }
  }, [appointmentId]);

  const realTimeUpdates = useRealTimeUpdates({
    ...options,
    onAppointmentUpdate: handleAppointmentUpdate
  });

  useEffect(() => {
    if (appointmentId && realTimeUpdates.isConnected) {
      realTimeUpdates.subscribeToAppointment(appointmentId);
      
      return () => {
        realTimeUpdates.unsubscribeFromAppointment(appointmentId);
      };
    }
  }, [appointmentId, realTimeUpdates]);

  return {
    ...realTimeUpdates,
    appointmentData,
    updateHistory
  };
};

export default useRealTimeUpdates;