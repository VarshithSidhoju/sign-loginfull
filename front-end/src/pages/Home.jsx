import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';

const Home = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        password: '',
      });
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      // Only include password if it's been changed
      if (formData.password && formData.password.trim() !== '') {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        updateData.password = formData.password;
      }

      // Call API to update profile
      const updatedUser = await authService.updateProfile(updateData);
      
      // Update user in context
      updateUser(updatedUser);
      
      // Show success message
      setMessage('Profile updated successfully!');
      
      // Exit edit mode
      setIsEditing(false);
      
      // Clear password field
      setFormData(prevData => ({ ...prevData, password: '' }));
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      password: '',
    });
    setError('');
    setMessage('');
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to Your Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>



      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {!isEditing ? (
        <div className="user-info">
          <h2>Profile Information</h2>
          <div className="info-card">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{currentUser?.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{currentUser?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID:</span>
              <span className="info-value">{currentUser?._id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {currentUser?.createdAt ? formatDate(currentUser.createdAt) : 'N/A'}
              </span>
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="btn">
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="edit-form">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="edit-name">Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-email">Email</label>
              <input
                type="email"
                id="edit-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-password">
                New Password <span className="optional">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                id="edit-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn" 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Additional dashboard content can be added here */}
      <div className="dashboard-content">
        <h3>Dashboard Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Logins</h4>
            <p className="stat-number">12</p>
          </div>
          <div className="stat-card">
            <h4>Last Login</h4>
            <p className="stat-text">Today</p>
          </div>
          <div className="stat-card">
            <h4>Account Status</h4>
            <p className="stat-text status-active">Active</p>
          </div>
          <div className="stat-card">
            <h4>Profile Completion</h4>
            <p className="stat-number">100%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;