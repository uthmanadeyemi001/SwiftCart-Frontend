import React, { useState } from 'react';
import { api } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/Signup.css';
import SwiftPic from '../assets/bgremovedswiftcart.png';

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.3 21.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.4 21.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const CheckIcon = ({ met }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    {met ? <polyline points="20 6 9 17 4 12" /> : <line x1="12" y1="12" x2="12" y2="12" />}
  </svg>
);

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const hasLengthAndNumber = formData.password.length >= 8 && /[\d\W]/.test(formData.password);
  const hasCaseMix = /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password);
  const passwordValid = hasLengthAndNumber && hasCaseMix;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValid) {
      setError('Please ensure your password meets all requirements below.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/users/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-box-wrapper">
        <div className="signup-top-nav">
          <div className="signup-nav-left">
            <button className="back-btn" onClick={() => navigate('/')} aria-label="Go back">←</button>
            <img src={SwiftPic} alt="SwiftCart Logo" className="signup-logo-img" />
          </div>
          <div className="login-prompt">
            Already a member? <Link to="/login">Sign in</Link>
          </div>
        </div>

        <div className="signup-form-content">
          <h1>Create your account</h1>
          <p>Get started with SwiftCart in seconds.</p>

          {error && (
            <div className="error-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-field-wrapper">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className="signup-input-box"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="input-field-wrapper">
              <label htmlFor="userName">Username</label>
              <input
                id="userName"
                className="signup-input-box"
                name="userName"
                placeholder="johndoe"
                value={formData.userName}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="input-field-wrapper split-row">
              <div>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  className="signup-input-box"
                  name="phoneNumber"
                  type="tel"
                  placeholder="08012345678"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  className="signup-input-box"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="input-field-wrapper">
              <label htmlFor="password">Password</label>
              <div className="password-input-shell">
                <input
                  id="password"
                  className="signup-input-box"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <div className="validation-checklist">
                <span className={hasLengthAndNumber ? 'validation-item valid' : 'validation-item'}>
                  <CheckIcon met={hasLengthAndNumber} /> At least 8 characters with a number or symbol
                </span>
                <span className={hasCaseMix ? 'validation-item valid' : 'validation-item'}>
                  <CheckIcon met={hasCaseMix} /> Uppercase and lowercase letter mix
                </span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? <span className="btn-spinner" aria-hidden="true" /> : null}
              {submitting ? 'Creating account...' : 'Create Account'}
              {!submitting && <span>→</span>}
            </button>
          </form>
        </div>

        <div className="signup-footer-note">© 2026 SwiftCart. All rights reserved.</div>
      </div>
    </div>
  );
}