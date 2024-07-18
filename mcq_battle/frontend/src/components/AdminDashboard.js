// src/components/AdminDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <button onClick={() => navigate('/admin/mcqs')}>Manage MCQs</button>
      <button onClick={() => navigate('/admin/update-credentials')}>Update Credentials</button>
    </div>
  );
};

export default AdminDashboard;
