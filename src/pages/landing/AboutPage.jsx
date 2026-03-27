import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AboutPage.css';

const AboutPage = () => {
  const { isAuthenticated, user } = useAuth();

  const teamMembers = [
    {
      name: 'Dr. Miki',
      role: 'Chief Medical Officer',
      description: 'Board-certified physician with 15+ years of experience in healthcare technology.',
      avatar: '👩‍⚕️'
    },
    {
      name: 'Mike Chen',
      role: 'Technical Director',
      description: 'Software engineer specializing in healthcare systems and data security.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient Care Specialist',
      description: 'Dedicated to improving patient experience and healthcare accessibility.',
      avatar: '👩‍💼'
    },
    {
      name: 'Dr. James Wilson',
      role: 'Medical Advisor',
      description: 'Specialist in telemedicine and digital health innovations.',
      avatar: '👨‍⚕️'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Patients Served' },
    { number: '500+', label: 'Healthcare Professionals' },
    { number: '50+', label: 'Medical Facilities' },
    { number: '24/7', label: 'Support Available' }
  ];

  const values = [
    { icon: '🤝', title: 'Patient First', description: 'Every decision prioritizes patient well-being and convenience.' },
    { icon: '🔒', title: 'Security & Privacy', description: 'Enterprise-grade protection for your health data.' },
    { icon: '💡', title: 'Innovation', description: 'Continuously improving our platform to serve you better.' },
    { icon: '❤️', title: 'Compassionate Care', description: 'Quality service through certified professionals.' }
  ];

  return (
    <div className="about-page">
      {/* Navigation */}
      <header className="about-header">
        <nav className="about-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <Link to="/" className="nav-logo">HealthCareSystem</Link>
            </div>
            
            <div className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/about" className="nav-link nav-link-active">About Us</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              {isAuthenticated ? (
                <div className="nav-auth">
                  <span className="user-greeting">Welcome, {user?.username}</span>
                  <Link
                    to={`/${user?.role?.toLowerCase()}/dashboard`}
                    className="btn btn-primary"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="nav-auth">
                  <Link to="/login" className="btn btn-outline">Login</Link>
                  <Link to="/register" className="btn btn-primary">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="section-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transforming Healthcare Through 
              <span className="gradient-text"> Innovation</span>
            </h1>
            <p className="hero-subtitle">
              We're dedicated to making quality healthcare accessible to everyone through 
              cutting-edge technology and compassionate care.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="section-container">
          <div className="mission-card">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-statement">
              To bridge the gap between patients and healthcare providers through 
              intuitive technology that makes healthcare management simple, secure, 
              and accessible. We believe everyone deserves quality healthcare 
              without traditional barriers.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="section-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="section-container">
          <div className="story-grid">
            <div className="story-content">
              <h2 className="section-title">Our Journey</h2>
              <div className="story-text">
                <p>
                  Founded in 2024, HealthCareSystem emerged from a shared vision 
                  to revolutionize healthcare delivery. Our founders witnessed firsthand 
                  the challenges patients and providers face in today's complex 
                  healthcare landscape.
                </p>
                <p>
                  We started with a simple question: How can we make healthcare 
                  more patient-centric while empowering providers with better tools? 
                  The answer became HealthCareSystem – a comprehensive platform 
                  that connects patients with their healthcare journey.
                </p>
              </div>
            </div>
            <div className="story-visual">
              <div className="visual-card">
                <div className="visual-icon">🏥</div>
                <h3>Healthcare Innovation</h3>
                <p>From Vision to Reality</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Meet Our Leadership</h2>
            <p className="section-subtitle">Experienced professionals dedicated to healthcare innovation</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">{member.avatar}</div>
                <h3 className="team-name">{member.name}</h3>
                <div className="team-role">{member.role}</div>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">Principles that guide everything we do</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="section-container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to Experience Better Healthcare?</h2>
            <p className="cta-description">
              Join thousands of patients and healthcare providers using HealthCareSystem
            </p>
            <div className="cta-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to={`/${user?.role?.toLowerCase()}/dashboard`} className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;