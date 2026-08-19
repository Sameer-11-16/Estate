import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiCheck, FiX, FiTrash2, FiStar, FiEdit2, FiExternalLink,
  FiSearch, FiArrowLeft, FiFilter, FiCheckCircle, FiDollarSign
} from 'react-icons/fi';
import API from '../../utils/api';
import { formatPrice, formatArea, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Admin.css';

export default function ManageListings() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Edit Modal State
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        admin: 'true',
        page,
        limit: 15,
      };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await API.get('/listings', { params });
      setListings(res.data.listings || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/listings/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      setListings((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status } : l))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await API.patch(`/listings/${id}/featured`);
      toast.success(res.data.isFeatured ? 'Marked as Featured' : 'Removed from Featured');
      setListings((prev) =>
        prev.map((l) => (l._id === id ? { ...l, isFeatured: res.data.isFeatured } : l))
      );
    } catch (err) {
      toast.error('Failed to toggle featured state');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await API.delete(`/listings/${id}`);
      toast.success('Listing deleted successfully');
      setListings((prev) => prev.filter((l) => l._id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEditModal = (listing) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title,
      price: listing.price,
      status: listing.status,
      landType: listing.landType,
      area: listing.area,
      roadFacing: listing.roadFacing,
      roadWidth: listing.roadWidth || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/listings/${editingListing._id}`, editForm);
      toast.success('Listing updated!');
      setListings((prev) =>
        prev.map((l) => (l._id === editingListing._id ? { ...l, ...res.data } : l))
      );
      setEditingListing(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing');
    }
  };

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <Link to="/admin" className="back-btn">
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <div className="admin-header">
          <div>
            <h1>Manage Listings</h1>
            <p>Approve, edit, highlight or remove land listings ({total} total)</p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="admin-filter-bar glass">
          <div className="status-tabs">
            {['All', 'Pending', 'Available', 'Sold', 'Rejected'].map((st) => (
              <button
                key={st}
                className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="search-bar">
            <FiSearch />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : listings.length === 0 ? (
          <div className="no-results glass mt-3">
            <span className="no-results-icon">📋</span>
            <h3>No listings found</h3>
            <p>No land listings match the current filters.</p>
          </div>
        ) : (
          <div className="admin-table-wrap glass mt-3">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Type & Area</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Seller</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="table-prop">
                        <img
                          src={getImageUrl(l.images?.[0])}
                          alt={l.title}
                          className="table-prop-thumb"
                        />
                        <div>
                          <Link to={`/listings/${l._id}`} className="table-prop-title" target="_blank">
                            {l.title} <FiExternalLink size={12} />
                          </Link>
                          <span className="table-prop-date">
                            {new Date(l.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{l.district}</strong>
                      <span className="text-muted" style={{ display: 'block', fontSize: '0.78rem' }}>
                        {l.location}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{l.landType}</span>
                      <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '3px' }}>
                        {formatArea(l.area, l.areaUnit)}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent)' }}>{formatPrice(l.price)}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          l.status === 'Available'
                            ? 'success'
                            : l.status === 'Sold'
                            ? 'error'
                            : l.status === 'Pending'
                            ? 'warning'
                            : 'error'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn-star ${l.isFeatured ? 'active' : ''}`}
                        title={l.isFeatured ? 'Unmark Featured' : 'Mark as Featured'}
                        onClick={() => handleToggleFeatured(l._id)}
                      >
                        <FiStar />
                      </button>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div>{l.seller?.name || '—'}</div>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {l.seller?.phone || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        {l.status === 'Pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-icon action-approve"
                              title="Approve Listing"
                              onClick={() => handleStatusChange(l._id, 'Available')}
                            >
                              <FiCheck />
                            </button>
                            <button
                              className="btn btn-sm btn-icon action-reject"
                              title="Reject Listing"
                              onClick={() => handleStatusChange(l._id, 'Rejected')}
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                        {l.status === 'Available' && (
                          <button
                            className="btn btn-sm btn-icon action-sold"
                            title="Mark as Sold"
                            onClick={() => handleStatusChange(l._id, 'Sold')}
                          >
                            <FiDollarSign />
                          </button>
                        )}
                        {l.status === 'Sold' && (
                          <button
                            className="btn btn-sm btn-icon action-approve"
                            title="Mark as Available"
                            onClick={() => handleStatusChange(l._id, 'Available')}
                          >
                            <FiCheckCircle />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-icon action-edit"
                          title="Edit Listing"
                          onClick={() => openEditModal(l)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-sm btn-icon action-delete"
                          title="Delete Listing"
                          onClick={() => handleDelete(l._id, l.title)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination mt-3">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingListing && (
          <div className="modal-overlay" onClick={() => setEditingListing(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Quick Edit Listing</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setEditingListing(null)}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="enquiry-form">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Pending">Pending</option>
                      <option value="Sold">Sold</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Land Type</label>
                    <select
                      className="form-select"
                      value={editForm.landType}
                      onChange={(e) => setEditForm({ ...editForm, landType: e.target.value })}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Mixed Use">Mixed Use</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Road Width (ft)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.roadWidth}
                      onChange={(e) => setEditForm({ ...editForm, roadWidth: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.roadFacing}
                      onChange={(e) => setEditForm({ ...editForm, roadFacing: e.target.checked })}
                    />
                    Road Facing
                  </label>
                </div>
                <div className="form-nav">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditingListing(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
