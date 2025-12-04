import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Find Parking Spots Instantly</h1>
          <p>Real-time parking availability at your fingertips</p>
          <div className="hero-buttons">
            <Link to="/search" className="btn btn-primary btn-large">
              Search Parking
            </Link>
            <Link to="/register" className="btn btn-secondary btn-large">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Real-Time Updates</h3>
              <p>Get instant updates on parking slot availability</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Location-Based Search</h3>
              <p>Find parking near you with GPS integration</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Quick Booking</h3>
              <p>Reserve your spot in seconds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Get alerts for booking expiry and availability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

