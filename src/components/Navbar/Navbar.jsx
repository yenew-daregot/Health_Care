import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ title = "Dashboard" }) => {
  const { user } = useAuth();
  
  return (
    <header className="navbar">
      {/* Title */}
      <h2 className="navbar-title">{title}</h2>
      
      {/* Profile Info & Notifications */}
      <div className="navbar-right">
        <button className="notification-btn">
          <span className="notification-icon">🔔</span>
        </button>
        <div className="user-profile">
          <span className="user-name">{user?.full_name || 'User'}</span>
          <div className="user-avatar">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;