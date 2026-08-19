import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiList, FiMessageSquare, FiCheckCircle, FiClock, FiDollarSign, FiStar, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import API from '../../utils/api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [enqStats, setEnqStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/listings/stats'),
      API.get('/enquiries/stats'),
      API.get('/listings?admin=true&limit=5&sort=newest'),
    ]).then(([sRes, eRes, lRes]) => {
      setStats(sRes.data);
      setEnqStats(eRes.data);
      setRecentListings(lRes.data.listings || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = stats && enqStats ? [
    { label: 'Total Listings', value: stats.total, icon: <FiList />, color: 'info' },
    { label: 'Pending Approval', value: stats.pending, icon: <FiClock />, color: 'warning', link: '/admin/listings?status=Pending' },
    { label: 'Available', value: stats.available, icon: <FiCheckCircle />, color: 'success' },
    { label: 'Sold', value: stats.sold, icon: <FiDollarSign />, color: 'error' },
    { label: 'Featured', value: stats.featured, icon: <FiStar />, color: 'accent' },
    { label: 'New Enquiries', value: enqStats.new, icon: <FiMessageSquare />, color: 'primary', link: '/admin/enquiries' },
  ] : [];

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage listings, enquiries and platform activity</p>
          </div>
          <div style={{display:'flex', gap:'0.75rem'}}>
            <Link to="/admin/listings" className="btn btn-outline">Manage Listings</Link>
            <Link to="/admin/enquiries" className="btn btn-primary">View Enquiries</Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="admin-stats">
              {statCards.map(({ label, value, icon, color, link }) => (
                <Link key={label} to={link || '#'} className={`stat-card-admin color-${color}`}>
                  <div className="stat-icon-wrap">{icon}</div>
                  <div className="stat-info">
                    <span className="stat-num">{value ?? 0}</span>
                    <span className="stat-lbl">{label}</span>
                  </div>
                  {link && <FiArrowRight className="stat-arrow" />}
                </Link>
              ))}
            </div>

            {/* Recent listings */}
            <div className="admin-section">
              <div className="section-row">
                <h3><FiTrendingUp /> Recent Listings</h3>
                <Link to="/admin/listings" className="btn btn-ghost btn-sm">View All</Link>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th><th>District</th><th>Type</th><th>Price</th><th>Status</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentListings.map((l) => (
                      <tr key={l._id}>
                        <td><Link to={`/listings/${l._id}`}>{l.title}</Link></td>
                        <td>{l.district}</td>
                        <td><span className="badge badge-primary">{l.landType}</span></td>
                        <td>₹{Number(l.price).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${l.status === 'Available' ? 'success' : l.status === 'Sold' ? 'error' : l.status === 'Pending' ? 'warning' : 'error'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
