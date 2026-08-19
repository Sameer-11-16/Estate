import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiMapPin, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="logo-icon"><FiMapPin /></span>
          <span>Land<strong>Estate</strong></span>
        </Link>

        {/* Desktop nav */}
        <ul className="navbar__links">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/listings" className={({ isActive }) => isActive ? 'active' : ''}>Browse Land</NavLink></li>
          <li><Link to="/list-land" className="btn btn-primary btn-sm">+ List Land</Link></li>
        </ul>

        {/* User menu */}
        <div className="navbar__user">
          {user ? (
            <div className="user-menu" onMouseLeave={() => setDropOpen(false)}>
              <button
                className="user-avatar-btn"
                onClick={() => setDropOpen(!dropOpen)}
                aria-label="User menu"
              >
                <div className="avatar">{user.name[0].toUpperCase()}</div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </button>
              {dropOpen && (
                <div className="user-dropdown">
                  {user.role === 'admin' && (
                    <Link to="/admin" className="drop-item" onClick={() => setDropOpen(false)}>
                      <FiSettings /> Admin Dashboard
                    </Link>
                  )}
                  <Link to="/list-land" className="drop-item" onClick={() => setDropOpen(false)}>
                    <FiUser /> My Listings
                  </Link>
                  <div className="drop-divider" />
                  <button className="drop-item drop-item--danger" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-outline btn-sm">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fade-in">
          {user && (
            <div className="mobile-user-card">
              <div className="avatar">{user.name[0].toUpperCase()}</div>
              <div>
                <strong className="mobile-user-name">{user.name}</strong>
                <span className="mobile-user-role">{user.role === 'admin' ? 'Administrator' : 'Verified Member'}</span>
              </div>
            </div>
          )}

          <div className="mobile-nav-links">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/listings" onClick={() => setMenuOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              Browse Land & Plots
            </NavLink>
            <Link to="/list-land" onClick={() => setMenuOpen(false)} className="btn btn-primary w-full mobile-list-btn">
              + List Your Land Free
            </Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <NavLink to="/admin" onClick={() => setMenuOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
                    <FiSettings /> Admin Dashboard
                  </NavLink>
                )}
                <button className="mobile-nav-item mobile-logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-grid">
                <Link to="/login" className="btn btn-outline w-full" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
