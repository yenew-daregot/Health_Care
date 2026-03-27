// DoctorReports.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const DoctorReports = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <button 
        onClick={() => navigate('/doctor/dashboard')} 
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="mr-2" /> Back to Dashboard
      </button>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart3 className="mr-3" /> Reports & Analytics
        </h1>
        <p>Doctor reports page - Under Development</p>
      </div>
    </div>
  );
};

export default DoctorReports;