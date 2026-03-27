import axiosClient from './axiosClient';

const chatApi = {
  // Chat Root
  getChatInfo: () => axiosClient.get('chat/'),
  
  // Chat Rooms
  getChatRooms: () => axiosClient.get('chat/rooms/'),
  createChatRoom: (data) => axiosClient.post('chat/rooms/', data),
  getChatRoom: (id) => axiosClient.get(`chat/rooms/${id}/`),
  updateChatRoom: (id, data) => axiosClient.put(`chat/rooms/${id}/`, data),
  deleteChatRoom: (id) => axiosClient.delete(`chat/rooms/${id}/`),
  
  getPatientChatRooms: (patientId) => axiosClient.get(`chat/rooms/patient/${patientId}/`),
  getDoctorChatRooms: (doctorId) => axiosClient.get(`chat/rooms/doctor/${doctorId}/`),
  findOrCreateChatRoom: (data) => axiosClient.post('chat/rooms/find-or-create/', data),
  
  // Messages
  getMessages: (params) => axiosClient.get('chat/messages/', { params }),
  sendMessage: (data) => axiosClient.post('chat/messages/', data),
  getMessage: (id) => axiosClient.get(`chat/messages/${id}/`),
  getRoomMessages: (roomId, params) => axiosClient.get(`chat/rooms/${roomId}/messages/`, { params }),
  markMessageRead: (id) => axiosClient.post(`chat/messages/${id}/mark-read/`),
  markAllMessagesRead: (roomId) => axiosClient.post(`chat/rooms/${roomId}/mark-all-read/`),
  
  // File Upload
  uploadFile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'file' && data.file) {
        formData.append('file', data.file);
      } else if (data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axiosClient.post('chat/upload-file/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Participants
  getRoomParticipants: (roomId) => axiosClient.get(`chat/rooms/${roomId}/participants/`),
  getParticipant: (id) => axiosClient.get(`chat/participants/${id}/`),
  updateParticipant: (id, data) => axiosClient.put(`chat/participants/${id}/`, data),
  deleteParticipant: (id) => axiosClient.delete(`chat/participants/${id}/`),
  
  // Notifications
  getChatNotifications: () => axiosClient.get('chat/notifications/'),
  markNotificationRead: (id) => axiosClient.post(`chat/notifications/${id}/mark-read/`),
  markAllNotificationsRead: () => axiosClient.post('chat/notifications/mark-all-read/'),
  
  // WebSocket
  getWebSocketToken: () => axiosClient.post('chat/websocket-token/'),
  
  // Test endpoint for debugging
  testChatSystem: () => axiosClient.get('chat/test/'),
  
  // Additional helper methods
  getAvailableDoctors: () => axiosClient.get('doctors/'),
};

export default chatApi;