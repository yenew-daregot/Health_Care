import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Tooltip,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send,
  AttachFile,
  MoreVert,
  Search,
  Phone,
  VideoCall,
  Info,
  Close,
  Reply,
  Edit,
  Delete,
  Download,
  Image,
  Description,
  Mic,
  Stop,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

import chatApi from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import FileUploadDialog from './FileUploadDialog';
import ChatSettings from './ChatSettings';
import TypingIndicator from './TypingIndicator';

const ChatInterface = ({ chatRoomId, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoom, setChatRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  // UI state
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const websocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  // WebSocket connection
  useEffect(() => {
    if (chatRoomId) {
      connectWebSocket();
      loadChatData();
    }
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [chatRoomId]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const connectWebSocket = async () => {
    try {
      const tokenResponse = await chatApi.getWebSocketToken();
      const token = tokenResponse.data.token;
      
      const wsUrl = `ws://localhost:8000/ws/chat/${chatRoomId}/?token=${token}`;
      websocketRef.current = new WebSocket(wsUrl);
      
      websocketRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      websocketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      websocketRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (chatRoomId) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };
  
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'chat_message':
        setMessages(prev => [...prev, data.message]);
        break;
      case 'typing':
        handleTypingIndicator(data);
        break;
      case 'read_receipt':
        handleReadReceipt(data);
        break;
      case 'user_joined':
        console.log(`${data.username} joined the chat`);
        break;
      case 'user_left':
        console.log(`${data.username} left the chat`);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  };
  
  const handleTypingIndicator = (data) => {
    if (data.user_id !== user.id) {
      setTypingUsers(prev => {
        if (data.typing) {
          return [...prev.filter(u => u.id !== data.user_id), { id: data.user_id, username: data.username }];
        } else {
          return prev.filter(u => u.id !== data.user_id);
        }
      });
    }
  };
  
  const handleReadReceipt = (data) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.message_id 
        ? { ...msg, status: 'read', read_at: new Date().toISOString() }
        : msg
    ));
  };
  
  const loadChatData = async () => {
    try {
      setLoading(true);
      const [roomResponse, messagesResponse, participantsResponse] = await Promise.all([
        chatApi.getChatRoom(chatRoomId),
        chatApi.getRoomMessages(chatRoomId),
        chatApi.getRoomParticipants(chatRoomId)
      ]);
      
      setChatRoom(roomResponse.data);
      setMessages(messagesResponse.data.results || messagesResponse.data);
      setParticipants(participantsResponse.data.results || participantsResponse.data);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() && !audioBlob) return;
    
    try {
      setSending(true);
      
      let messageData = {
        chat_room: chatRoomId,
        message_type: 'text',
        content: newMessage.trim()
      };
      
      if (replyToMessage) {
        messageData.reply_to = replyToMessage.id;
      }
      
      if (audioBlob) {
        messageData.message_type = 'audio';
        messageData.file = audioBlob;
      }
      
      // Send via WebSocket for real-time delivery
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'chat_message',
          message: newMessage.trim(),
          message_type: audioBlob ? 'audio' : 'text',
          reply_to: replyToMessage?.id
        }));
      }
      
      // Also send via API for persistence
      await chatApi.sendMessage(messageData);
      
      setNewMessage('');
      setReplyToMessage(null);
      setAudioBlob(null);
      setRecordingTime(0);
      
      // Stop typing indicator
      sendTypingIndicator(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const sendTypingIndicator = (typing) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({
        type: 'typing',
        typing: typing
      }));
    }
  };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFileUpload = async (file, messageType = 'file') => {
    try {
      const uploadData = {
        chat_room: chatRoomId,
        file: file
      };
      
      await chatApi.uploadFile(uploadData);
      setShowFileDialog(false);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };
  
  const markMessagesAsRead = async () => {
    try {
      await chatApi.markAllMessagesRead(chatRoomId);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };
  
  const getOtherParticipant = () => {
    return participants.find(p => p.user.id !== user.id);
  };
  
  const otherParticipant = getOtherParticipant();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Chat Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Avatar 
            src={otherParticipant?.user?.profile_picture} 
            sx={{ mr: 2 }}
          >
            {otherParticipant?.user?.first_name?.[0]}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {otherParticipant?.user?.first_name} {otherParticipant?.user?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {otherParticipant?.is_online ? 'Online' : `Last seen ${formatDistanceToNow(new Date(otherParticipant?.last_seen))} ago`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <Search />
            </IconButton>
            <IconButton>
              <Phone />
            </IconButton>
            <IconButton>
              <VideoCall />
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            {isMobile && (
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            )}
          </Box>
        </Toolbar>
        
        {showSearch && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
        )}
      </AppBar>
      
      {/* Messages Area */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 1,
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'
      }}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === user.id}
            showAvatar={index === 0 || messages[index - 1].sender_id !== message.sender_id}
            onReply={() => setReplyToMessage(message)}
            onEdit={() => {/* Handle edit */}}
            onDelete={() => {/* Handle delete */}}
          />
        ))}
        
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Reply Preview */}
      {replyToMessage && (
        <Box sx={{ 
          p: 1, 
          bgcolor: 'action.hover', 
          borderTop: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Reply fontSize="small" />
            <Typography variant="body2">
              Replying to {replyToMessage.sender === user.username ? 'yourself' : replyToMessage.sender}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
              {replyToMessage.content}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReplyToMessage(null)}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {/* Audio Recording Preview */}
      {audioBlob && (
        <Box sx={{ 
          p: 1, 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Mic />
            <Typography variant="body2">
              Audio recorded ({Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')})
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setAudioBlob(null)}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {/* Message Input */}
      <Box sx={{ 
        p: 1, 
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <IconButton onClick={() => setShowFileDialog(true)}>
            <AttachFile />
          </IconButton>
          
          <TextField
            ref={messageInputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={sending}
            variant="outlined"
            size="small"
          />
          
          {newMessage.trim() || audioBlob ? (
            <IconButton 
              color="primary" 
              onClick={sendMessage}
              disabled={sending}
            >
              <Send />
            </IconButton>
          ) : (
            <IconButton 
              color={isRecording ? "error" : "primary"}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
            >
              {isRecording ? <Stop /> : <Mic />}
            </IconButton>
          )}
        </Box>
        
        {isRecording && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'error.main',
              animation: 'pulse 1s infinite'
            }} />
            <Typography variant="caption" color="error">
              Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setShowSettings(true)}>
          <Info sx={{ mr: 1 }} />
          Chat Info
        </MenuItem>
        <MenuItem onClick={markMessagesAsRead}>
          Mark all as read
        </MenuItem>
        <MenuItem>
          Export chat
        </MenuItem>
        <Divider />
        <MenuItem sx={{ color: 'error.main' }}>
          Block user
        </MenuItem>
      </Menu>
      
      {/* File Upload Dialog */}
      <FileUploadDialog
        open={showFileDialog}
        onClose={() => setShowFileDialog(false)}
        onUpload={handleFileUpload}
      />
      
      {/* Chat Settings Dialog */}
      <ChatSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
        chatRoom={chatRoom}
        participants={participants}
      />
    </Box>
  );
};

export default ChatInterface;