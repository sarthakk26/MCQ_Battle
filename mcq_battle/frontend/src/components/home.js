// src/components/Home/Home.js
import React from 'react';
import '../assets/styles/home.css';

const Home = () => {
  return (
    <div className="home">
      <h2> 1V1 MCQ Battle</h2>
      <p>Register or Login to start using the website</p>
      <div className="home-actions">
        <a href="/register" className="button">Register</a>
        <a href="/login" className="button">Login</a>
      </div>
    </div>
  );
};

export default Home;
