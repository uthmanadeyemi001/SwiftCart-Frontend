import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import '../Styles/Cart.css';

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
      console.log('Cart API Response:', response.data);
      
      // Safely catch items from any backend response shape
      const rawData = response.data;
      const items = rawData.cart?.items || rawData.items || rawData.cart || (Array.isArray(rawData) ? rawData : []);
      setCartItems(items);
    } catch (err) {
      console.error('Fetch cart error:', err);
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
        prev.map(item => {
          const productField = item.productId || item.product;
          const currentId = typeof productField === 'object' ? (productField?._id || productField?.id) : productField;
          return currentId === productId
            ? { ...item, quantity: newQuantity }
            : item;
        })
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
      setCartItems(prev => prev.filter(item => {
        const productField = item.productId || item.product;
        const currentId = typeof productField === 'object' ? (productField?._id || productField?.id) : productField;
        return currentId !== productId;
      }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart.');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const productField = item.productId || item.product;
      const product = typeof productField === 'object' ? productField : null;
      const price = product?.price || item.price || 0;
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
            {cartItems.map((item, index) => {
              const productField = item.productId || item.product;
              const product = typeof productField === 'object' ? productField : null;
              const productId = product?._id || product?.id || productField;
              if (!productId) return null;

              return (
                <article className="cart-item-row" key={productId || index}>
                  {product?.imageUrl && <img src={product.imageUrl} alt={product?.title || 'Product'} />}
                  <div className="cart-item-details">
                    <h3>{product?.title || item.title || 'Product Item'}</h3>
                    <p className="item-unit-price">
                      ₦{Number(product?.price || item.price || 0).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})} each
                    </p>
                  </div>

                  <div className="cart-item-quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(productId, item.quantity - 1)}
                      disabled={updatingId === productId}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(productId, item.quantity + 1)}
                      disabled={updatingId === productId}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    <strong>
                      ₦{((product?.price || item.price || 0) * item.quantity).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </strong>
                    <button 
                      className="remove-item-btn" 
                      onClick={() => handleRemoveItem(productId)}
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