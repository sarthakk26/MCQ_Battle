import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className='bg'>
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="dashboard-buttons">
        <button className="dashboard-btn" onClick={() => navigate('/admin/mcqs')}>
          Manage MCQs
        </button>
        <button className="dashboard-btn" onClick={() => navigate('/admin/update-credentials')}>
          Update Credentials
        </button>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
