// src/components/Navigation/Navigation.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Navigation.css';

const Navigation = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
      </div>
      <div className="navbar-container">
        <h1 className="navbar-brand">
          <Link to="/">MCQ BATTLE</Link>
        </h1>
      </div>
      <div className="navbar-right">
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {!isAuthenticated && <Link to="/register">Register</Link>}
        {isAuthenticated && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
