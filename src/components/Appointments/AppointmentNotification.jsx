import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import notificationsApi from '../../api/notificationsApi';

const AppointmentNotification = ({ appointment, type = 'created' }) => {
  const [notificationSent, setNotificationSent] = useState(false);
  
  useEffect(() => {
    if (appointment && type === 'created' && !notificationSent) {
      sendNotificationToDoctor();
      setNotificationSent(true);
    }
  }, [appointment, type, notificationSent]);

  const sendNotificationToDoctor = async () => {
    try {
      console.log('📤 Sending notification to doctor for appointment:', appointment);
      
      // Ensure we have the required data
      if (!appointment?.doctor?.id) {
        console.error('Cannot send notification: Doctor ID missing');
        return;
      }

      const notificationData = {
        recipient: appointment.doctor.id,
        recipient_type: 'doctor',
        title: 'New Appointment Request',
        message: `New appointment request from ${appointment.patient_name || 'Patient'} on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time || 'scheduled time'}`,
        notification_type: 'appointment_request',
        related_object_type: 'appointment',
        related_object_id: appointment.id,
        priority: appointment.priority === 'urgent' ? 'high' : 'normal',
        data: {
          appointment_id: appointment.id,
          patient_name: appointment.patient_name,
          appointment_date: appointment.appointment_date,
          appointment_time: appointment.appointment_time,
          reason: appointment.reason || 'General consultation'
        }
      };

      console.log('📋 Notification payload:', notificationData);
      
      const response = await notificationsApi.createNotification(notificationData);
      
      console.log('✅ Notification sent successfully:', response.data);
      
      // Show success toast
      toast.success('Doctor has been notified about your appointment request!', {
        duration: 4000,
        position: 'top-right'
      });
      
    } catch (error) {
      console.error('❌ Error sending notification to doctor:', error);
      console.error('Error details:', error.response?.data);
      
      // Show error toast (optional)
      toast.error('Failed to send notification to doctor. The appointment was still booked.', {
        duration: 4000,
        position: 'top-right'
      });
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default AppointmentNotification;