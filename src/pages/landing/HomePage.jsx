import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: '👨‍⚕️',
      title: 'Expert Doctors',
      description: 'Connect with certified healthcare professionals for personalized care.'
    },
    {
      icon: '💊',
      title: 'Medication Management',
      description: 'Track and manage your medications with smart reminders and alerts.'
    },
    {
      icon: '📅',
      title: 'Easy Appointments',
      description: 'Book, reschedule, or cancel appointments with just a few clicks.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your health data is protected with enterprise-grade security.'
    }
  ];

  // Doctor image URL 
  const doctorImage = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=700&q=80';

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar glass-effect">
        <div className="home_container">
          <div className="homenav-content">
            <div className="brand-wrapper">
              <h1 className="brand-title">HealthCareSystem</h1>
            </div>
            
            <div className="nav-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/" className="link-text">Home</Link>
                  <Link to="/about" className="link-text">About us</Link>
                  <Link to="/contact" className="link-text">Contact us</Link>
                  <span className="welcome-text">Welcome, {user?.username}</span>
                  <Link
                    to={`/${user?.role?.toLowerCase()}/dashboard`}
                    className="btn btn-primary"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="link-text">Home</Link>
                  <Link to="/about" className="link-text">About us</Link>
                  <Link to="/contact" className="link-text">Contact us</Link>
                  <Link to="/login" className="btn btn-primary">Login</Link>
                  <Link to="/register" className="btn btn-primary">Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container hero-section">
        <div className="hero-content">
          <div className="hero-grid">
            {/* Left side - Text content */}
            <div className="hero-text">
              <h1 className="hero-title">
                Your Health, Our 
                <span className="highlight"> Priority</span>
              </h1>
              
              <p className="hero-description">
                Comprehensive healthcare management system for patients, doctors, and administrators. 
                Manage appointments, medications, and medical records seamlessly.
              </p>

              {!isAuthenticated && (
                <div className="hero-buttons">
                  <Link
                    to="/register"
                    className="btn btn-primary btn-large hover-lift"
                  >
                    Get Started 
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-outline btn-large hover-lift"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Right side - Doctor Image */}
            <div className="hero-image-container">
              <div className="image-wrapper">
                <img 
                  src={doctorImage} 
                  alt="Professional Doctor" 
                  className="doctor-image"
                />
                <div className="image-decoration"></div>
              </div>
            </div>
          </div>

          {/* Features Grid - Below hero section */}
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card hover-lift">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {!isAuthenticated && (
        <div className="scroll-indicator">
          <span>↓</span>
        </div>
      )}
    </div>
  );
};

export default HomePage;