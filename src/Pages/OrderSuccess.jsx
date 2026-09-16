import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import '../Styles/OrderSuccess.css';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying your payment...');
  const [isSuccess, setIsSuccess] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fallback to check both Paystack reference keys
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    
    if (!reference) {
      setStatusMessage('No transaction reference found.');
      setIsSuccess(false);
      return;
    }

    const verifyTransaction = async () => {
      try {
        const response = await api.get(`/orders/verify?reference=${reference}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setIsSuccess(true);
        setStatusMessage(response.data.message || 'Payment verified successfully!');
      } catch (err) {
        setIsSuccess(false);
        setStatusMessage(err.response?.data?.message || 'Payment verification failed.');
      }
    };

    verifyTransaction();
  }, [searchParams, token]);

  return (
    <div className={`order-success-container ${isSuccess === false ? 'order-error' : ''} ${isSuccess === null ? 'order-loading' : ''}`}>
      <div className="order-success-emoji">
        {isSuccess ? '🎉' : isSuccess === false ? '❌' : <package/>}
      </div>
      <h1 className="order-success-heading">
        {isSuccess ? 'Order Placed Successfully!' : isSuccess === false ? 'Order Failed' : 'Processing Payment'}
      </h1>
      <p className="order-success-message">{statusMessage}</p>
      <Link to="/home" className="order-success-link">
        Continue Shopping
      </Link>
    </div>
  );
}