import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import './DoctorLayout.css';

const DoctorLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="doctor-layout">
      {/* Mobile sidebar toggle button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? '☰' : '✕'}
      </button>
      
      <div className={`doctor-layout__sidebar-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar />
      </div>
      
      <div className="doctor-layout__main-content">
        <div className="doctor-layout__navbar-container">
          <Navbar title="Doctor Portal" />
        </div>
        
        <div className="doctor-layout__page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;