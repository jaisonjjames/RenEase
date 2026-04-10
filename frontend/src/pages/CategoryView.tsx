import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CategoryView.module.css';

interface Asset {
  _id: string;
  name: string;
  location: string;
  price_per_hour: number;
  status: string;
}

export function CategoryView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch for assets
    setTimeout(() => {
      setAssets([
        { _id: 'a1', name: 'Premium Recliner Chair', location: 'South Beach - Section B', price_per_hour: 15, status: 'available' },
        { _id: 'a2', name: 'Standard Beach Chair', location: 'South Beach - Section C', price_per_hour: 10, status: 'available' },
        { _id: 'a3', name: 'Luxury Cabana Chair', location: 'Miami Beach - Section A', price_per_hour: 25, status: 'rented' }
      ]);
      setLoading(false);
    }, 600);
  }, [slug]);

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <h1 className={styles.title}>{slug?.replace('-', ' ').toUpperCase()}</h1>
        <p className="text-muted">Select an item to view details and rent.</p>
      </div>

      {loading ? (
        <p>Loading assets...</p>
      ) : (
        <div className={styles.assetGrid}>
          {assets.map((asset) => (
            <div key={asset._id} className={styles.assetCard}>
              <div className={styles.imagePlaceholder}>
                {slug?.includes('umbrella') ? '⛱️' : '🪑'}
              </div>
              <div className={styles.content}>
                <h3 className={styles.assetName}>{asset.name}</h3>
                <div className={styles.location}>📍 {asset.location}</div>
                
                <div className={styles.pricing}>
                  <div className={styles.price}>
                    ${asset.price_per_hour}<span>/hr</span>
                  </div>
                  <button 
                    className="btn btn-primary"
                    disabled={asset.status !== 'available'}
                    onClick={() => navigate(`/asset/${asset._id}`)}
                  >
                    {asset.status === 'available' ? 'Rent Now' : 'Currently Rented'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
