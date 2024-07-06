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
      <div className="navbar-brand">
        <Link to="/">MCQ BATTLE</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
        {!isAuthenticated && <li><Link to="/register">Register</Link></li>}
        {isAuthenticated && <li><Link to="/dashboard">Dashboard</Link></li>}
        {isAuthenticated && (
          <li>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
