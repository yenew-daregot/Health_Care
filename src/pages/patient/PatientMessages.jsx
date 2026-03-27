import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../../components/Chat/ChatList';
import ChatInterface from '../../components/Chat/ChatInterface';
import chatApi from '../../api/chatApi';
import patientsApi from '../../api/patientsApi';
import './PatientMessages.css';

const PatientMessages = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const location = useLocation();
  
  const [selectedChatId, setSelectedChatId] = useState(
    location.state?.selectedChatId || null
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    loadPatientProfile();
    
    // If we have a selectedChatId from navigation state, open mobile drawer
    if (location.state?.selectedChatId && isMobile) {
      setMobileDrawerOpen(true);
    }
  }, [location.state, isMobile]);

  const loadPatientProfile = async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getProfile();
      setPatientProfile(response.data);
    } catch (err) {
      console.error('Error loading patient profile:', err);
      setError('Failed to load patient profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  const handleCloseMobileChat = () => {
    setMobileDrawerOpen(false);
    setSelectedChatId(null);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
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
        <IconButton onClick={loadPatientProfile}>
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  if (!patientProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please complete your patient profile to access messaging features.
        </Alert>
      </Box>
    );
  }

  return (
    <div className="patient-messages">
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chat with your healthcare providers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleRefresh} title="Refresh">
                <RefreshIcon />
              </IconButton>
              <Badge badgeContent={totalUnreadCount} color="error">
                <ChatIcon />
              </Badge>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {isMobile ? (
            // Mobile Layout
            <>
              <ChatList
                userType="patient"
                userId={patientProfile.id}
                onSelectChat={handleChatSelect}
                selectedChatId={selectedChatId}
              />
              
              <Drawer
                anchor="right"
                open={mobileDrawerOpen}
                onClose={handleCloseMobileChat}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: '100%',
                    height: '100%',
                  },
                }}
              >
                {selectedChatId && (
                  <ChatInterface
                    chatRoomId={selectedChatId}
                    onClose={handleCloseMobileChat}
                  />
                )}
              </Drawer>
            </>
          ) : (
            // Desktop Layout
            <Grid container sx={{ height: '100%' }}>
              <Grid item xs={4} sx={{ borderRight: 1, borderColor: 'divider' }}>
                <ChatList
                  userType="patient"
                  userId={patientProfile.id}
                  onSelectChat={handleChatSelect}
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
                    <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      Select a conversation
                    </Typography>
                    <Typography variant="body2">
                      Choose a chat from the list to start messaging
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default PatientMessages;