import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ShoppingCart, Search, Plus, Minus, Home as HomeIcon, User, Package, Check, X } from 'lucide-react';
import '../Styles/Home.css';
import SwiftPic from '../assets/bgremovedswiftcart.png';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await api.get('/products');
        const productData = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.products || [];
        setProducts(productData);

        if (token) {
          const cartRes = await api.get('/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const cartItems = cartRes.data.cart?.items || [];
          const cartMap = {};
          cartItems.forEach(item => {
            // Bulletproof ID resolution
            const prodId = item.productId?._id || item.productId?.id || item.productId;
            if (prodId) {
              cartMap[prodId] = item.quantity;
            }
          });
          setCart(cartMap);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
        setError('Failed to load store catalog.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleUpdateQuantity = async (productId, delta, productName) => {
    if (!token) {
      navigate('/login');
      return;
    }

    const currentQty = cart[productId] || 0;
    const newQty = currentQty + delta;

    try {
      if (newQty <= 0) {
        await api.delete(`/cart/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
        showToast(`Removed ${productName} from cart`);
      } else {
        await api.put(
          '/cart',
          { productId, quantity: newQty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCart((prev) => ({ ...prev, [productId]: newQty }));
        showToast(`Updated ${productName} quantity to ${newQty}`);
      }
    } catch (err) {
      showToast('Failed to update cart');
    }
  };
const handleAddToCart = async (productId, productName) => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Ensure we have a valid string ID
    const cleanId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
    if (!cleanId) {
      showToast('Error: Invalid product ID');
      return;
    }

    try {
      // Backend expects a POST request to add items to the cart
      const response = await api.post(
        '/cart',
        { productId: cleanId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Parse the updated cart response from the server and sync state immediately
      const cartItems = response.data.cart?.items || [];
      const cartMap = {};
      cartItems.forEach(item => {
        const prodId = item.productId?._id || item.productId?.id || item.productId;
        if (prodId) {
          cartMap[prodId] = item.quantity;
        }
      });
      
      setCart(cartMap);
      showToast(`Added ${productName} to cart`);
    } catch (err) {
      console.error('Add to cart error details:', err.response?.data);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to add to cart';
      showToast(serverMsg);
    }
  };
    const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCartItems = Object.values(cart).reduce((acc, qty) => acc + qty, 0);

  return (
    <div className="home-container">
      {toastMessage && (
        <div className="toast-notification" role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="home-navbar">
        <div className="nav-content">
          <Link to="/" className="brand-logo-wrap">
            <img src={SwiftPic} alt="SwiftCart Logo" className="home-logo-img" />
          </Link>

          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products, brands and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="nav-actions">
            <Link to="/cart" className="cart-icon-btn" aria-label="Cart">
              <ShoppingCart size={22} />
              {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
            </Link>
            <Link to="/profile" className="profile-icon-btn" aria-label="Profile">
              <User size={22} />
            </Link>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="category-scroll-wrapper">
          <div className="category-pills">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-header">
          <h2>{selectedCategory} Products</h2>
          <p>Explore high-quality items delivered instantly to your door.</p>
        </div>

        {error && <div className="error-catalog"><p>{error}</p></div>}

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="product-card skeleton-card">
                <div className="skeleton-image shimmer" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-catalog">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const productId = product._id || product.id;
              const qty = cart[productId] || 0;

              return (
                <div key={productId} className="product-card">
                  <div className="product-image-wrap" onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                    <img src={product.imageUrl || product.image} alt={product.title} loading="lazy" />
                    {product.category && <span className="product-category-tag">{product.category}</span>}
                  </div>
                  <div className="product-info">
                    <h4 onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>{product.title}</h4>
                    <div className="product-price">₦{Number(product.price).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    
                    {qty === 0 ? (
                      <button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(productId, product.title)}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="quantity-stepper">
                        <button
                          className="stepper-btn"
                          onClick={() => handleUpdateQuantity(productId, -1, product.title)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="stepper-count">{qty}</span>
                        <button
                          className="stepper-btn"
                          onClick={() => handleUpdateQuantity(productId, 1, product.title)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '25px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            {selectedProduct.imageUrl && <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}
            <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>{selectedProduct.category}</span>
            <h2 style={{ margin: '10px 0', fontSize: '20px', color: '#0F172A' }}>{selectedProduct.title}</h2>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981', marginBottom: '15px' }}>₦{Number(selectedProduct.price).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', maxHeight: '150px', overflowY: 'auto' }}>{selectedProduct.description}</p>
            <button 
              onClick={() => {
                handleAddToCart(selectedProduct._id || selectedProduct.id, selectedProduct.title);
                setSelectedProduct(null);
              }}
              style={{ width: '100%', marginTop: '20px', background: '#10B981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <nav className="mobile-bottom-nav">
        <Link to="/home" className="mobile-nav-item active"><HomeIcon size={20} /><span>Home</span></Link>
        <Link to="/search" className="mobile-nav-item"><Search size={20} /><span>Search</span></Link>
        <Link to="/cart" className="mobile-nav-item cart-mobile-anchor"><ShoppingCart size={20} /><span>Cart</span>{totalCartItems > 0 && <span className="mobile-cart-badge">{totalCartItems}</span>}</Link>
        <Link to="/profile" className="mobile-nav-item"><User size={20} /><span>Profile</span></Link>
      </nav>
    </div>
  );
}