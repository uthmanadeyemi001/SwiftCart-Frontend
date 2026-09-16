import { useState } from 'react';
import { api } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/Login.css';
import SwiftPic from '../assets/bgremovedswiftcart.png';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/users/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate(response.data.user?.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-left-pane">
        <div className="login-top-nav">
          <Link to="/" className="navbar-brand">
            <img src={SwiftPic} alt="SwiftCart Logo" />
          </Link>
          <div className="signup-prompt">
            New member? <Link to="/signup">Sign up</Link>
          </div>
        </div>

        <div className="login-form-content">
          <h1>Welcome Back</h1>
          <p>Access your SwiftCart account and continue shopping</p>

          {error && <div style={{ color: '#DC2626', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              className="login-input-box"
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              className="login-input-box"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="login-submit-btn">
              Sign In <span>→</span>
            </button>
          </form>
        </div>

        <div style={{ fontSize: '12px', color: '#94A3B8' }}>
          © 2026 SwiftCart. All rights reserved.
        </div>
      </div>

      <div className="login-right-pane">
        <div className="login-right-shape"></div>
        <div className="login-floating-card">
          <div className="login-card-header">Fast Portal Access</div>
          <div className="login-card-value">Seamless Shopping</div>
          <div className="login-card-desc">
            Jump back right into your active cart, tracking orders, and saved wishlist items instantly.
          </div>
        </div>
      </div>
    </div>
  );
}