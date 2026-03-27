import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Badge,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import chatApi from '../../api/chatApi';

const ChatList = ({ userType, userId, onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatRooms();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchChatRooms, 30000);
    return () => clearInterval(interval);
  }, [userType, userId]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching chat rooms for:', { userType, userId });
      
      let response;
      if (userType === 'doctor') {
        response = await chatApi.getDoctorChatRooms(userId);
      } else {
        response = await chatApi.getPatientChatRooms(userId);
      }
      
      console.log('Chat rooms response:', response);
      
      if (response && Array.isArray(response.data)) {
        // Sort by last message time (newest first)
        const sortedChats = response.data.sort((a, b) => 
          new Date(b.last_message?.created_at || b.created_at) - 
          new Date(a.last_message?.created_at || a.created_at)
        );
        setChats(sortedChats);
        console.log('Chat rooms loaded successfully:', sortedChats.length);
      } else if (response && response.data) {
        // Handle case where data is not an array
        console.log('Unexpected response format:', response.data);
        setChats([]);
      } else {
        console.log('No chat data received');
        setChats([]);
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to load chats. ';
      
      if (err.response?.status === 404) {
        errorMessage = 'No chat rooms found. Start a conversation to see it here.';
        setChats([]); // Clear chats but don't show error
        setError(null);
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
        setError(errorMessage);
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
        setError(errorMessage);
      } else {
        errorMessage += 'Please try again.';
        setError(errorMessage);
        
        // For development, use mock data as fallback
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data as fallback');
          setChats(getMockChats(userType));
          setError(null); // Clear error when using mock data
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (chat) => {
    if (userType === 'doctor') {
      return chat.patient?.user?.full_name || 
             `${chat.patient?.user?.first_name || ''} ${chat.patient?.user?.last_name || ''}`.trim() ||
             'Patient';
    } else {
      return chat.doctor?.user?.full_name || 
             `Dr. ${chat.doctor?.user?.first_name || ''} ${chat.doctor?.user?.last_name || ''}`.trim() ||
             'Doctor';
    }
  };

  const getAvatarText = (chat) => {
    if (userType === 'doctor') {
      const name = chat.patient?.user?.first_name || 'P';
      return name.charAt(0).toUpperCase();
    } else {
      return 'D';
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return format(date, 'MMM dd');
      }
    } catch (err) {
      return '';
    }
  };

  const handleCreateNewChat = async () => {
    try {
      // For patient: Find doctor to chat with
      if (userType === 'patient') {
        // You can implement a doctor selection dialog here
        // For now, create a chat with the first available doctor
        const doctorsResponse = await chatApi.getAvailableDoctors();
        if (doctorsResponse.data && doctorsResponse.data.length > 0) {
          const doctor = doctorsResponse.data[0];
          const response = await chatApi.findOrCreateChatRoom({
            patient_id: userId,
            doctor_id: doctor.id
          });
          if (response.data) {
            fetchChatRooms();
            if (response.data.id) {
              onSelectChat(response.data.id);
            }
          }
        }
      } else {
        // For doctor: Show patient selection
        // Implement patient search/selection
        alert('Select a patient to start chatting');
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      alert('Failed to create chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchChatRooms} variant="outlined" fullWidth>
          Retry
        </Button>
      </Box>
    );
  }

  if (chats.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No chats yet
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {userType === 'patient' 
            ? 'Start a conversation with your doctor' 
            : 'Your patients will appear here'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleCreateNewChat}
          startIcon={<PersonIcon />}
        >
          {userType === 'patient' ? 'Message Doctor' : 'New Chat'}
        </Button>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {chats.map((chat) => {
        const unreadCount = chat.unread_count || 0;
        const lastMessage = chat.last_message;
        const isSelected = selectedChatId === chat.id;
        
        return (
          <ListItem
            key={chat.id}
            alignItems="flex-start"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: isSelected ? 'action.selected' : 'inherit',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              cursor: 'pointer',
            }}
            onClick={() => onSelectChat(chat.id)}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={unreadCount}
                color="error"
                invisible={unreadCount === 0}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {getAvatarText(chat)}
                </Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" component="span" fontWeight="medium">
                    {getDisplayName(chat)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatLastMessageTime(lastMessage?.created_at || chat.updated_at)}
                  </Typography>
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color={unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                    fontWeight={unreadCount > 0 ? 'medium' : 'normal'}
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lastMessage?.content || 'No messages yet'}
                  </Typography>
                  {chat.patient?.condition && userType === 'doctor' && (
                    <Chip 
                      size="small" 
                      label={chat.patient.condition}
                      sx={{ mt: 0.5, fontSize: '0.7rem' }}
                    />
                  )}
                </React.Fragment>
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
};

// Mock data for development
const getMockChats = (userType) => {
  if (userType === 'doctor') {
    return [
      {
        id: 1,
        patient: {
          user: {
            first_name: 'John',
            last_name: 'Doe',
            full_name: 'John Doe'
          },
          condition: 'Hypertension'
        },
        last_message: {
          content: 'When should I take my medication?',
          created_at: new Date(Date.now() - 300000).toISOString()
        },
        unread_count: 2,
        updated_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 2,
        patient: {
          user: {
            first_name: 'Jane',
            last_name: 'Smith',
            full_name: 'Jane Smith'
          },
          condition: 'Diabetes'
        },
        last_message: {
          content: 'Thank you for the prescription',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        unread_count: 0,
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  } else {
    return [
      {
        id: 1,
        doctor: {
          user: {
            first_name: 'Michael',
            last_name: 'Johnson',
            full_name: 'Dr. Michael Johnson'
          },
          specialization: 'Cardiology'
        },
        last_message: {
          content: 'Please send me your latest test results',
          created_at: new Date(Date.now() - 600000).toISOString()
        },
        unread_count: 1,
        updated_at: new Date(Date.now() - 600000).toISOString()
      }
    ];
  }
};

export default ChatList;