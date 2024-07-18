// src/components/AdminUpdateCredentials.js
import React, { useState } from 'react';

const AdminUpdateCredentials = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

      if (response.ok) {
        alert('Credentials updated successfully');
      } else {
        const data = await response.json();
        alert('Error updating credentials: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
    }
  };

  return (
    <div>
      <h2>Update Admin Credentials</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>New Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default AdminUpdateCredentials;
