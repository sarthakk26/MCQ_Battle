// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import GamePlay from './components/Game/GamePlay';
import GameLobby from './components/Game/GameLobby';
import PrivateRoute from './components/PrivateRoute';
//import io from 'socket.io-client';

import './assets/styles/styles.css';

//const socket = io('http://localhost:5000');


const App = () => {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game/:gameId/play" element={<GamePlay />} />
          <Route path="/game/:gameId" element={<GameLobby />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
