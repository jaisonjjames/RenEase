import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock
  const total = 35.00;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Stripe payment and backend processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 1500);
  };

  if (success) {
    return (
      <div className={styles.successOverlay}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.successTitle}>Payment Successful!</h2>
        <p>Your item is unlocked and ready to use.</p>
        <p className="text-muted" style={{marginTop: '1rem'}}>Redirecting home...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className={styles.checkoutContainer}>
        <h1 className={styles.title}>Guest Checkout</h1>
        
        <div className={styles.summary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryRow}>
            <span>Premium Recliner Chair (1hr)</span>
            <span>$15.00</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Refundable Deposit</span>
            <span>$20.00</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total to Pay</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" className={styles.input} required placeholder="John Doe" />
          </div>
          <div className={styles.formGroup}>
            <label>Mobile Number (For Alerts & Returns)</label>
            <input type="tel" className={styles.input} required placeholder="+1 (555) 000-0000" />
          </div>
          
          <div className={styles.formGroup}>
            <label>Card Information</label>
            <div className={styles.input} style={{ color: 'var(--text-muted)' }}>
              💳 4242 4242 4242 4242 &nbsp;&nbsp;&nbsp; 12/26 &nbsp;&nbsp;&nbsp; 123
            </div>
            <small style={{ color: 'var(--text-muted)' }}>Mock payment interface for phase 1 validation</small>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.payBtn}`} disabled={loading}>
            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
