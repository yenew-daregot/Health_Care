import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../../components/Chat/ChatList';
import ChatInterface from '../../components/Chat/ChatInterface';
import { Box, Alert, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import chatApi from '../../api/chatApi';
import doctorsApi from '../../api/doctorsApi'; 

const ChatWithPatient = () => {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatInfo, setSelectedChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDoctorInfo();
    }
  }, [user]);

  const fetchDoctorInfo = async () => {
    try {
      setLoading(true);
      // You can fetch additional doctor info if needed
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctor info:', err);
      setError('Failed to load doctor information');
      setLoading(false);
    }
  };

  const handleSelectChat = async (chatId) => {
    setSelectedChatId(chatId);
    // Fetch chat details if needed
    if (chatId) {
      try {
        const response = await chatApi.getChatRoom(chatId);
        if (response.data) {
          setSelectedChatInfo(response.data);
        }
      } catch (err) {
        console.error('Error fetching chat details:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={fetchDoctorInfo} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h5">
          Patient Messages
        </Typography>
      </Paper>
      
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          <Grid item xs={4} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <ChatList
              userType="doctor"
              userId={user?.id}
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChatId}
            />
          </Grid>
          <Grid item xs={8}>
            {selectedChatId ? (
              <ChatInterface
                chatRoomId={selectedChatId}
                onClose={() => setSelectedChatId(null)}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                color: 'text.secondary'
              }}>
                <Typography variant="h6" gutterBottom>
                  Select a patient conversation
                </Typography>
                <Typography variant="body2">
                  Choose a chat from the list to start messaging
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChatWithPatient;