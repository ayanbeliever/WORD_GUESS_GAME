import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, setAuthToken, setUser } from '../../services/api.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    is_admin: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      
      // Auto-login after successful registration
      const loginResponse = await authAPI.login({
        username: formData.username,
        password: formData.password
      });

      const { token, username, is_admin } = loginResponse.data;

      // Store auth data
      setAuthToken(token);
      setUser({ username, is_admin });

      // Redirect based on user type
      if (is_admin) {
        navigate('/admin');
      } else {
        navigate('/game');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <small className="form-hint">
              Must be at least 5 characters with both uppercase and lowercase letters
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <small className="form-hint">
              Must be at least 5 characters with letters, numbers, and special characters ($, %, *, @)
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkbox-text">Register as Admin</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
