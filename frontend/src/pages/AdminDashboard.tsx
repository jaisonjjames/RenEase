import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDashboard.module.css';

export function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Form states
  const [showForm, setShowForm] = useState<'asset' | 'category' | 'user' | null>(null);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchData = async () => {
    try {
      if (activeTab === 'category' || activeTab === 'inventory') {
        const catRes = await fetch('http://localhost:5001/api/categories');
        setCategories(await catRes.json());
      }
      if (activeTab === 'inventory') {
        const asRes = await fetch('http://localhost:5001/api/assets');
        setAssets(await asRes.json());
      }
      if (activeTab === 'users' && user?.role === 'superadmin') {
        const userRes = await fetch('http://localhost:5001/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUsers(await userRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSaveCategory = async (e: any) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      slug: e.target.slug.value,
      description: e.target.description.value,
      imageUrl: e.target.imageUrl.value
    };
    
    const url = editItem ? `http://localhost:5001/api/categories/${editItem._id}` : 'http://localhost:5001/api/categories';
    const method = editItem ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    
    setShowForm(null);
    setEditItem(null);
    fetchData();
  };

  const handleSaveAsset = async (e: any) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      category_id: e.target.category_id.value,
      location: e.target.location.value,
      price_per_hour: Number(e.target.price_per_hour.value),
      deposit_amount: Number(e.target.deposit_amount.value),
      imageUrl: e.target.imageUrl.value,
      status: e.target.status.value
    };

    const url = editItem ? `http://localhost:5001/api/assets/${editItem._id}` : 'http://localhost:5001/api/assets';
    const method = editItem ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });

    setShowForm(null);
    setEditItem(null);
    fetchData();
  };

  const handleAddUser = async (e: any) => {
    e.preventDefault();
    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      phone: e.target.phone.value,
      role: e.target.role.value
    };

    await fetch('http://localhost:5001/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });

    setShowForm(null);
    fetchData();
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className={styles.adminContainer}>
        <div className={styles.header}>
          <h2>Admin Dashboard</h2>
          {user && (
            <div style={{ color: 'var(--text-muted)' }}>Logged in as: <strong>{user.name} ({user.role})</strong></div>
          )}
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`${styles.tab} ${activeTab === 'inventory' ? styles.active : ''}`} onClick={() => setActiveTab('inventory')}>Assets</button>
          <button className={`${styles.tab} ${activeTab === 'category' ? styles.active : ''}`} onClick={() => setActiveTab('category')}>Categories</button>
          {user?.role === 'superadmin' && (
            <button className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className={styles.statGrid}>
            <div className={styles.statCard}><div className={styles.statValue}>12</div><div className={styles.statLabel}>Active Rentals</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>$480</div><div className={styles.statLabel}>Revenue Today</div></div>
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'inventory' && !showForm && (
          <>
            <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => setShowForm('asset')}>+ Add Asset</button>
            <table className={styles.table}>
              <thead><tr><th>Image</th><th>Name</th><th>Location</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a._id}>
                    <td>{a.imageUrl ? <img src={a.imageUrl} alt={a.name} style={{width: 50, height: 50, objectFit: 'cover'}}/> : '🖼️'}</td>
                    <td>{a.name}</td>
                    <td>{a.location}</td>
                    <td>${a.price_per_hour}/hr</td>
                    <td><span className={`${styles.status} ${styles[a.status]}`}>{a.status}</span></td>
                    <td>
                      <button className="btn btn-secondary" style={{padding: '0.25rem 0.5rem', marginRight: '0.5rem'}} onClick={() => { setEditItem(a); setShowForm('asset'); }}>Edit</button>
                      <button className="btn" style={{padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#b91c1c'}} onClick={async () => {
                        await fetch(`http://localhost:5001/api/assets/${a._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`} });
                        fetchData();
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'category' && !showForm && (
          <>
            <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => setShowForm('category')}>+ Add Category</button>
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.slug}</td>
                    <td>{c.description}</td>
                    <td>
                      <button className="btn btn-secondary" style={{padding: '0.25rem 0.5rem', marginRight: '0.5rem'}} onClick={() => { setEditItem(c); setShowForm('category'); }}>Edit</button>
                      <button className="btn" style={{padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#b91c1c'}} onClick={async () => {
                        await fetch(`http://localhost:5001/api/categories/${c._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`} });
                        fetchData();
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && !showForm && (
          <>
            <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => setShowForm('user')}>+ Add Staff/Admin</button>
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={styles.status}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* FORMS */}
        {showForm === 'category' && (
          <form onSubmit={handleSaveCategory} style={{ maxWidth: '500px' }}>
            <h3>{editItem ? 'Edit Category' : 'Add Category'}</h3>
            <div style={{ marginBottom: '1rem' }}><label>Name</label><input type="text" name="name" defaultValue={editItem?.name} required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Slug (URL friendly)</label><input type="text" name="slug" defaultValue={editItem?.slug} required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Description</label><input type="text" name="description" defaultValue={editItem?.description} style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Image URL</label><input type="url" name="imageUrl" defaultValue={editItem?.imageUrl} style={{ width: '100%', padding: '0.5rem' }}/></div>
            <button type="submit" className="btn btn-primary">Save Category</button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '1rem' }} onClick={() => {setShowForm(null); setEditItem(null);}}>Cancel</button>
          </form>
        )}

        {showForm === 'asset' && (
          <form onSubmit={handleSaveAsset} style={{ maxWidth: '500px' }}>
            <h3>{editItem ? 'Edit Asset' : 'Add Asset'}</h3>
            <div style={{ marginBottom: '1rem' }}><label>Name</label><input type="text" name="name" defaultValue={editItem?.name} required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Category</label>
              <select name="category_id" defaultValue={editItem?.category_id?._id || editItem?.category_id} required style={{ width: '100%', padding: '0.5rem' }}>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}><label>Location</label><input type="text" name="location" defaultValue={editItem?.location} required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Price Per Hour</label><input type="number" name="price_per_hour" defaultValue={editItem?.price_per_hour} required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Deposit Amount</label><input type="number" name="deposit_amount" defaultValue={editItem?.deposit_amount} required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Status</label>
              <select name="status" defaultValue={editItem?.status || 'available'} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}><label>Image URL</label><input type="url" name="imageUrl" defaultValue={editItem?.imageUrl} style={{ width: '100%', padding: '0.5rem' }}/></div>
            <button type="submit" className="btn btn-primary">Save Asset</button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '1rem' }} onClick={() => {setShowForm(null); setEditItem(null);}}>Cancel</button>
          </form>
        )}

        {showForm === 'user' && (
          <form onSubmit={handleAddUser} style={{ maxWidth: '500px' }}>
            <h3>Add New User/Admin</h3>
            <div style={{ marginBottom: '1rem' }}><label>Name</label><input type="text" name="name" required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Email</label><input type="email" name="email" required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Password</label><input type="password" name="password" required style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Phone</label><input type="tel" name="phone" style={{ width: '100%', padding: '0.5rem' }}/></div>
            <div style={{ marginBottom: '1rem' }}><label>Role</label>
              <select name="role" required style={{ width: '100%', padding: '0.5rem' }}>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save User</button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '1rem' }} onClick={() => setShowForm(null)}>Cancel</button>
          </form>
        )}

      </div>
    </div>
  );
}
