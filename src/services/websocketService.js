/**
 * WebSocket Service for Real-time Updates
 * Handles appointment updates, notifications, and real-time synchronization
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
  }

  connect(token) {
    try {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/appointments/?token=${token}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  onOpen() {
    console.log('✅ WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.emit('connected', { status: 'connected' });
  }

  onMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', data);
      
      switch (data.type) {
        case 'appointment_updated':
          this.emit('appointmentUpdated', data.payload);
          break;
        case 'appointment_created':
          this.emit('appointmentCreated', data.payload);
          break;
        case 'appointment_cancelled':
          this.emit('appointmentCancelled', data.payload);
          break;
        case 'appointment_confirmed':
          this.emit('appointmentConfirmed', data.payload);
          break;
        case 'notification':
          this.emit('notification', data.payload);
          break;
        case 'heartbeat':
          // Respond to heartbeat
          this.send({ type: 'heartbeat_response' });
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  onClose(event) {
    console.log('🔌 WebSocket disconnected:', event.code, event.reason);
    this.isConnected = false;
    this.stopHeartbeat();
    this.emit('disconnected', { code: event.code, reason: event.reason });
    
    if (event.code !== 1000) { // Not a normal closure
      this.scheduleReconnect();
    }
  }

  onError(error) {
    console.error('❌ WebSocket error:', error);
    this.emit('error', { error });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token);
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'heartbeat' });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
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
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Appointment-specific methods
  subscribeToAppointmentUpdates(appointmentId) {
    this.send({
      type: 'subscribe_appointment',
      appointment_id: appointmentId
    });
  }

  unsubscribeFromAppointmentUpdates(appointmentId) {
    this.send({
      type: 'unsubscribe_appointment',
      appointment_id: appointmentId
    });
  }

  subscribeToUserAppointments(userId, userRole) {
    this.send({
      type: 'subscribe_user_appointments',
      user_id: userId,
      user_role: userRole
    });
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;