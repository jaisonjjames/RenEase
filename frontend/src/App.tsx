import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { CategoryView } from './pages/CategoryView';
import { AssetDetails } from './pages/AssetDetails';
import { Checkout } from './pages/Checkout';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import './App.css';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function Navigation() {
  const { user } = useAuth();
  
  return (
    <header className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🏖️</span>
          <span className="logo-text">RentEase</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Categories</Link>
          {user && (user.role === 'admin' || user.role === 'superadmin') && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          {user ? (
            <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Profile</Link>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryView />} />
            <Route path="/asset/:id" element={<AssetDetails />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/search" element={<Search />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Routes>
        </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; 2026 RentEase. Designed for effortless rentals.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
