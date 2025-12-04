import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Welcome, {user?.name}!</h1>
        <div className="dashboard-grid">
          <Link to="/search" className="dashboard-card">
            <div className="card-icon">🔍</div>
            <h3>Search Parking</h3>
            <p>Find available parking spots near you</p>
          </Link>
          <Link to="/bookings" className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>My Bookings</h3>
            <p>View and manage your parking bookings</p>
          </Link>
          {user?.role === 'manager' && (
            <Link to="/manager/dashboard" className="dashboard-card">
              <div className="card-icon">🏢</div>
              <h3>Manager Dashboard</h3>
              <p>Manage your parking facilities</p>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="dashboard-card">
              <div className="card-icon">⚙️</div>
              <h3>Admin Dashboard</h3>
              <p>Platform administration</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

