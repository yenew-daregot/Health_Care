import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const testConnection = async () => {
    try {
      setStatus('Testing connection...');
      
      // Test with relative URL (proxy should handle this)
      const response = await axios.get('/api/health/', {
        timeout: 5000
      });
      
      setData(response.data);
      setStatus('✅ Connected successfully!');
      setError(null);
      
    } catch (err) {
      setError(err.message);
      setStatus('❌ Connection failed');
      
      // Try direct connection as fallback
      try {
        console.log('Trying direct connection...');
        const directResponse = await axios.get('http://localhost:8000/api/health/', {
          timeout: 5000
        });
        console.log('Direct connection works:', directResponse.data);
      } catch (directError) {
        console.error('Direct connection also failed:', directError.message);
      }
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      margin: '20px',
      backgroundColor: error ? '#ffe6e6' : '#f0f8ff'
    }}>
      <h2>API Connection Test</h2>
      <p><strong>Status:</strong> {status}</p>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div style={{ margin: '10px 0' }}>
          <strong>Response:</strong>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '5px',
            overflowX: 'auto'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <button 
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Again
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <h4>Debug Info:</h4>
        <ul>
          <li>React URL: http://localhost:3000</li>
          <li>Django URL: http://localhost:8000</li>
          <li>Proxy in package.json: http://127.0.0.1:8000</li>
          <li>API Endpoint: /api/health/</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;