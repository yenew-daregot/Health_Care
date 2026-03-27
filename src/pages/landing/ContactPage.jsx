import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ContactPage.css';

const ContactPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email Us',
      details: 'support@yenewdaregot.com/support@mikiyas.com',
      description: 'Send us an email anytime'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: '+251938469648/ +251932425488',
      description: 'Mon to Fri: 9am to 6pm'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      details: '123 Healthcare Ave, Medical City',
      description: 'Feel free to visit our office'
    },
    
  ];

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book appointments through your patient dashboard after signing up and logging into your account.'
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we use enterprise-grade encryption and follow HIPAA compliance standards to protect your data.'
    },
    {
      question: 'Can I access my medical records online?',
      answer: 'Yes, all registered patients can access their medical records, test results, and prescription history through their dashboard.'
    },
    {
      question: 'Do you offer emergency services?',
      answer: 'For medical emergencies, please call 911 immediately. Our platform is for non-emergency healthcare management.'
    }
  ];

  return (
    <div className="contact-container">
      {/* Navigation */}
      <nav className="navbar glass-effect">
        <div className="container">
          <div className="cnav-content">
            <div className="brand-wrapper">
              <Link to="/" className="brand-title">HealthCareSystem</Link>
            </div>
            
            <div className="nav-actions">
              <Link to="/" className="link-text">Home</Link>
              <Link to="/about" className="link-text">About Us</Link>
              <Link to="/contact" className="link-text">Contact us</Link>
              {isAuthenticated ? (
                <>
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
                  <Link to="/login" className="btn btn-primary">Login</Link>
                  <Link to="/register" className="btn btn-primary">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Contact Us</h1>
            <p className="contact-hero-description">
              We're here to help! Get in touch with our team for any questions, 
              concerns, or support you may need.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitStatus === 'success' && (
                  <div className="form-success">
                    ✅ Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info-section">
              <h2>Get in Touch</h2>
              <p>Multiple ways to reach us. Choose what works best for you.</p>
              
              <div className="contact-methods">
                {contactInfo.map((method, index) => (
                  <div key={index} className="contact-method">
                    <div className="method-icon">{method.icon}</div>
                    <div className="method-details">
                      <h3>{method.title}</h3>
                      <p className="method-main">{method.details}</p>
                      <p className="method-description">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                      <h4>{faq.question}</h4>
                      <p>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <h2>Our Location</h2>
          <div className="map-placeholder">
            <div className="map-content">
              <span className="map-icon">🗺️</span>
              <h3>HealthCareSystem Headquarters</h3>
              <p>123 Healthcare Avenue, Medical City, MC 12345</p>
              <p>📍 Interactive map would be displayed here</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Need Immediate Assistance?</h2>
            <p>Our support team is available 24/7 to help you with any urgent matters.</p>
            <div className="cta-buttons">
              <a href="tel:+15551234567" className="btn btn-primary btn-large">
                📞 Call Now
              </a>
              <button className="btn btn-outline btn-large">
                💬 Start Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;