import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Home as HomeIcon, User, LogOut } from 'lucide-react';
import '../Styles/Home.css';
import SwiftPic from '../assets/bgremovedswiftcart.png';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <header className="home-navbar">
        <div className="nav-content">
          <Link to="/" className="brand-logo-wrap">
            <img src={SwiftPic} alt="SwiftCart Logo" className="home-logo-img" />
          </Link>
        </div>
      </header>

      <main className="home-main" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>User Profile</h2>
        
        {user ? (
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#EF9F27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{user.fullName || user.userName || 'SwiftCart User'}</h3>
                <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong>Username:</strong> {user.userName || 'N/A'}</div>
              <div><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</div>
              <div><strong>Role:</strong> {user.role || 'Customer'}</div>
            </div>

            <button 
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '25px', background: '#DC2626', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <p>Loading profile information...</p>
        )}
      </main>

      <nav className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-item">
          <HomeIcon size={20} />
          <span>Home</span>
        </Link>
        <Link to="/search" className="mobile-nav-item">
          <Search size={20} />
          <span>Search</span>
        </Link>
        <Link to="/cart" className="mobile-nav-item cart-mobile-anchor">
          <ShoppingCart size={20} />
          <span>Cart</span>
        </Link>
        <Link to="/profile" className="mobile-nav-item active">
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}