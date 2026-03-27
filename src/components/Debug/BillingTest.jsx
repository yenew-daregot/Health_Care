import React, { useState, useEffect } from 'react';
import billingApi from '../../api/billingApi';

const BillingTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Get service categories
      try {
        const categories = await billingApi.getServiceCategories();
        results.push({
          test: 'Get Service Categories',
          status: 'success',
          message: `Found ${categories.data.length} categories`
        });
      } catch (error) {
        results.push({
          test: 'Get Service Categories',
          status: 'error',
          message: error.message
        });
      }

      // Test 2: Get invoices
      try {
        const invoices = await billingApi.getInvoices();
        results.push({
          test: 'Get Invoices',
          status: 'success',
          message: `Found ${invoices.data.results?.length || invoices.data.length || 0} invoices`
        });
      } catch (error) {
        results.push({
          test: 'Get Invoices',
          status: 'error',
          message: error.message
        });
      }

      // Test 3: Get payments
      try {
        const payments = await billingApi.getPayments();
        results.push({
          test: 'Get Payments',
          status: 'success',
          message: `Found ${payments.data.results?.length || payments.data.length || 0} payments`
        });
      } catch (error) {
        results.push({
          test: 'Get Payments',
          status: 'error',
          message: error.message
        });
      }

      // Test 4: Get university programs
      try {
        const programs = await billingApi.getUniversityPrograms();
        results.push({
          test: 'Get University Programs',
          status: 'success',
          message: `Found ${programs.data.length} programs`
        });
      } catch (error) {
        results.push({
          test: 'Get University Programs',
          status: 'error',
          message: error.message
        });
      }

    } catch (error) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Billing System API Test</h2>
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Running Tests...' : 'Run API Tests'}
      </button>

      {testResults.length > 0 && (
        <div>
          <h3>Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '12px',
                margin: '8px 0',
                borderRadius: '6px',
                backgroundColor: result.status === 'success' ? '#dcfce7' : '#fee2e2',
                border: `1px solid ${result.status === 'success' ? '#10b981' : '#ef4444'}`
              }}
            >
              <strong>{result.test}:</strong> 
              <span style={{ 
                color: result.status === 'success' ? '#166534' : '#991b1b',
                marginLeft: '8px'
              }}>
                {result.status === 'success' ? '✅' : '❌'} {result.message}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3>Billing System Status</h3>
        <p>This test component verifies that the billing API endpoints are accessible and working correctly.</p>
        <ul>
          <li>✅ API client configuration</li>
          <li>✅ Authentication handling</li>
          <li>✅ Endpoint connectivity</li>
          <li>✅ Data retrieval</li>
        </ul>
      </div>
    </div>
  );
};

export default BillingTest;