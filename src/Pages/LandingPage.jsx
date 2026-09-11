import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/LandingPage.css';
import SwiftPic from '../assets/bgremovedswiftcart.png'; 

export default function LandingPage() {
  return (
    <div className="landing-wrapper">
      <nav className="landing-nav">
        <div className="logo-container">
          <img src={SwiftPic} alt="SwiftCart Logo" className="nav-logo-img" />
        </div>
        <div className="nav-auth-links">
          <Link to="/login" className="nav-signin-link">Sign In</Link>
          <Link to="/signup" className="nav-getstarted-btn">Get Started</Link>
        </div>
      </nav>

      <section className="hero-container">
        <div className="hero-content">
          <span className="hero-badge">⚡ Next-Gen E-Commerce</span>
          <h1>Fast & Easy Shopping Experience</h1>
          <p>
            Discover top-quality merchandise with a seamless checkout process. Enjoy bank-grade security, instant delivery, and absolute shopping ease.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn-signup">Create Account</Link>
            <Link to="/login" className="btn-login">Explore Store</Link>
          </div>
        </div>
        <div className="hero-visual-card">
          <img src={SwiftPic} alt="SwiftCart Brand Showcase" className="hero-brand-img" />
          <div className="floating-metric-badge">
            {/* <span className="metric-dot"></span> 100% Secure & Trusted */}
          </div>
        </div>
      </section>
    </div>
  );
}