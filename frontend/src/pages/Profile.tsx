import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/users/profile', {
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
    fetchProfile();
  }, [user, navigate, token]);

  const handleLogout = () => {
    logout();
    navigate('/');
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
      <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-color-alt)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
        You have no active or past rentals attached to this profile. (Mock Data)
      </div>
    </div>
  );
}
