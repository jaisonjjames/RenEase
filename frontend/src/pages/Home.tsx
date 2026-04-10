import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
}

export function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestAssets, setLatestAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchNavigation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cat = formData.get('cat');
    navigate(`/search?q=${searchQuery}&cat=${cat}`);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 3) {
        try {
          const res = await fetch(`http://localhost:5001/api/assets?search=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions([]);
      }
    };
    
    // Simple debounce
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    // In a real app, this would fetch from /api/categories
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('http://localhost:5001/api/categories'),
          fetch('http://localhost:5001/api/assets?sort=latest&limit=10')
        ]);
        
        if (catRes.ok) {
          setCategories(await catRes.json());
        }
        if (prodRes.ok) {
          setLatestAssets(await prodRes.json());
        }
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEmojiForCategory = (name: string) => {
    if (name.toLowerCase().includes('beach')) return '🪑';
    if (name.toLowerCase().includes('umbrella')) return '⛱️';
    if (name.toLowerCase().includes('event')) return '🎉';
    return '📦';
  }

  return (
    <div className="container animate-fade-in">
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Rent Exactly What You Need.</h1>
        <p className={styles.heroSubtitle}>
          From beach essentials to event equipment, browse our categories and secure your rental in seconds.
        </p>

        <form 
          onSubmit={handleSearchNavigation} 
          style={{ position: 'relative', display: 'flex', background: 'var(--bg-color-alt)', padding: '0.5rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', maxWidth: '800px', margin: '2rem auto 0 auto', border: '1px solid var(--border-color)', alignItems: 'center' }}
        >
          <select name="cat" style={{ padding: '1rem', border: 'none', background: 'transparent', fontSize: '1rem', borderRight: '1px solid var(--border-color)', width: '200px', color: 'var(--text-dark)' }}>
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              name="q"
              placeholder="Search for chairs, umbrellas, events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '1rem 1.5rem', border: 'none', background: 'transparent', fontSize: '1rem', outline: 'none' }}
              autoComplete="off"
            />
            {suggestions.length > 0 && searchQuery.length >= 3 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'var(--bg-color-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', zIndex: 50, marginTop: '0.5rem', overflow: 'hidden' }}>
                {suggestions.map(s => (
                  <div 
                    key={s._id} 
                    onClick={() => navigate(`/asset/${s._id}`)}
                    style={{ padding: '1rem 1.5rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span><strong>{s.name}</strong></span>
                    <span style={{ color: 'var(--text-muted)' }}>📍{s.location}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Search
          </button>
        </form>
      </section>

      <h2 className="section-title">Explore Categories</h2>
      
      {loading ? (
        <div>Loading categories...</div>
      ) : (
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div 
              key={cat._id} 
              className={styles.categoryCard}
              onClick={() => navigate(`/category/${cat.slug}`)}
            >
              <div className={styles.iconWrapper}>
                {getEmojiForCategory(cat.name)}
              </div>
              <h3 className={styles.categoryTitle}>{cat.name}</h3>
              <p className={styles.categoryDescription}>{cat.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* LATEST PRODUCTS SECTION */}
      <div style={{ marginTop: '5rem', marginBottom: '4rem' }}>
        <h2 className="section-title">Latest Arrivals</h2>
        {loading ? (
          <div>Loading latest items...</div>
        ) : latestAssets.length === 0 ? (
          <p className="text-muted">No items available right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {latestAssets.map((asset) => (
              <div 
                key={asset._id}
                onClick={() => navigate(`/asset/${asset._id}`)}
                style={{ background: 'var(--bg-color-alt)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', cursor: 'pointer', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)', e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
              >
                <div style={{ height: '180px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {asset.imageUrl ? <img src={asset.imageUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <span style={{fontSize: '3rem'}}>📦</span>}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{asset.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>📍 {asset.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontWeight: 'bold' }}>${asset.price_per_hour}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/hr</span></div>
                    <span style={{ padding: '0.25rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Rent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
