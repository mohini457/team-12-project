import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🅿️ Parking Finder
        </Link>
        <div className="navbar-menu">
          <Link to="/search" className="navbar-link">Search Parking</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/bookings" className="navbar-link">My Bookings</Link>
              {user.role === 'manager' || user.role === 'admin' ? (
                <Link to="/manager/dashboard" className="navbar-link">Manager</Link>
              ) : null}
              {user.role === 'admin' ? (
                <Link to="/admin/dashboard" className="navbar-link">Admin</Link>
              ) : null}
              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

