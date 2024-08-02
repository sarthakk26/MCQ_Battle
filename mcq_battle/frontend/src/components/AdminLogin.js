// components/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost:5000/api/auth/admin/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('token', data.token);
            navigate('/admin/dashboard');
          } else {
            setError(data.message);
          }
        } catch (error) {
          console.error('Error during login:', error);
          setError('Server error');
        }
      };

      return (
        <div className='bg'>
        <div className="login">
          <h2>Admin Login</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleLogin}>
            <div>
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
        </div>
      );
    };
    
    export default AdminLogin;