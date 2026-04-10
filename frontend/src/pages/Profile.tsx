import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';

interface RentalAsset {
  _id: string;
  name: string;
  location: string;
  price_per_hour: number;
  imageUrl?: string;
}

interface Rental {
  _id: string;
  asset_id: RentalAsset;
  status: string;
  rental_amount: number;
  deposit_amount: number;
  start_time: string;
  createdAt: string;
}

export function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/users/profile'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    const fetchRentals = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/rentals/my'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRentals(data);
        }
      } catch (err) {
        console.error("Failed to load rentals", err);
      } finally {
        setRentalsLoading(false);
      }
    };

    fetchProfile();
    fetchRentals();
  }, [user, navigate, token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active': return { background: '#dcfce7', color: '#166534' };
      case 'completed': return { background: '#dbeafe', color: '#1e40af' };
      case 'cancelled': return { background: '#fee2e2', color: '#991b1b' };
      case 'pending_payment': return { background: '#fef3c7', color: '#92400e' };
      default: return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ marginBottom: 0 }}>My Profile</h1>
        <button onClick={handleLogout} className="btn btn-secondary">Log Out</button>
      </div>

      <div style={{ background: 'var(--bg-color-alt)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <h2>{profileData?.name || user.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{profileData?.email || user.email}</p>
        <p style={{ color: 'var(--text-muted)' }}>{profileData?.phone}</p>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>My Rentals</h2>

      {rentalsLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-color-alt)', borderRadius: 'var(--border-radius-lg)', color: 'var(--text-muted)' }}>
          Loading your rentals...
        </div>
      ) : rentals.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-color-alt)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
          You have no active or past rentals. Browse our <a href="/" style={{ color: 'var(--primary)' }}>categories</a> to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rentals.map((rental) => (
            <div key={rental._id} style={{ background: 'var(--bg-color-alt)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {rental.asset_id?.imageUrl ? (
                  <img src={rental.asset_id.imageUrl} alt={rental.asset_id.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius)' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>📦</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{rental.asset_id?.name || 'Unknown Asset'}</h3>
                  <span style={{ ...statusStyle(rental.status), padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {rental.status.replace('_', ' ')}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                  📍 {rental.asset_id?.location}
                </p>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span>💰 ${rental.rental_amount.toFixed(2)}/hr + ${rental.deposit_amount.toFixed(2)} deposit</span>
                  <span>📅 {formatDate(rental.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
