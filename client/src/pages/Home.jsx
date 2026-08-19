import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiArrowRight, FiTrendingUp, FiCheck, FiShield, FiUsers } from 'react-icons/fi';
import LandCard from '../components/LandCard';
import API from '../utils/api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [districtCounts, setDistrictCounts] = useState([]);
  const [stats, setStats] = useState({
    activeListings: 0,
    districtsCount: 0,
    soldCount: 0,
    totalViews: 0,
    listingFee: '₹0',
  });
  const [filterTypes, setFilterTypes] = useState(['Residential', 'Commercial', 'Agricultural', 'Industrial']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, recentRes, districtsRes, statsRes, filtersRes] = await Promise.all([
          API.get('/listings?featured=true&limit=4'),
          API.get('/listings?sort=newest&limit=6'),
          API.get('/listings/districts'),
          API.get('/listings/public-stats'),
          API.get('/listings/filters'),
        ]);

        setFeaturedListings(featuredRes.data.listings || []);
        setRecentListings(recentRes.data.listings || []);
        setDistrictCounts(districtsRes.data || []);
        if (statsRes.data) setStats(statsRes.data);
        if (filtersRes.data?.landTypes?.length > 0) {
          setFilterTypes(filtersRes.data.landTypes);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/listings');
    }
  };

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
          <div className="hero-orb hero-orb--3" />
          <div className="hero-grid" />
        </div>
        <div className="container hero__content">
          <div className="hero__badge animate-fade-up">
            <FiTrendingUp /> {stats.activeListings > 0 ? `${stats.activeListings} Verified Land Plots in Gorakhpur & UP` : 'Direct Land Marketplace'}
          </div>
          <h1 className="hero__title animate-fade-up">
            Find the Right Land<br />
            <span className="text-gradient">in Gorakhpur & UP</span>
          </h1>
          <p className="hero__subtitle animate-fade-up">
            Discover verified residential, commercial, and agricultural land in Gorakhpur, Lucknow, Ayodhya, Varanasi, and across Uttar Pradesh.
            Direct contact with landowners without middlemen.
          </p>

          {/* Search */}
          <form className="hero__search animate-fade-up" onSubmit={handleSearch}>
            <div className="hero__search-inner">
              <FiMapPin className="search-icon" />
              <input
                type="text"
                placeholder="Search Taramandal, AIIMS, Rapti Nagar, Gorakhpur, Lucknow..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="hero-search"
              />
              <button type="submit" className="btn btn-primary">
                <FiSearch /> Search
              </button>
            </div>
          </form>

          {/* Dynamic Quick Filters */}
          <div className="hero__quick animate-fade-up">
            {filterTypes.map((type) => (
              <button
                key={type}
                className="quick-chip"
                onClick={() => navigate(`/listings?landType=${encodeURIComponent(type)}`)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Dynamic Real-time Platform Stats */}
          <div className="hero__stats animate-fade-up">
            <div className="hero-stat">
              <strong>{stats.activeListings || 0}</strong>
              <span>Active Plots</span>
            </div>
            <div className="hero-stat">
              <strong>{stats.districtsCount || 0}</strong>
              <span>Districts</span>
            </div>
            <div className="hero-stat">
              <strong>{stats.totalViews ? `${stats.totalViews}+` : '100%'}</strong>
              <span>Plot Views</span>
            </div>
            <div className="hero-stat">
              <strong>{stats.listingFee}</strong>
              <span>Listing Fee</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ===== FEATURED LISTINGS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">⭐ Top Verified Plots</div>
            <h2>Featured Land & Plots</h2>
            <p>Handpicked prime land listings in Gorakhpur and top UP investment corridors</p>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No featured plots at the moment.</p>
              <Link to="/listings" className="btn btn-primary mt-2">Browse All Land</Link>
            </div>
          ) : (
            <>
              <div className="grid-4">
                {featuredListings.map((l) => <LandCard key={l._id} listing={l} />)}
              </div>
              <div className="text-center mt-3">
                <Link to="/listings?featured=true" className="btn btn-outline">
                  View All Featured <FiArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== POPULAR DISTRICTS ===== */}
      {districtCounts.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-header">
              <div className="eyebrow">📍 Explore by Location</div>
              <h2>Popular Locations in UP</h2>
              <p>Browse active land listings by city & district</p>
            </div>
            <div className="districts-grid">
              {districtCounts.map((d, i) => {
                const sampleImg = d.sampleImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600';
                return (
                  <Link
                    to={`/listings?district=${encodeURIComponent(d._id)}`}
                    key={d._id}
                    className="district-card"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <div
                      className="district-card__img"
                      style={{ backgroundImage: `url(${sampleImg})` }}
                    />
                    <div className="district-card__overlay" />
                    <div className="district-card__content">
                      <h3><FiMapPin /> {d._id}</h3>
                      <span className="district-count">{d.count} {d.count === 1 ? 'plot' : 'plots'}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== RECENTLY ADDED ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="eyebrow">🆕 Just Listed</div>
            <h2>Recently Added Land</h2>
            <p>Fresh plots and land listings added in Gorakhpur & UP</p>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : recentListings.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No listings added yet.</p>
              <Link to="/list-land" className="btn btn-primary mt-2">+ List Your Land</Link>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {recentListings.map((l) => <LandCard key={l._id} listing={l} />)}
              </div>
              <div className="text-center mt-3">
                <Link to="/listings" className="btn btn-outline">
                  Browse All Listings <FiArrowRight />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className="section section--alt">
        <div className="container">
          <div className="why-grid">
            <div className="why-text">
              <div className="eyebrow">💎 Direct & Transparent</div>
              <h2>Gorakhpur & UP's Direct Land Marketplace</h2>
              <p>We make buying and selling land in Gorakhpur simple, transparent, and direct without middleman commissions.</p>
              <ul className="why-list">
                {[
                  'GDA / LDA / VDA approved & private residential plots',
                  'Direct contact with landowners via Call or WhatsApp',
                  'Verified GPS coordinates and interactive map view',
                  '100% Free property listing for owners',
                  'Commercial, Industrial (GIDA), and Agricultural Farm Land',
                ].map((item) => (
                  <li key={item}><FiCheck /> {item}</li>
                ))}
              </ul>
              <Link to="/listings" className="btn btn-primary btn-lg mt-3">
                Start Exploring Plots <FiArrowRight />
              </Link>
            </div>
            <div className="why-visual">
              <div className="why-card glass">
                <div className="why-card-stat">
                  <span className="why-number">₹0</span>
                  <span>Listing Commission</span>
                </div>
                <div className="why-card-stat">
                  <span className="why-number">100%</span>
                  <span>Direct Seller Contact</span>
                </div>
                <div className="why-card-stat">
                  <span className="why-number">24h</span>
                  <span>Approval & Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section cta-section">
        <div className="cta-bg" />
        <div className="container">
          <div className="cta-content glass">
            <div className="cta-glow" />
            <h2>Sell or Rent Land in Gorakhpur & UP</h2>
            <p>Connect with genuine buyers across Uttar Pradesh. List your land in under 2 minutes for free.</p>
            <div className="cta-btns">
              <Link to="/list-land" className="btn btn-primary btn-lg">
                + List Your Land Free
              </Link>
              <Link to="/listings" className="btn btn-outline btn-lg">
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
