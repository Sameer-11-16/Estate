import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMessageSquare, FiPhone, FiMail, FiTrash2, FiCheck,
  FiArrowLeft, FiClock, FiCheckCircle, FiExternalLink, FiUser
} from 'react-icons/fi';
import API from '../../utils/api';
import { timeAgo, getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Admin.css';

export default function ManageEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/enquiries', { params });
      setEnquiries(res.data.enquiries || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/enquiries/${id}/status`, { status });
      toast.success(`Enquiry marked as ${status}`);
      setEnquiries((prev) =>
        prev.map((e) => (e._id === id ? { ...e, status } : e))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry record?')) return;
    try {
      await API.delete(`/enquiries/${id}`);
      toast.success('Enquiry deleted');
      setEnquiries((prev) => prev.filter((e) => e._id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="admin-page page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <Link to="/admin" className="back-btn">
          <FiArrowLeft /> Back to Dashboard
        </Link>

        <div className="admin-header">
          <div>
            <h1>Manage Enquiries</h1>
            <p>Direct inquiries submitted by interested buyers ({total} total)</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="admin-filter-bar glass">
          <div className="status-tabs">
            {[
              { label: 'All', value: '' },
              { label: 'New', value: 'New' },
              { label: 'Responded', value: 'Responded' },
              { label: 'Closed', value: 'Closed' },
            ].map((tab) => (
              <button
                key={tab.label}
                className={`tab-btn ${statusFilter === tab.value ? 'active' : ''}`}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="no-results glass mt-3">
            <span className="no-results-icon">💬</span>
            <h3>No enquiries found</h3>
            <p>There are no customer inquiries matching your criteria.</p>
          </div>
        ) : (
          <div className="enquiries-grid mt-3">
            {enquiries.map((enq) => (
              <div key={enq._id} className="enquiry-card glass">
                <div className="enquiry-card-header">
                  <div className="enquiry-user">
                    <div className="avatar">
                      {enq.name?.[0]?.toUpperCase() || <FiUser />}
                    </div>
                    <div>
                      <h4>{enq.name}</h4>
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {timeAgo(enq.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`badge badge-${
                      enq.status === 'New'
                        ? 'warning'
                        : enq.status === 'Responded'
                        ? 'success'
                        : 'info'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>

                {/* Property context */}
                {enq.listing && (
                  <div className="enquiry-prop-info">
                    <img
                      src={getImageUrl(enq.listing.images?.[0])}
                      alt={enq.listing.title}
                      className="enq-thumb"
                    />
                    <div>
                      <Link
                        to={`/listings/${enq.listing._id}`}
                        target="_blank"
                        className="enq-prop-title"
                      >
                        {enq.listing.title} <FiExternalLink size={11} />
                      </Link>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {enq.listing.district}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message */}
                {enq.message && (
                  <div className="enquiry-message">
                    <p>"{enq.message}"</p>
                  </div>
                )}

                {/* Contact details */}
                <div className="enquiry-contact-details">
                  <div>
                    <span className="text-muted">Phone:</span>
                    <strong>{enq.phone}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Email:</span>
                    <strong>{enq.email}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Prefers:</span>
                    <span className="badge badge-primary">{enq.contactPreference}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="enquiry-actions">
                  <a
                    href={`tel:${enq.phone}`}
                    className="btn btn-sm btn-outline"
                    title="Call"
                  >
                    <FiPhone /> Call
                  </a>
                  <a
                    href={`https://wa.me/91${enq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                      enq.name
                    )},%20regarding%20your%20enquiry%20for%20land%20on%20LandEstate.`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#25d366', color: '#fff' }}
                  >
                    <FiMessageSquare /> WhatsApp
                  </a>
                  <a
                    href={`mailto:${enq.email}?subject=Regarding your enquiry for land on LandEstate`}
                    className="btn btn-sm btn-ghost"
                    title="Email"
                  >
                    <FiMail />
                  </a>

                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                    {enq.status === 'New' && (
                      <button
                        className="btn btn-sm btn-icon action-approve"
                        title="Mark Responded"
                        onClick={() => handleStatusChange(enq._id, 'Responded')}
                      >
                        <FiCheck />
                      </button>
                    )}
                    {enq.status === 'Responded' && (
                      <button
                        className="btn btn-sm btn-icon action-sold"
                        title="Mark Closed"
                        onClick={() => handleStatusChange(enq._id, 'Closed')}
                      >
                        <FiCheckCircle />
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-icon action-delete"
                      title="Delete"
                      onClick={() => handleDelete(enq._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
      </div>
    </div>
  );
}
