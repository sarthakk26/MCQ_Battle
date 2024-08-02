// src/components/Home/Home.js
import React from 'react';
import '../assets/styles/home.css';

const Home = () => {
  return (
    <div className='bg'>
    <div className="home">
      <div className="home-content">
        <h1 className="home-title">Welcome to 1V1 MCQ Battle</h1>
        <p className="home-subtitle">Challenge your friends or join new players in an exciting quiz battle!</p>
        <div className="home-actions">
          
        </div>
      </div>
      <div className="home-features">
        <div className="feature">
          <h3>Real-Time Battles</h3>
          <p>Experience the thrill of real-time quiz battles with friends and other players.</p>
        </div>
        <div className="feature">
          <h3>Multiple Game Modes</h3>
          <p>Choose from various game modes, including the fastest answer first mode!</p>
        </div>
        <div className="feature">
          <h3>Admin Dashboard</h3>
          <p>Admins can manage questions through a dedicated dashboard.</p>
        </div>
      </div>
      <div className="home-footer">
        <p>© 2024 1V1 MCQ Battle. All rights reserved.</p>
      </div>
    </div>
    </div>
  );
};

export default Home;
