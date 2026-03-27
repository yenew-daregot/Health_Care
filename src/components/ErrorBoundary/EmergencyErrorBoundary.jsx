import React from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class EmergencyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Emergency Component Error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Box sx={{ 
          ml: { xs: 0, md: '250px' },
          p: 3,
          width: { xs: '100%', md: 'calc(100% - 250px)' },
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{ maxWidth: 600, textAlign: 'center' }}>
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              icon={<ErrorIcon />}
            >
              <Typography variant="h6" gutterBottom>
                Emergency System Error
              </Typography>
              <Typography variant="body2" paragraph>
                There was an error loading the emergency requests. This is likely due to invalid date data or a network issue.
              </Typography>
              
              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(0,0,0,0.1)', 
                  borderRadius: 1,
                  textAlign: 'left'
                }}>
                  <Typography variant="caption" component="div">
                    <strong>Error:</strong> {this.state.error.message}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                      <strong>Stack:</strong>
                      <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleRetry}
                color="primary"
              >
                Try Again
              </Button>
              
              <Button 
                variant="outlined"
                onClick={() => window.location.reload()}
                color="secondary"
              >
                Reload Page
              </Button>
            </Box>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
              If this problem persists, please contact your system administrator.
            </Typography>
          </Box>
        </Box>
      );
    }

    // Render children normally when there's no error
    return this.props.children;
  }
}

export default EmergencyErrorBoundary;