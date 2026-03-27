import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

const DoctorSettings = () => {
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
          <SettingsIcon className="mr-3" /> Settings
        </h1>
        <p>Doctor settings page - Under Development</p>
      </div>
    </div>
  );
};

export default DoctorSettings;