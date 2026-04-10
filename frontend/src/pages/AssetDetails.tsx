import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AssetDetails.module.css';
import { buildApiUrl } from '../lib/api';

interface Asset {
  _id: string;
  name: string;
  location: string;
  price_per_hour: number;
  deposit_amount: number;
  status: string;
  description?: string;
  imageUrl?: string;
  category_id?: {
    _id: string;
    name: string;
  };
}

export function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/assets/${id}`));
        if (!res.ok) {
          if (res.status === 404) {
            setError('Asset not found');
          } else {
            setError('Failed to load asset details');
          }
          return;
        }
        const data = await res.json();
        setAsset(data);
      } catch (err) {
        setError('Unable to connect to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'available': return '✅ Available Now';
      case 'rented': return '🔒 Currently Rented';
      case 'maintenance': return '🔧 Under Maintenance';
      default: return '⚠️ Unavailable';
    }
  };

  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className={styles.loadingPulse}>Loading asset details...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
        <h2>{error || 'Asset not found'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.detailContainer}>
        <div className={styles.imageSection}>
          {asset.imageUrl ? (
            <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius-xl)' }} />
          ) : (
            '📦'
          )}
        </div>

        <div className={styles.infoSection}>
          {asset.category_id && (
            <span className={styles.categoryBadge}>{asset.category_id.name}</span>
          )}
          <h1 className={styles.title}>{asset.name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>📍 {asset.location}</span>
            <span className={styles.metaItem}>{statusLabel(asset.status)}</span>
          </div>

          {asset.description && (
            <p className={styles.description}>
              {asset.description}
            </p>
          )}

          <div className={styles.pricingCard}>
            <div className={styles.priceRow}>
              <span>Rental Rate (per hour)</span>
              <span className={styles.priceValue}>${asset.price_per_hour.toFixed(2)}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Refundable Deposit</span>
              <span className={styles.priceValue}>${asset.deposit_amount.toFixed(2)}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Due Today</span>
              <span>${(asset.price_per_hour + asset.deposit_amount).toFixed(2)}</span>
            </div>
          </div>

          <button
            className={`btn btn-primary ${styles.actionBtn}`}
            disabled={asset.status !== 'available'}
            onClick={() => navigate(`/checkout/${asset._id}`)}
          >
            {asset.status === 'available' ? 'Proceed to Checkout' : statusLabel(asset.status)}
          </button>
        </div>
      </div>
    </div>
  );
}
