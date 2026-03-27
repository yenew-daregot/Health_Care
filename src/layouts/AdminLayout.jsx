import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile sidebar toggle button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? '☰' : '✕'}
      </button>
      
      <div className={`admin-layout__sidebar-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar role="ADMIN" />
      </div>
      
      <div className="admin-layout__main-content">
        <div className="admin-layout__navbar-container">
          <Navbar title="Admin Dashboard" />
        </div>
        
        <div className="admin-layout__page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;