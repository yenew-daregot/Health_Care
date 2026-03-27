import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Paper
} from '@mui/material';
import {
  MoreVert,
  Reply,
  Edit,
  Delete,
  Download,
  Check,
  DoneAll
} from '@mui/icons-material';
import { format } from 'date-fns';

const MessageBubble = ({ 
  message, 
  isOwn, 
  showAvatar, 
  onReply, 
  onEdit, 
  onDelete 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case 'sent':
        return <Check fontSize="small" />;
      case 'delivered':
      case 'read':
        return <DoneAll fontSize="small" color={message.status === 'read' ? 'primary' : 'inherit'} />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'text':
        return (
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
        );
      case 'image':
        return (
          <Box>
            <img 
              src={message.file} 
              alt="Shared image" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                borderRadius: '8px' 
              }} 
            />
            {message.content && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {message.content}
              </Typography>
            )}
          </Box>
        );
      case 'file':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              📎 {message.file_name || 'File'}
            </Typography>
            <IconButton size="small" onClick={() => window.open(message.file, '_blank')}>
              <Download fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'audio':
        return (
          <Box>
            <audio controls style={{ width: '100%' }}>
              <source src={message.file} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </Box>
        );
      case 'prescription':
        return (
          <Box>
            <Chip 
              label="💊 Prescription" 
              color="primary" 
              size="small" 
              sx={{ mb: 1 }} 
            />
            <Typography variant="body2">
              {message.content}
            </Typography>
          </Box>
        );
      case 'lab_result':
        return (
          <Box>
            <Chip 
              label="🔬 Lab Result" 
              color="secondary" 
              size="small" 
              sx={{ mb: 1 }} 
            />
            <Typography variant="body2">
              {message.content}
            </Typography>
          </Box>
        );
      case 'appointment':
        return (
          <Box>
            <Chip 
              label="📅 Appointment" 
              color="info" 
              size="small" 
              sx={{ mb: 1 }} 
            />
            <Typography variant="body2">
              {message.content}
            </Typography>
          </Box>
        );
      case 'system':
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              color: 'text.secondary',
              textAlign: 'center'
            }}
          >
            {message.content}
          </Typography>
        );
      default:
        return (
          <Typography variant="body1">
            {message.content}
          </Typography>
        );
    }
  };

  if (message.message_type === 'system') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        my: 1 
      }}>
        <Paper 
          sx={{ 
            px: 2, 
            py: 0.5, 
            bgcolor: 'action.hover',
            borderRadius: 2
          }}
        >
          {renderMessageContent()}
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isOwn ? 'row-reverse' : 'row',
      mb: 1,
      alignItems: 'flex-end'
    }}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            mr: 1,
            bgcolor: 'primary.main'
          }}
        >
          {message.sender_name?.[0] || 'U'}
        </Avatar>
      )}
      
      {/* Spacer for alignment */}
      {!showAvatar && !isOwn && (
        <Box sx={{ width: 40 }} />
      )}
      
      {/* Message Content */}
      <Box sx={{ 
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start'
      }}>
        {/* Reply indicator */}
        {message.reply_to && (
          <Box sx={{ 
            mb: 0.5,
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            borderLeft: 3,
            borderColor: 'primary.main',
            maxWidth: '100%'
          }}>
            <Typography variant="caption" color="primary">
              Replying to {message.reply_to.sender_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {message.reply_to.content}
            </Typography>
          </Box>
        )}
        
        {/* Message bubble */}
        <Paper
          sx={{
            p: 1.5,
            bgcolor: isOwn ? 'primary.main' : 'background.paper',
            color: isOwn ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            borderTopRightRadius: isOwn ? 0.5 : 2,
            borderTopLeftRadius: isOwn ? 2 : 0.5,
            position: 'relative',
            '&:hover .message-actions': {
              opacity: 1
            }
          }}
        >
          {renderMessageContent()}
          
          {/* Message info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mt: 0.5,
            gap: 1
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: isOwn ? 'primary.contrastText' : 'text.secondary',
                opacity: 0.7
              }}
            >
              {formatTime(message.timestamp)}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getStatusIcon()}
              
              {/* Message actions */}
              <IconButton
                size="small"
                className="message-actions"
                sx={{ 
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  color: isOwn ? 'primary.contrastText' : 'text.secondary'
                }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Message actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{
          vertical: 'top',
          horizontal: isOwn ? 'right' : 'left',
        }}
      >
        <MenuItem onClick={() => { onReply(message); setAnchorEl(null); }}>
          <Reply fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        
        {isOwn && (
          <MenuItem onClick={() => { onEdit(message); setAnchorEl(null); }}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        
        {message.file && (
          <MenuItem onClick={() => window.open(message.file, '_blank')}>
            <Download fontSize="small" sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        
        {isOwn && (
          <MenuItem 
            onClick={() => { onDelete(message); setAnchorEl(null); }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default MessageBubble;