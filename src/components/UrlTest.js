import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UrlTest = () => {
  const [results, setResults] = useState([]);

  const testUrls = async () => {
    const urlsToTest = [
      { 
        url: '/api/doctors/dashboard/', 
        method: 'GET', 
        description: 'Doctor Dashboard' 
      },
      { 
        url: '/api/doctors/appointments/', 
        method: 'GET', 
        description: 'Doctor Appointments' 
      },
      { 
        url: '/api/doctors/profile/', 
        method: 'GET', 
        description: 'Doctor Profile' 
      },
      { 
        url: '/api/doctors/', 
        method: 'GET', 
        description: 'All Doctors' 
      },
      { 
        url: '/api/health/', 
        method: 'GET', 
        description: 'Health Check' 
      },
      { 
        url: '/api/debug/urls/', 
        method: 'GET', 
        description: 'Debug URLs' 
      },
    ];

    const testResults = [];

    for (const test of urlsToTest) {
      try {
        console.log(`Testing: ${test.url}`);
        const startTime = Date.now();
        const response = await axios.get(test.url, {
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const endTime = Date.now();
        
        testResults.push({
          url: test.url,
          description: test.description,
          status: '✅ SUCCESS',
          statusCode: response.status,
          responseTime: `${endTime - startTime}ms`,
          data: response.data
        });
      } catch (error) {
        testResults.push({
          url: test.url,
          description: test.description,
          status: '❌ FAILED',
          statusCode: error.response?.status || 'No response',
          error: error.message,
          details: error.response?.data
        });
      }
    }

    setResults(testResults);
  };

  useEffect(() => {
    testUrls();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>URL Endpoint Test</h2>
      <button onClick={testUrls} style={{ margin: '10px 0', padding: '10px' }}>
        Run Tests
      </button>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Description</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>URL</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Code</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} style={{ backgroundColor: result.status.includes('✅') ? '#e6ffe6' : '#ffe6e6' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.description}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.url}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.statusCode}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {result.error ? (
                  <div>
                    <strong>Error:</strong> {result.error}<br/>
                    <strong>Details:</strong> {JSON.stringify(result.details)}
                  </div>
                ) : (
                  <div>
                    <strong>Time:</strong> {result.responseTime}<br/>
                    <strong>Response:</strong> {JSON.stringify(result.data).substring(0, 100)}...
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UrlTest;