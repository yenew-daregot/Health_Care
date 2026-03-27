import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  const getUserNames = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      mb: 1,
      ml: 1
    }}>
      <Avatar 
        sx={{ 
          width: 32, 
          height: 32, 
          mr: 1,
          bgcolor: 'grey.400'
        }}
      >
        {users[0]?.username?.[0] || 'U'}
      </Avatar>
      
      <Box sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {getUserNames()}
        </Typography>
        
        {/* Animated dots */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'text.secondary',
                animation: 'typing-dot 1.4s infinite',
                animationDelay: `${i * 0.2}s`,
                '@keyframes typing-dot': {
                  '0%, 60%, 100%': {
                    opacity: 0.3,
                    transform: 'scale(0.8)'
                  },
                  '30%': {
                    opacity: 1,
                    transform: 'scale(1)'
                  }
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TypingIndicator;