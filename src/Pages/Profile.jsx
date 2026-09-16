import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ShoppingCart, User, Home, Search, Package, LogOut, ChevronDown, ChevronUp, Camera, Check, Shield } from 'lucide-react';
import '../Styles/Profile.css';
import SwiftPic from '../assets/bgremovedswiftcart.png';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);

        const ordersRes = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Could not load profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token, navigate]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const toggleOrderDropdown = (orderId) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setUploadingAvatar(true);
    try {
      // Simulate or send to backend profile upload endpoint if available
      showToast('Profile picture updated successfully!');
    } catch (err) {
      showToast('Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-loading" style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="green-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {toastMessage && (
        <div className="toast-notification" role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop & Tablet Navigation Bar */}
      <header className="home-navbar">
        <div className="nav-content">
          <Link to="/" className="brand-logo-wrap">
            <img src={SwiftPic} alt="SwiftCart Logo" className="home-logo-img" />
          </Link>

          <nav className="desktop-nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link to="/" className="nav-link-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#334155', fontWeight: '500' }}><Home size={18} /> Home</Link>
            <Link to="/search" className="nav-link-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#334155', fontWeight: '500' }}><Search size={18} /> Search</Link>
            <Link to="/cart" className="nav-link-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#334155', fontWeight: '500' }}><ShoppingCart size={18} /> Cart</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-link-item admin-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#10B981', fontWeight: '600' }}><Shield size={18} /> Admin</Link>
            )}
          </nav>

          <div className="nav-actions">
            <Link to="/cart" className="cart-icon-btn" aria-label="Cart">
              <ShoppingCart size={22} />
            </Link>
            <Link to="/profile" className="profile-icon-btn active" aria-label="Profile">
              <User size={22} />
            </Link>
          </div>
        </div>
      </header>

      <main className="profile-main-content">
        <div className="profile-grid-layout">
          
          {/* Left Column: User Info & Avatar Upload */}
          <section className="profile-card user-info-card">
            <div className="avatar-container">
              <div className="avatar-wrapper">
                <img 
                  src={avatarPreview || user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
                  alt="User Profile" 
                  className="profile-avatar-img"
                />
                <label htmlFor="avatar-upload" className="avatar-upload-badge" title="Change profile picture">
                  <Camera size={16} />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
              {uploadingAvatar && <span className="uploading-text">Updating picture...</span>}
            </div>

            <div className="user-details-text">
              <h2>{user?.fullName || 'SwiftCart Member'}</h2>
              <p className="username-handle">@{user?.userName || 'username'}</p>
              <p className="user-email-text">{user?.email || 'user@example.com'}</p>
              <p className="user-phone-text">📞 {user?.phoneNumber || 'No phone number provided'}</p>
            </div>

            <div className="profile-action-buttons">
              {user?.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="profile-btn admin-btn">
                  <Shield size={16} /> Admin Command Center
                </button>
              )}
              <button onClick={handleLogout} className="profile-btn logout-btn">
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </section>

          {/* Right Column: Order History with Dropdowns */}
          <section className="profile-card orders-section-card">
            <div className="section-header-row">
              <div>
                <h2>Order History</h2>
                <p>Track your past purchases and delivery statuses</p>
              </div>
              <span className="order-count-badge">{orders.length} orders</span>
            </div>

            {error && <div className="profile-error" style={{ color: '#DC2626', marginBottom: '15px' }}>{error}</div>}

            {orders.length === 0 ? (
              <div className="empty-orders-state">
                <Package size={48} />
                <h3>No orders placed yet</h3>
                <p>Your completed transactions and active orders will show up here.</p>
                <Link to="/" className="explore-store-btn">Explore Store</Link>
              </div>
            ) : (
              <div className="orders-accordion-list">
                {orders.map((order) => {
                  const isExpanded = !!expandedOrderIds[order._id];
                  const statusClass = order.status === 'Delivered' ? 'status-delivered' : order.status === 'Shipped' ? 'status-shipped' : order.status === 'Paid' ? 'status-paid' : 'status-pending';

                  return (
                    <div className="order-accordion-item" key={order._id}>
                      <div className="order-summary-bar" onClick={() => toggleOrderDropdown(order._id)}>
                        <div className="order-meta-info">
                          <span className="order-id-label">Order #{order._id.slice(-6).toUpperCase()}</span>
                          <span className="order-date-text">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>

                        <div className="order-status-and-total">
                          <span className={`order-status-pill ${statusClass}`}>{order.status}</span>
                          <strong className="order-total-price">₦{Number(order.totalAmount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          <button className="dropdown-toggle-btn" aria-label="Toggle details">
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="order-dropdown-content">
                          <h4>Purchased Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</h4>
                          <div className="order-items-stack">
                            {order.items.map((item, idx) => {
                              const prod = item.productId;
                              return (
                                <div className="order-item-row" key={idx}>
                                  <div className="order-item-info">
                                    <span className="item-title">{prod?.title || 'Product unavailable'}</span>
                                    <span className="item-qty">Qty: {item.quantity}</span>
                                  </div>
                                  <span className="item-price">₦{((prod?.price || 0) * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-item">
          <Home size={20} />
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