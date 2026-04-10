import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Checkout.module.css';
import { buildApiUrl } from '../lib/api';

interface Asset {
  _id: string;
  name: string;
  location: string;
  price_per_hour: number;
  deposit_amount: number;
  status: string;
  imageUrl?: string;
}

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Auto-fill from logged-in user profile
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
    }
    if (user && token) {
      // Fetch phone from profile
      fetch(buildApiUrl('/api/users/profile'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.phone) setPhone(data.phone);
        })
        .catch(() => {});
    }
  }, [user, token]);

  // Fetch asset details for order summary
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/assets/${id}`));
        if (!res.ok) {
          setError('Asset not found');
          return;
        }
        const data = await res.json();
        if (data.status !== 'available') {
          setError('This asset is no longer available for rent');
          return;
        }
        setAsset(data);
      } catch (err) {
        setError('Unable to connect to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;

    setSubmitting(true);
    setError('');

    try {
      // Step 1: Create rental
      const rentalRes = await fetch(buildApiUrl('/api/rentals'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: asset._id,
          user_id: user?.id || undefined,
          user_info: {
            name: fullName,
            phone: phone,
            email: user?.email
          }
        })
      });

      if (!rentalRes.ok) {
        const data = await rentalRes.json();
        throw new Error(data.error || 'Failed to create rental');
      }

      const rental = await rentalRes.json();

      // Step 2: Confirm payment (simulated)
      const confirmRes = await fetch(buildApiUrl(`/api/rentals/${rental._id}/confirm`), {
        method: 'PATCH'
      });

      if (!confirmRes.ok) {
        throw new Error('Payment confirmation failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(user ? '/profile' : '/');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.successOverlay}>
        <div className={styles.successIcon}>🎉</div>
        <h2 className={styles.successTitle}>Payment Successful!</h2>
        <p>Your item is unlocked and ready to use.</p>
        <p className="text-muted" style={{ marginTop: '1rem' }}>
          Redirecting {user ? 'to your profile' : 'home'}...
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (error && !asset) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
        <h2>{error}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  if (!asset) return null;

  const total = asset.price_per_hour + asset.deposit_amount;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className={styles.checkoutContainer}>
        <h1 className={styles.title}>{user ? 'Checkout' : 'Guest Checkout'}</h1>

        <div className={styles.summary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryRow}>
            <span>{asset.name} (1hr)</span>
            <span>${asset.price_per_hour.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Refundable Deposit</span>
            <span>${asset.deposit_amount.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total to Pay</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              className={styles.input}
              required
              placeholder="John Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Mobile Number (For Alerts & Returns)</label>
            <input
              type="tel"
              className={styles.input}
              required
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Card Information</label>
            <div className={styles.input} style={{ color: 'var(--text-muted)' }}>
              💳 4242 4242 4242 4242 &nbsp;&nbsp;&nbsp; 12/26 &nbsp;&nbsp;&nbsp; 123
            </div>
            <small style={{ color: 'var(--text-muted)' }}>Simulated payment — Stripe integration coming soon</small>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.payBtn}`} disabled={submitting}>
            {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
