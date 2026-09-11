import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import '../Styles/Cart.css';

// const api = axios.create({ baseURL: 'http://localhost:9000' });

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [token, navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.cart?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setUpdatingId(productId);
    try {
      await api.put(
        '/cart',
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(prev =>
        prev.map(item =>
          item.productId?._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      setError('');
    } catch (err) {
      console.error('Quantity update error:', err);
      setError(err.response?.data?.message || 'Failed to update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!productId) return;
    try {
      await api.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(prev => prev.filter(item => item.productId?._id !== productId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.productId?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const handleCheckout = async () => {
    try {
      const response = await api.post('/orders/checkout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.authorization_url) {
        if (response.data.reference) {
          localStorage.setItem('paystack_reference', response.data.reference);
        }
        window.location.href = response.data.authorization_url;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (loading) {
    return (
      <div className="cart-loading-container">
        <div className="green-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shippingFee = subtotal > 0 ? 1500 : 0;
  const totalAmount = subtotal + shippingFee;

  return (
    <main className="cart-page">
      <header className="cart-header">
        <Link to="/home" className="back-store-link">
          <ArrowLeft size={18} /> Continue Shopping
        </Link>
        <h1>Your Shopping Cart</h1>
      </header>

      {error && <p className="cart-error">{error}</p>}

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={56} />
          <h3>Your cart is empty</h3>
          <p>Explore our store and add items to your cart to get started.</p>
          <Link to="/home" className="shop-now-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const product = item.productId;
              if (!product || !product._id) return null;
              return (
                <article className="cart-item-row" key={product._id}>
                  {product.imageUrl && <img src={product.imageUrl} alt={product.title} />}
                  <div className="cart-item-details">
                    <h3>{product.title}</h3>
                    <p className="item-unit-price">
                      ₦{Number(product.price).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})} each
                    </p>
                  </div>

                  <div className="cart-item-quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(product._id, item.quantity - 1)}
                      disabled={updatingId === product._id}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(product._id, item.quantity + 1)}
                      disabled={updatingId === product._id}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    <strong>
                      ₦{(product.price * item.quantity).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </strong>
                    <button 
                      className="remove-item-btn" 
                      onClick={() => handleRemoveItem(product._id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="cart-summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span>₦{shippingFee.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Amount</span>
              <strong>₦{totalAmount.toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
            </div>
            <button type="button" className="checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout (Paystack)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}