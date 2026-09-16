import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading your orders...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <Link to="/home" style={{ textDecoration: 'none', color: '#10B981', fontWeight: '600' }}>← Back to Store</Link>
      <h1 style={{ marginTop: '20px', color: '#0F172A' }}>Your Order History</h1>

      {error && <p style={{ color: '#DC2626' }}>{error}</p>}

      {orders.length === 0 ? (
        <p style={{ color: '#64748B', marginTop: '20px' }}>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Order ID: {order._id}</span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                  Total: ₦{Number(order.totalAmount).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: order.status === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                  color: order.status === 'Paid' ? '#166534' : '#92400E'
                }}>
                  {order.status}
                </span>
              </div>
            </div>

            <div>
              {order.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155', marginBottom: '6px' }}>
                  <span>{item.productId?.title || 'Product unavailable'} (x{item.quantity})</span>
                  <span>₦{((item.productId?.price || 0) * item.quantity).toLocaleString('en-NG', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}