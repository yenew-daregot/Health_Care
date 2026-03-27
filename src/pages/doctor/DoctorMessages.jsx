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
  Badge,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../../components/Chat/ChatList';
import ChatInterface from '../../components/Chat/ChatInterface';
import chatApi from '../../api/chatApi';
import doctorsApi from '../../api/doctorsApi';
import './DoctorMessages.css';

const DoctorMessages = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const location = useLocation();
  
  const [selectedChatId, setSelectedChatId] = useState(
    location.state?.selectedChatId || null
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [chatStats, setChatStats] = useState({
    totalChats: 0,
    activeChats: 0,
    unreadMessages: 0
  });
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    loadDoctorProfile();
    loadChatStats();
    testChatSystem();
    
    // If we have a selectedChatId from navigation state, open mobile drawer
    if (location.state?.selectedChatId && isMobile) {
      setMobileDrawerOpen(true);
    }
  }, [location.state, isMobile]);

  const testChatSystem = async () => {
    try {
      console.log('Testing chat system...');
      const response = await chatApi.testChatSystem();
      console.log('Chat system test result:', response.data);
      setDebugInfo(response.data);
    } catch (err) {
      console.error('Chat system test failed:', err);
      setDebugInfo({
        error: 'Chat system test failed',
        details: err.message,
        status: err.response?.status
      });
    }
  };

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading doctor profile...');
      const response = await doctorsApi.getProfile();
      console.log('Doctor profile response:', response);
      
      if (response && response.data) {
        setDoctorProfile(response.data);
        console.log('Doctor profile loaded successfully:', response.data);
      } else {
        throw new Error('No profile data received');
      }
    } catch (err) {
      console.error('Error loading doctor profile:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to load doctor profile. ';
      
      if (err.response?.status === 404) {
        errorMessage = 'Doctor profile not found. Please complete your profile setup first.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please ensure you have doctor permissions.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else {
        errorMessage += 'Please try again or contact support if the issue persists.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadChatStats = async () => {
    try {
      // In a real implementation, you'd have an endpoint for chat statistics
      // For now, we'll use placeholder data
      setChatStats({
        totalChats: 15,
        activeChats: 8,
        unreadMessages: 3
      });
      setTotalUnreadCount(3);
    } catch (err) {
      console.error('Error loading chat stats:', err);
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
    loadDoctorProfile();
    loadChatStats();
    testChatSystem();
  };

  const handleSkipToChat = () => {
    // Skip profile loading and go directly to chat with mock data
    setError(null);
    setDoctorProfile({
      id: user?.id || 'mock',
      user: user || { first_name: 'Doctor', last_name: 'User' },
      specialization: 'General Practice',
      is_available: true,
      is_verified: true
    });
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
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button onClick={loadDoctorProfile} variant="contained">
            Retry
          </Button>
          <Button 
            onClick={handleSkipToChat}
            variant="outlined"
          >
            Continue Anyway
          </Button>
          <Button 
            onClick={() => setShowDebug(!showDebug)}
            variant="text"
            startIcon={<BugReportIcon />}
          >
            Debug Info
          </Button>
        </Box>
        
        {/* Debug Information */}
        {showDebug && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Debug Information
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', overflow: 'auto' }}>
                {JSON.stringify({
                  user: user ? {
                    id: user.id,
                    username: user.username,
                    user_type: user.user_type,
                    first_name: user.first_name,
                    last_name: user.last_name
                  } : 'No user',
                  debugInfo: debugInfo,
                  error: error,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        )}
        
        {/* Show helpful information */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Troubleshooting Tips:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
            <li>Make sure you're logged in as a doctor</li>
            <li>Check if your doctor profile is complete</li>
            <li>Try refreshing the page</li>
            <li>Use "Continue Anyway" to access chat with limited features</li>
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!doctorProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please complete your doctor profile to access messaging features.
        </Alert>
        <Button 
          onClick={handleSkipToChat}
          variant="contained"
        >
          Continue with Basic Chat
        </Button>
      </Box>
    );
  }

  return (
    <div className="doctor-messages">
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
                Patient Messages
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Communicate with your patients securely
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton onClick={handleRefresh} title="Refresh">
                <RefreshIcon />
              </IconButton>
              <Badge badgeContent={totalUnreadCount} color="error">
                <ChatIcon />
              </Badge>
            </Box>
          </Box>
        </Paper>

        {/* Stats Cards */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {chatStats.totalChats}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Conversations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="success.main" gutterBottom>
                    {chatStats.activeChats}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Chats
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color="warning.main" gutterBottom>
                    {chatStats.unreadMessages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unread Messages
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {isMobile ? (
            // Mobile Layout
            <>
              <ChatList
                userType="doctor"
                userId={doctorProfile.id}
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
                  userType="doctor"
                  userId={doctorProfile.id}
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
                    color: 'text.secondary',
                    p: 4
                  }}>
                    <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      Select a patient conversation
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mb: 3 }}>
                      Choose a chat from the list to start messaging with your patients
                    </Typography>
                    
                    {/* Quick Tips for Doctors */}
                    <Box sx={{ maxWidth: 400, textAlign: 'left' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        💡 Quick Tips:
                      </Typography>
                      <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                        <li>Share prescriptions directly in chat</li>
                        <li>Discuss lab results with patients</li>
                        <li>Send appointment reminders</li>
                        <li>Provide follow-up care instructions</li>
                      </Typography>
                    </Box>
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

export default DoctorMessages;