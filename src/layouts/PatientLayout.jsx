import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import './PatientLayout.css';

const PatientLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="patient-layout">
      {/* Mobile sidebar toggle button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? '☰' : '✕'}
      </button>
      
      <div className={`patient-layout__sidebar-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar />
      </div>
      
      <div className="patient-layout__main-content">
        <div className="patient-layout__navbar-container">
          <Navbar userRole="patient" />
        </div>
        
        <div className="patient-layout__page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PatientLayout;