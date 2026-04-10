import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './Search.module.css';
import { buildApiUrl } from '../lib/api';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('cat') || 'all';

  const [inputQuery, setInputQuery] = useState(query);
  const [inputCategory, setInputCategory] = useState(categoryId);

  useEffect(() => {
    fetch(buildApiUrl('/api/categories')).then(res => res.json()).then(setCategories);
  }, []);

  useEffect(() => {
    let url = `${buildApiUrl('/api/assets')}?`;
    if (query) url += `search=${encodeURIComponent(query)}&`;
    if (categoryId && categoryId !== 'all') url += `category_id=${categoryId}`;

    fetch(url).then(res => res.json()).then(setAssets);
  }, [query, categoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: inputQuery, cat: inputCategory });
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      
      <form className={styles.searchBar} onSubmit={handleSearch}>
        <select 
          className={styles.categorySelect} 
          value={inputCategory}
          onChange={e => setInputCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input 
          type="text" 
          placeholder="Search for chairs, umbrellas, events..." 
          className={styles.searchInput}
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
        />
        <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>
          Search
        </button>
      </form>

      <h2 className="section-title">Search Results</h2>
      
      {assets.length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', marginTop: '3rem' }}>No items found matching your filters.</p>
      ) : (
        <div className={styles.resultsGrid}>
          {assets.map((asset) => (
            <div key={asset._id} className="assetCard" style={{ background: 'var(--bg-color-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {asset.imageUrl ? <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <span style={{fontSize: '4rem'}}>📦</span>}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{asset.name}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>📍 {asset.location}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 'bold' }}>${asset.price_per_hour}<span>/hr</span></div>
                  <Link to={`/asset/${asset._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
