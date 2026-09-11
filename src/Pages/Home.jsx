import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { ShoppingCart, Search, Plus, Minus, Home as HomeIcon, User, Package, Check } from 'lucide-react';
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
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        const productData = Array.isArray(response.data) 
          ? response.data 
          : response.data.products || response.data.data || [];
        setProducts(productData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products from the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleUpdateQuantity = (productId, delta, productName) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        showToast(`Removed ${productName} from cart`);
        return updated;
      }

      showToast(`Updated ${productName} quantity to ${newQty}`);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = async (productId, productName) => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(
        '/cart',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart((prev) => ({ ...prev, [productId]: 1 }));
      showToast(`Added ${productName} to cart`);
    } catch (err) {
      showToast(`Failed to add ${productName} to cart`);
      console.error('Add to cart error:', err);
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

        {error && (
          <div className="error-catalog">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="product-card skeleton-card">
                <div className="skeleton-image shimmer" />
                <div className="skeleton-line shimmer short" />
                <div className="skeleton-line shimmer long" />
              </div>
            ))}
          </div>
        ) : !error && filteredProducts.length === 0 ? (
          <div className="empty-catalog">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const productId = product.id || product._id;
              const qty = cart[productId] || 0;

              return (
                <div key={productId} className="product-card">
                  <div className="product-image-wrap">
                    <img src={product.imageUrl || product.image} alt={product.title} loading="lazy" />
                    {product.category && <span className="product-category-tag">{product.category}</span>}
                  </div>
                  <div className="product-info">
                    <h4>{product.title}</h4>
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
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="stepper-count">{qty}</span>
                        <button
                          className="stepper-btn"
                          onClick={() => handleUpdateQuantity(productId, 1, product.title)}
                          aria-label="Increase quantity"
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

      <nav className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-item active">
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
          {totalCartItems > 0 && <span className="mobile-cart-badge">{totalCartItems}</span>}
        </Link>
        <Link to="/profile" className="mobile-nav-item">
          <User size={20} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}