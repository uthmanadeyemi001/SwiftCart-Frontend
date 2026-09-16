import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Package, CheckSquare, Square, ArrowLeft } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  // Track checked/completed items locally per order for fulfillment tracking
  const [checkedItems, setCheckedItems] = useState({});
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await api.get('/orders/admin/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unauthorized or failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await api.patch(
        `/orders/admin/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state instantly with response from server
      setOrders(prev =>
        prev.map(order => (order._id === orderId ? response.data.order : order))
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleItemCheck = (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px', fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="green-spinner" style={{ margin: '0 auto 15px auto' }}></div>
        <p style={{ color: '#64748B' }}>Loading platform orders...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/home" style={{ textDecoration: 'none', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <span style={{ background: '#0F172A', color: '#FFF', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} /> Admin Command Center
        </span>
      </div>

      <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Admin Order Management</h1>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Review customer purchases, tick off packed items, and update fulfillment statuses.</p>

      {error && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
          <Package size={48} style={{ color: '#94A3B8', marginBottom: '10px' }} />
          <h3 style={{ color: '#0F172A', fontSize: '18px' }}>No orders found</h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Platform transactions will appear here once customers place orders.</p>
        </div>
      ) : (
        orders.map((order) => {
          const isUpdating = updatingId === order._id;
          const statusBg = order.status === 'Delivered' ? '#DCFCE7' : order.status === 'Shipped' ? '#E0F2FE' : order.status === 'Paid' ? '#FEF3C7' : '#F1F5F9';
          const statusColor = order.status === 'Delivered' ? '#166534' : order.status === 'Shipped' ? '#0369A1' : order.status === 'Paid' ? '#92400E' : '#475569';

          return (
            <div key={order._id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              
              {/* Order Header info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '15px', color: '#0F172A', fontWeight: '700' }}>
                    Customer: {order.userId?.fullName || 'Guest / Deleted User'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    Email: {order.userId?.email || 'N/A'} | Phone: <strong>{order.userId?.phoneNumber || 'N/A'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Order ID: {order._id} • Placed on: {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', backgroundColor: statusBg, color: statusColor }}>
                    {order.status}
                  </span>

                  {/* Dropdown Selector for Complete Status Control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Update Status:</label>
                    <select 
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: '600', color: '#0F172A', cursor: 'pointer' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items with Interactive Checkboxes */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Items to Fulfill ({order.items.reduce((sum, item) => sum + item.quantity, 0)} total units):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item, index) => {
                    const isChecked = !!checkedItems[`${order._id}-${index}`];
                    const prod = item.productId;

                    return (
                      <div 
                        key={index} 
                        onClick={() => toggleItemCheck(order._id, index)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: isChecked ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${isChecked ? '#BBF7D0' : '#E2E8F0'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: isChecked ? '#16A34A' : '#94A3B8', display: 'flex', alignItems: 'center' }}>
                            {isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: isChecked ? '#166534' : '#1E293B', textDecoration: isChecked ? 'line-through' : 'none' }}>
                            {prod?.title || 'Product unavailable'} (Qty: {item.quantity})
                          </span>
                        </div>

                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                          ₦{((prod?.price || 0) * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px', fontSize: '15px', color: '#0F172A', fontWeight: '700' }}>
                  Total Amount: ₦{Number(order.totalAmount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}