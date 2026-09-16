import { useState } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Orders({ orders }) {
  const [expandedOrderIds, setExpandedOrderIds] = useState({});

  const toggleOrderDropdown = (orderId) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="empty-orders-state">
        <Package size={48} />
        <h3>No orders placed yet</h3>
        <p>Your completed transactions and active orders will show up here.</p>
        <Link to="/home" className="explore-store-btn">Explore Store</Link>
      </div>
    );
  }

  return (
    <div className="orders-accordion-list">
      {orders.map((order) => {
        const isExpanded = !!expandedOrderIds[order._id];
        const statusClass = 
          order.status === 'Delivered' ? 'status-delivered' : 
          order.status === 'Shipped' ? 'status-shipped' : 
          order.status === 'Paid' ? 'status-paid' : 'status-pending';

        return (
          <div className="order-accordion-item" key={order._id}>
            <div className="order-summary-bar" onClick={() => toggleOrderDropdown(order._id)}>
              <div className="order-meta-info">
                <span className="order-id-label">Order #{order._id.slice(-6).toUpperCase()}</span>
                <span className="order-date-text">
                  {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className="order-status-and-total">
                <span className={`order-status-pill ${statusClass}`}>{order.status}</span>
                <strong className="order-total-price">
                  ₦{Number(order.totalAmount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
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
                        <span className="item-price">
                          ₦{((prod?.price || 0) * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
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
  );
}