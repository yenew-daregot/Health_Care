import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Close } from '@mui/icons-material';

const ChatSettings = ({ open, onClose, chatRoom, participants }) => {
  if (!chatRoom) return null;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'consultation': return 'primary';
      case 'follow_up': return 'secondary';
      case 'emergency': return 'error';
      case 'general': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Chat Information
        <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
          <Close />
        </Button>
      </DialogTitle>
      
      <DialogContent>
        {/* Chat Room Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chat Details
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Room Type
            </Typography>
            <Chip 
              label={chatRoom.room_type?.replace('_', ' ') || 'General'} 
              color={getRoomTypeColor(chatRoom.room_type)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Priority
            </Typography>
            <Chip 
              label={chatRoom.priority || 'Normal'} 
              color={getPriorityColor(chatRoom.priority)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1">
              {formatDate(chatRoom.created_at)}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Last Activity
            </Typography>
            <Typography variant="body1">
              {formatDate(chatRoom.last_activity)}
            </Typography>
          </Box>
          
          {chatRoom.description && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {chatRoom.description}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Participants */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Participants ({participants?.length || 0})
          </Typography>
          
          <List>
            {participants?.map((participant) => (
              <ListItem key={participant.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar src={participant.user?.profile_picture}>
                    {participant.user?.first_name?.[0] || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${participant.user?.first_name || ''} ${participant.user?.last_name || ''}`.trim() || participant.user?.username}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip 
                        label={participant.role} 
                        size="small" 
                        variant="outlined"
                      />
                      <Chip 
                        label={participant.is_online ? 'Online' : 'Offline'} 
                        size="small" 
                        color={participant.is_online ? 'success' : 'default'}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Chat Settings */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Settings
          </Typography>
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Notifications"
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Sound"
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Read Receipts"
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Typing Indicators"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" onClick={onClose}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatSettings;