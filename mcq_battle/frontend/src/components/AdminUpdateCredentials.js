// src/components/AdminUpdateCredentials.js
import React, { useState } from 'react';
import '../assets/styles/Auth.css';

const AdminUpdateCredentials = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/admin/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Credentials updated successfully');
        setError(null);
      } else {
        setError('Error updating credentials: ' + data.message);
        setSuccess(null);
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      setError('Server error');
      setSuccess(null);
    }
  };

  return (
    <div className='bg'>
      <div className="login">
        <h2>Update Admin Credentials</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>New Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>New Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdateCredentials;
