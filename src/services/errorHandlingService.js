/**
 * Error Handling Service
 * Provides consistent error handling across the application
 */

import React from 'react';
import notificationService from './notificationService';

class ErrorHandlingService {
  constructor() {
    this.errorHandlers = new Map();
    this.globalErrorHandler = null;
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, 'unhandledrejection');
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('JavaScript error:', event.error);
      this.handleError(event.error, 'javascript');
    });
  }

  // Register error handler for specific error types
  registerErrorHandler(errorType, handler) {
    if (!this.errorHandlers.has(errorType)) {
      this.errorHandlers.set(errorType, []);
    }
    this.errorHandlers.get(errorType).push(handler);
  }

  // Set global error handler
  setGlobalErrorHandler(handler) {
    this.globalErrorHandler = handler;
  }

  // Main error handling method
  handleError(error, context = 'unknown', options = {}) {
    const errorInfo = this.parseError(error, context);
    
    // Log error
    console.error(`[${context}] Error:`, errorInfo);

    // Call specific error handlers
    if (this.errorHandlers.has(errorInfo.type)) {
      this.errorHandlers.get(errorInfo.type).forEach(handler => {
        try {
          handler(errorInfo, options);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      });
    }

    // Call global error handler
    if (this.globalErrorHandler) {
      try {
        this.globalErrorHandler(errorInfo, options);
      } catch (handlerError) {
        console.error('Error in global error handler:', handlerError);
      }
    }

    // Show user notification if not disabled
    if (!options.silent) {
      this.showErrorNotification(errorInfo, options);
    }

    return errorInfo;
  }

  // Parse error into standardized format
  parseError(error, context) {
    let errorInfo = {
      type: 'unknown',
      code: null,
      message: 'An unexpected error occurred',
      details: null,
      context,
      timestamp: new Date().toISOString(),
      stack: null
    };

    if (error?.response) {
      // HTTP/API errors
      const response = error.response;
      errorInfo = {
        ...errorInfo,
        type: 'api',
        code: response.status,
        message: this.getApiErrorMessage(response),
        details: response.data,
        url: response.config?.url,
        method: response.config?.method?.toUpperCase()
      };
    } else if (error?.request) {
      // Network errors
      errorInfo = {
        ...errorInfo,
        type: 'network',
        message: 'Network error - please check your connection',
        details: error.request
      };
    } else if (error instanceof Error) {
      // JavaScript errors
      errorInfo = {
        ...errorInfo,
        type: 'javascript',
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    } else if (typeof error === 'string') {
      // String errors
      errorInfo = {
        ...errorInfo,
        type: 'string',
        message: error
      };
    }

    return errorInfo;
  }

  // Extract meaningful message from API error response
  getApiErrorMessage(response) {
    const data = response.data;
    
    // Common API error message patterns
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    
    // Validation errors
    if (data?.non_field_errors) {
      return Array.isArray(data.non_field_errors) 
        ? data.non_field_errors[0] 
        : data.non_field_errors;
    }
    
    // Field-specific errors
    if (typeof data === 'object' && data !== null) {
      const firstError = Object.values(data)[0];
      if (Array.isArray(firstError)) {
        return firstError[0];
      } else if (typeof firstError === 'string') {
        return firstError;
      }
    }

    // HTTP status-based messages
    const statusMessages = {
      400: 'Invalid request data',
      401: 'Authentication required - please log in',
      403: 'Access denied - insufficient permissions',
      404: 'Resource not found',
      409: 'Conflict - resource already exists or is in use',
      422: 'Validation error - please check your input',
      429: 'Too many requests - please try again later',
      500: 'Server error - please try again later',
      502: 'Service temporarily unavailable',
      503: 'Service maintenance in progress',
      504: 'Request timeout - please try again'
    };

    return statusMessages[response.status] || `HTTP ${response.status} error`;
  }

  // Show error notification to user
  showErrorNotification(errorInfo, options = {}) {
    const {
      showToast = true,
      toastDuration = 5000,
      customMessage = null
    } = options;

    const message = customMessage || this.getUserFriendlyMessage(errorInfo);

    if (showToast) {
      notificationService.showError(message, {
        autoClose: toastDuration,
        toastId: `error-${errorInfo.type}-${Date.now()}`
      });
    }
  }

  // Convert technical error to user-friendly message
  getUserFriendlyMessage(errorInfo) {
    const userFriendlyMessages = {
      network: 'Connection problem. Please check your internet connection.',
      api: errorInfo.message,
      javascript: 'Something went wrong. Please refresh the page.',
      validation: 'Please check your input and try again.',
      authentication: 'Please log in to continue.',
      authorization: 'You don\'t have permission to perform this action.',
      notFound: 'The requested item was not found.',
      conflict: 'This action conflicts with existing data.',
      serverError: 'Server error. Please try again later.',
      unknown: 'An unexpected error occurred. Please try again.'
    };

    // Map specific error codes to types
    if (errorInfo.type === 'api') {
      switch (errorInfo.code) {
        case 401:
          return userFriendlyMessages.authentication;
        case 403:
          return userFriendlyMessages.authorization;
        case 404:
          return userFriendlyMessages.notFound;
        case 409:
          return userFriendlyMessages.conflict;
        case 422:
          return userFriendlyMessages.validation;
        case 500:
        case 502:
        case 503:
        case 504:
          return userFriendlyMessages.serverError;
        default:
          return errorInfo.message;
      }
    }

    return userFriendlyMessages[errorInfo.type] || userFriendlyMessages.unknown;
  }

  // Appointment-specific error handling
  handleAppointmentError(error, operation, appointmentData = null) {
    const context = `appointment-${operation}`;
    const errorInfo = this.handleError(error, context, { silent: true });

    // Specific handling for appointment operations
    const appointmentErrorMessages = {
      'create': 'Failed to create appointment. Please try again.',
      'update': 'Failed to update appointment. Please try again.',
      'cancel': 'Failed to cancel appointment. Please try again.',
      'confirm': 'Failed to confirm appointment. Please try again.',
      'reschedule': 'Failed to reschedule appointment. Please try again.',
      'delete': 'Failed to delete appointment. Please try again.',
      'fetch': 'Failed to load appointments. Please refresh the page.'
    };

    let message = appointmentErrorMessages[operation] || 'Appointment operation failed.';

    // Add specific context for certain errors
    if (errorInfo.code === 409) {
      message = 'This appointment slot is no longer available. Please choose a different time.';
    } else if (errorInfo.code === 422 && operation === 'create') {
      message = 'Please check your appointment details and try again.';
    }

    notificationService.showError(message);

    return {
      ...errorInfo,
      operation,
      appointmentData,
      userMessage: message
    };
  }

  // Retry mechanism for failed operations
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms`);
      }
    }
    
    throw lastError;
  }

  // Validation helpers
  validateAppointmentData(appointmentData) {
    const errors = [];

    if (!appointmentData.patient_id) {
      errors.push('Patient is required');
    }

    if (!appointmentData.doctor_id) {
      errors.push('Doctor is required');
    }

    if (!appointmentData.appointment_date) {
      errors.push('Appointment date and time are required');
    }

    // Validate date is valid and not in the past
    if (appointmentData.appointment_date) {
      try {
        const appointmentDate = new Date(appointmentData.appointment_date);
        
        // Check if the date is valid
        if (isNaN(appointmentDate.getTime())) {
          errors.push('Invalid appointment date format');
        } else {
          // Check if appointment is in the past
          const now = new Date();
          if (appointmentDate < now) {
            errors.push('Appointment time cannot be in the past');
          }
        }
      } catch (error) {
        errors.push('Invalid appointment date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create error boundary component
  createErrorBoundary() {
    return class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        this.handleError(error, 'react-error-boundary', {
          componentStack: errorInfo.componentStack
        });
      }

      render() {
        if (this.state.hasError) {
          return this.props.fallback || (
            <div className="error-boundary">
              <h2>Something went wrong</h2>
              <p>Please refresh the page or contact support if the problem persists.</p>
              <button onClick={() => window.location.reload()}>
                Refresh Page
              </button>
            </div>
          );
        }

        return this.props.children;
      }
    };
  }
}

// Create singleton instance
const errorHandlingService = new ErrorHandlingService();

export default errorHandlingService;