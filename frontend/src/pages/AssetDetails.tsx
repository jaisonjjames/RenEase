import { useParams, useNavigate } from 'react-router-dom';
import styles from './AssetDetails.module.css';

export function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for phase 1 demo
  const asset = {
    _id: id,
    name: 'Premium Recliner Chair',
    location: 'South Beach - Section B',
    price_per_hour: 15,
    deposit_amount: 20,
    status: 'available',
    description: 'Experience ultimate comfort with our premium recliner beach chair. Adjustable to 5 positions, built-in cup holder, and a small cold storage pouch. Perfect for tanning or reading a book under the sun.'
  };

  return (
    <div className="container animate-fade-in">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className={styles.detailContainer}>
        <div className={styles.imageSection}>
          🪑
        </div>
        
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{asset.name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>📍 {asset.location}</span>
            <span className={styles.metaItem}>✅ Available Now</span>
          </div>

          <p className={styles.description}>
            {asset.description}
          </p>

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
            onClick={() => navigate(`/checkout/${asset._id}`)}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
