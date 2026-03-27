/**
 * Optimistic Updates Hook
 * Provides optimistic UI updates for better user experience
 */

import { useState, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';

export const useOptimisticUpdates = (initialData = [], options = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingOperations = useRef(new Map());

  const {
    onSuccess = () => {},
    onError = () => {},
    showNotifications = true,
    rollbackDelay = 5000
  } = options;

  // Generate unique operation ID
  const generateOperationId = () => `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((operationId, updateFn, rollbackFn) => {
    setData(prevData => {
      const newData = updateFn(prevData);
      pendingOperations.current.set(operationId, {
        rollback: rollbackFn,
        originalData: prevData,
        timestamp: Date.now()
      });
      return newData;
    });
  }, []);

  // Confirm optimistic update
  const confirmOptimisticUpdate = useCallback((operationId, serverData = null) => {
    const operation = pendingOperations.current.get(operationId);
    if (operation) {
      pendingOperations.current.delete(operationId);
      
      if (serverData) {
        // Update with server data if provided
        setData(serverData);
      }
    }
  }, []);

  // Rollback optimistic update
  const rollbackOptimisticUpdate = useCallback((operationId, errorMessage = null) => {
    const operation = pendingOperations.current.get(operationId);
    if (operation) {
      setData(operation.originalData);
      pendingOperations.current.delete(operationId);
      
      if (errorMessage && showNotifications) {
        notificationService.showError(`Operation failed: ${errorMessage}`);
      }
    }
  }, [showNotifications]);

  // Generic optimistic operation
  const performOptimisticOperation = useCallback(async (
    optimisticUpdateFn,
    apiCall,
    options = {}
  ) => {
    const operationId = generateOperationId();
    const {
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed',
      skipNotifications = false
    } = options;

    try {
      setLoading(true);
      setError(null);

      // Apply optimistic update
      let rollbackFn;
      applyOptimisticUpdate(
        operationId,
        (prevData) => {
          const result = optimisticUpdateFn(prevData);
          rollbackFn = () => prevData;
          return result.newData || result;
        },
        rollbackFn
      );

      // Perform API call
      const result = await apiCall();

      // Confirm optimistic update
      confirmOptimisticUpdate(operationId, result.data || result);

      if (showNotifications && !skipNotifications) {
        notificationService.showSuccess(successMessage);
      }

      onSuccess(result);
      return result;

    } catch (error) {
      console.error('Optimistic operation failed:', error);
      
      // Rollback optimistic update
      rollbackOptimisticUpdate(operationId, error.message);
      
      const finalErrorMessage = error.response?.data?.detail || 
                               error.response?.data?.message || 
                               error.message || 
                               errorMessage;
      
      setError(finalErrorMessage);
      
      if (showNotifications && !skipNotifications) {
        notificationService.showError(finalErrorMessage);
      }

      onError(error);
      throw error;

    } finally {
      setLoading(false);
    }
  }, [
    applyOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    onSuccess,
    onError,
    showNotifications
  ]);

  // Appointment-specific optimistic operations
  const optimisticAppointmentOperations = {
    // Update appointment status
    updateStatus: useCallback(async (appointmentId, newStatus, apiCall) => {
      return performOptimisticOperation(
        (prevData) => prevData.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus, updated_at: new Date().toISOString() }
            : appointment
        ),
        apiCall,
        {
          successMessage: `Appointment ${newStatus} successfully`,
          errorMessage: `Failed to update appointment status`
        }
      );
    }, [performOptimisticOperation]),

    // Cancel appointment
    cancelAppointment: useCallback(async (appointmentId, cancellationReason, apiCall) => {
      return performOptimisticOperation(
        (prevData) => prevData.map(appointment => 
          appointment.id === appointmentId 
            ? { 
                ...appointment, 
                status: 'cancelled',
                cancellation_reason: cancellationReason,
                updated_at: new Date().toISOString()
              }
            : appointment
        ),
        apiCall,
        {
          successMessage: 'Appointment cancelled successfully',
          errorMessage: 'Failed to cancel appointment'
        }
      );
    }, [performOptimisticOperation]),

    // Create appointment
    createAppointment: useCallback(async (appointmentData, apiCall) => {
      const tempId = `temp_${Date.now()}`;
      
      return performOptimisticOperation(
        (prevData) => [
          {
            ...appointmentData,
            id: tempId,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isOptimistic: true
          },
          ...prevData
        ],
        apiCall,
        {
          successMessage: 'Appointment created successfully',
          errorMessage: 'Failed to create appointment'
        }
      );
    }, [performOptimisticOperation]),

    // Update appointment
    updateAppointment: useCallback(async (appointmentId, updateData, apiCall) => {
      return performOptimisticOperation(
        (prevData) => prevData.map(appointment => 
          appointment.id === appointmentId 
            ? { 
                ...appointment, 
                ...updateData,
                updated_at: new Date().toISOString()
              }
            : appointment
        ),
        apiCall,
        {
          successMessage: 'Appointment updated successfully',
          errorMessage: 'Failed to update appointment'
        }
      );
    }, [performOptimisticOperation]),

    // Delete appointment
    deleteAppointment: useCallback(async (appointmentId, apiCall) => {
      return performOptimisticOperation(
        (prevData) => prevData.filter(appointment => appointment.id !== appointmentId),
        apiCall,
        {
          successMessage: 'Appointment deleted successfully',
          errorMessage: 'Failed to delete appointment'
        }
      );
    }, [performOptimisticOperation])
  };

  // Cleanup pending operations on unmount
  const cleanup = useCallback(() => {
    pendingOperations.current.clear();
  }, []);

  return {
    data,
    setData,
    loading,
    error,
    setError,
    performOptimisticOperation,
    optimisticAppointmentOperations,
    cleanup,
    pendingOperationsCount: pendingOperations.current.size
  };
};

export default useOptimisticUpdates;