import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import authApi from '../../api/authApi';

const AuthDebug = () => {
  const [authState, setAuthState] = useState({
    hasToken: false,
    tokenValue: '',
    hasRefreshToken: false,
    hasUser: false,
    userRole: '',
    apiTest: null
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    // Check localStorage
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Test API call
    let apiTest = null;
    try {
      const response = await axiosClient.get('doctors/profile/');
      apiTest = { success: true, data: response.data };
    } catch (error) {
      apiTest = { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }

    setAuthState({
      hasToken: !!accessToken,
      tokenValue: accessToken ? `${accessToken.substring(0, 20)}...` : 'None',
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      userRole: user?.role || 'None',
      userName: user ? `${user.first_name} ${user.last_name}` : 'None',
      userEmail: user?.email || 'None',
      apiTest
    });
  };

  const testLogin = async () => {
    try {
      // Try to login with a test doctor account
      const response = await authApi.login({
        username: 'doctor1',
        password: 'password123'
      });
      console.log('Login successful:', response.data);
      checkAuthState();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    checkAuthState();
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      margin: '20px',
      backgroundColor: '#f9f9f9',
      fontFamily: 'monospace'
    }}>
      <h3>🔍 Authentication Debug</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Token Status:</strong>
        <ul>
          <li>Has Access Token: {authState.hasToken ? '✅' : '❌'}</li>
          <li>Token Value: {authState.tokenValue}</li>
          <li>Has Refresh Token: {authState.hasRefreshToken ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>User Status:</strong>
        <ul>
          <li>Has User Data: {authState.hasUser ? '✅' : '❌'}</li>
          <li>User Role: {authState.userRole}</li>
          <li>User Name: {authState.userName}</li>
          <li>User Email: {authState.userEmail}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>API Test (/api/doctors/profile/):</strong>
        {authState.apiTest ? (
          <div>
            <div>Status: {authState.apiTest.success ? '✅ Success' : '❌ Failed'}</div>
            {authState.apiTest.success ? (
              <div>Profile: {authState.apiTest.data?.first_name} {authState.apiTest.data?.last_name}</div>
            ) : (
              <div>
                <div>HTTP Status: {authState.apiTest.status}</div>
                <div>Error: {JSON.stringify(authState.apiTest.error)}</div>
              </div>
            )}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>

      <div>
        <button onClick={checkAuthState} style={{ marginRight: '10px' }}>
          🔄 Refresh Check
        </button>
        <button onClick={testLogin} style={{ marginRight: '10px' }}>
          🔑 Test Login
        </button>
        <button onClick={clearAuth}>
          🗑️ Clear Auth
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;