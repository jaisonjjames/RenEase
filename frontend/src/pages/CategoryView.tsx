import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './CategoryView.module.css';
import { buildApiUrl } from '../lib/api';

interface Asset {
  _id: string;
  name: string;
  location: string;
  price_per_hour: number;
  status: string;
  imageUrl?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export function CategoryView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryAndAssets = async () => {
      try {
        setLoading(true);
        setError('');

        // Step 1: Resolve slug to category
        const catRes = await fetch(buildApiUrl(`/api/categories/${slug}`));
        if (!catRes.ok) {
          setError('Category not found');
          setLoading(false);
          return;
        }
        const catData: Category = await catRes.json();
        setCategory(catData);

        // Step 2: Fetch assets for this category
        const assetRes = await fetch(buildApiUrl(`/api/assets?category_id=${catData._id}`));
        if (assetRes.ok) {
          setAssets(await assetRes.json());
        }
      } catch (err) {
        setError('Unable to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndAssets();
  }, [slug]);

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <h1 className={styles.title}>{category?.name || slug?.replace('-', ' ').toUpperCase()}</h1>
        <p className="text-muted">
          {category?.description || 'Select an item to view details and rent.'}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading assets...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h3>{error}</h3>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
            ← Back to Home
          </button>
        </div>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-color-alt)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
          No assets available in this category right now.
        </div>
      ) : (
        <div className={styles.assetGrid}>
          {assets.map((asset) => (
            <div key={asset._id} className={styles.assetCard}>
              <div className={styles.imagePlaceholder}>
                {asset.imageUrl ? (
                  <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '📦'
                )}
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
