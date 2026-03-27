import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext'; 
import AppRoutes from './router/AppRoutes';
import { SnackbarProvider } from 'notistack'; 
import './App.css';

function App() {
  useEffect(() => {
    // Log environment info
    console.log('=== Medical System ===');
    console.log('API URL:', process.env.REACT_APP_API_BASE_URL || 'Not set');
    console.log('Environment:', process.env.REACT_APP_ENVIRONMENT || 'Not set');
    console.log('Debug:', process.env.REACT_APP_DEBUG || 'Not set');
    console.log('=====================');
    
    // Test backend connection
    const testConnection = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${apiUrl}/test/`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend connected:', data.message);
        } else {
          console.warn('⚠️ Backend responded with:', response.status);
        }
      } catch (error) {
        console.error('❌ Cannot connect to backend:', error.message);
        console.log('Make sure Django is running: python manage.py runserver');
      }
    };
    
    testConnection();
  }, []);

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      autoHideDuration={3000}
      preventDuplicate
    >
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;