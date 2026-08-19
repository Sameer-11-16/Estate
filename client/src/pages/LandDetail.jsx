import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiMapPin, FiSquare, FiTag, FiPhone, FiMessageSquare,
  FiArrowLeft, FiStar, FiEye, FiCheckCircle, FiAlertCircle,
  FiChevronLeft, FiChevronRight, FiX
} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../utils/api';
import { formatPrice, formatArea, getImageUrl, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import './LandDetail.css';

// Fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function EnquiryModal({ listing, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', contactPreference: 'Phone' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/enquiries', { ...form, listing: listing._id });
      toast.success('Enquiry sent! The seller will contact you soon.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Send Enquiry</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><FiX /></button>
        </div>
        <p className="text-muted mb-2">About: <strong style={{color:'var(--text)'}}>{listing.title}</strong></p>
        <form onSubmit={handleSubmit} className="enquiry-form">
          <div className="form-group">
            <label className="form-label">Your Name *</label>
            <input id="enq-name" className="form-input" required value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input id="enq-phone" className="form-input" required value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input id="enq-email" className="form-input" type="email" required value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea id="enq-message" className="form-textarea" value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              placeholder="I am interested in this land. Please share more details..." />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Preference</label>
            <div className="contact-pref">
              {['Phone', 'WhatsApp', 'Email'].map((p) => (
                <button key={p} type="button"
                  className={`pref-btn ${form.contactPreference === p ? 'active' : ''}`}
                  onClick={() => setForm({...form, contactPreference: p})}
                >{p}</button>
              ))}
            </div>
          </div>
          <button id="enq-submit" type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LandDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    API.get(`/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrapper loading-center"><div className="spinner" /></div>;
  if (!listing) return (
    <div className="page-wrapper loading-center" style={{flexDirection:'column',gap:'1rem'}}>
      <FiAlertCircle size={48} color="var(--error)" />
      <h3>Listing not found</h3>
      <Link to="/listings" className="btn btn-outline">Back to Listings</Link>
    </div>
  );

  const images = listing.images?.length > 0
    ? listing.images.map(getImageUrl)
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'];

  const prevImg = () => setCurrentImg((p) => (p - 1 + images.length) % images.length);
  const nextImg = () => setCurrentImg((p) => (p + 1) % images.length);

  const whatsappLink = `https://wa.me/91${listing.seller?.phone}?text=Hi, I am interested in your land: ${listing.title} listed on LandEstate.`;

  return (
    <div className="detail-page page-wrapper">
      <div className="container">
        {/* Back */}
        <Link to="/listings" className="back-btn">
          <FiArrowLeft /> Back to Listings
        </Link>

        <div className="detail-layout">
          {/* Left column */}
          <div className="detail-main">
            {/* Gallery */}
            <div className="gallery">
              <div className="gallery__main" onClick={() => setLightbox(true)}>
                <img src={images[currentImg]} alt={listing.title} />
                <div className="gallery__overlay">Click to zoom</div>
                {images.length > 1 && (
                  <>
                    <button className="gallery-nav gallery-nav--prev" onClick={(e)=>{e.stopPropagation();prevImg();}}>
                      <FiChevronLeft />
                    </button>
                    <button className="gallery-nav gallery-nav--next" onClick={(e)=>{e.stopPropagation();nextImg();}}>
                      <FiChevronRight />
                    </button>
                  </>
                )}
                <div className="gallery__count">{currentImg+1}/{images.length}</div>
                {listing.isFeatured && <span className="gallery-featured"><FiStar /> Featured</span>}
              </div>
              {images.length > 1 && (
                <div className="gallery__thumbs">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`View ${i+1}`}
                      className={currentImg === i ? 'active' : ''}
                      onClick={() => setCurrentImg(i)} />
                  ))}
                </div>
              )}
            </div>

            {/* Lightbox */}
            {lightbox && (
              <div className="lightbox" onClick={() => setLightbox(false)}>
                <button className="lightbox-close"><FiX /></button>
                <img src={images[currentImg]} alt={listing.title} onClick={e => e.stopPropagation()} />
                {images.length > 1 && (
                  <>
                    <button className="lb-nav lb-nav--prev" onClick={(e)=>{e.stopPropagation();prevImg();}}><FiChevronLeft /></button>
                    <button className="lb-nav lb-nav--next" onClick={(e)=>{e.stopPropagation();nextImg();}}><FiChevronRight /></button>
                  </>
                )}
              </div>
            )}

            {/* Info */}
            <div className="detail-info">
              <div className="detail-title-row">
                <div>
                  <div className="detail-badges">
                    <span className={`badge badge-${listing.status === 'Available' ? 'success' : 'error'}`}>
                      {listing.status === 'Available' ? <FiCheckCircle /> : <FiAlertCircle />}
                      {listing.status}
                    </span>
                    <span className="badge badge-primary">{listing.landType}</span>
                    {listing.roadFacing && <span className="badge badge-accent">Road Facing</span>}
                  </div>
                  <h1 className="detail-title">{listing.title}</h1>
                  <p className="detail-location"><FiMapPin /> {listing.location}, {listing.district}, {listing.state}</p>
                </div>
                <div className="detail-price-block">
                  <span className="detail-price">{formatPrice(listing.price)}</span>
                  <span className="detail-ppu">{formatPrice(listing.pricePerUnit)} per {listing.areaUnit}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="stats-grid">
                {[
                  { label: 'Total Area', value: formatArea(listing.area, listing.areaUnit), icon: '📐' },
                  { label: 'Price per Unit', value: `${formatPrice(listing.pricePerUnit)}/${listing.areaUnit}`, icon: '💰' },
                  { label: 'Road Width', value: listing.roadWidth ? `${listing.roadWidth} ft` : 'N/A', icon: '🛣️' },
                  { label: 'Land Type', value: listing.landType, icon: '🏷️' },
                  { label: 'District', value: listing.district, icon: '📍' },
                  { label: 'Views', value: listing.views, icon: '👁️' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="stat-card">
                    <span className="stat-icon">{icon}</span>
                    <div>
                      <span className="stat-label">{label}</span>
                      <span className="stat-value">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="detail-section">
                <h3>About This Land</h3>
                <p className="detail-desc">{listing.description}</p>
              </div>

              {/* Landmarks */}
              {listing.nearbyLandmarks?.length > 0 && (
                <div className="detail-section">
                  <h3>Nearby Landmarks</h3>
                  <ul className="landmarks-list">
                    {listing.nearbyLandmarks.map((l) => (
                      <li key={l}><FiMapPin /> {l}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Map */}
              {listing.coordinates?.lat && listing.coordinates?.lng && (
                <div className="detail-section">
                  <h3>Location on Map</h3>
                  <div className="map-wrap">
                    <MapContainer
                      center={[listing.coordinates.lat, listing.coordinates.lng]}
                      zoom={14}
                      style={{ height: '320px', width: '100%', borderRadius: 'var(--radius-lg)' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                      />
                      <Marker position={[listing.coordinates.lat, listing.coordinates.lng]}>
                        <Popup>{listing.title}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Seller card */}
          <aside className="detail-sidebar">
            <div className="seller-card glass">
              <h3>Seller / Agent</h3>
              <div className="seller-info">
                <div className="seller-avatar">{listing.seller?.name?.[0]?.toUpperCase() || 'S'}</div>
                <div>
                  <strong>{listing.seller?.name || 'Seller'}</strong>
                  <span>{timeAgo(listing.createdAt)}</span>
                </div>
              </div>
              <div className="seller-actions">
                <a href={`tel:${listing.seller?.phone}`} className="btn btn-primary w-full">
                  <FiPhone /> Call Seller
                </a>
                <a href={whatsappLink} target="_blank" rel="noreferrer"
                  className="btn w-full" style={{background:'#25d366', color:'#fff'}}>
                  <FiMessageSquare /> WhatsApp
                </a>
                <button id="enquiry-btn" className="btn btn-outline w-full" onClick={() => setEnquiryOpen(true)}>
                  <FiMessageSquare /> Send Enquiry
                </button>
              </div>
              <div className="divider" />
              <div className="listing-meta">
                <div><span>Listed</span><strong>{timeAgo(listing.createdAt)}</strong></div>
                <div><span>Negotiable</span><strong>{listing.negotiable ? 'Yes' : 'No'}</strong></div>
                <div><span>Status</span><strong style={{color: listing.status === 'Available' ? 'var(--success)' : 'var(--error)'}}>{listing.status}</strong></div>
              </div>
            </div>

            {/* Quick facts */}
            <div className="quick-facts glass">
              <h4>Quick Facts</h4>
              <ul>
                <li><span>Area</span><strong>{formatArea(listing.area, listing.areaUnit)}</strong></li>
                <li><span>Price</span><strong>{formatPrice(listing.price)}</strong></li>
                <li><span>Per {listing.areaUnit}</span><strong>{formatPrice(listing.pricePerUnit)}</strong></li>
                <li><span>Type</span><strong>{listing.landType}</strong></li>
                <li><span>Road Facing</span><strong>{listing.roadFacing ? 'Yes' : 'No'}</strong></li>
                {listing.roadWidth && <li><span>Road Width</span><strong>{listing.roadWidth} ft</strong></li>}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {enquiryOpen && <EnquiryModal listing={listing} onClose={() => setEnquiryOpen(false)} />}
    </div>
  );
}
