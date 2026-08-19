import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './ListYourLand.css';

const STEPS = ['Land Details', 'Pricing & Photos', 'Contact Info'];

const DEFAULT_DISTRICTS = [
  'Gorakhpur','Lucknow','Ayodhya','Varanasi','Prayagraj','Kanpur',
  'Noida','Ghaziabad','Meerut','Agra','Bareilly','Aligarh',
  'Basti','Deoria','Maharajganj','Kushinagar','Siddharthnagar'
];

export default function ListYourLand() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [districtsList, setDistrictsList] = useState(DEFAULT_DISTRICTS);

  const [form, setForm] = useState({
    title: '', description: '',
    location: '', district: 'Gorakhpur', state: 'Uttar Pradesh',
    area: '', areaUnit: 'sqft',
    price: '', negotiable: false,
    landType: 'Residential',
    roadFacing: false, roadWidth: '',
    nearbyLandmarks: '',
    lat: '', lng: '',
    name: '', phone: '', contactPreference: 'Phone',
  });

  useEffect(() => {
    API.get('/listings/filters')
      .then((res) => {
        if (res.data?.districts?.length > 0) {
          setDistrictsList([...new Set([...DEFAULT_DISTRICTS, ...res.data.districts])]);
        }
      })
      .catch(console.error);
  }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((p) => [...p, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((p) => [...p, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
    setImageFiles((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) formData.append(k, v);
      });
      if (form.lat && form.lng) {
        formData.set('coordinates', JSON.stringify({ lat: Number(form.lat), lng: Number(form.lng) }));
      }
      imageFiles.forEach((f) => formData.append('images', f));

      await API.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('🎉 Plot submitted for review! It will be verified and published.');
      navigate('/listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const validateStep = () => {
    if (step === 0 && (!form.title || !form.location || !form.district || !form.area || !form.landType)) {
      toast.error('Please fill all required fields');
      return false;
    }
    if (step === 1 && !form.price) {
      toast.error('Please enter the price');
      return false;
    }
    return true;
  };

  return (
    <div className="list-page page-wrapper">
      <div className="container">
        <div className="list-header">
          <h1>List Your <span className="text-gradient">Land / Plot</span></h1>
          <p>Post your property in Gorakhpur & Uttar Pradesh. Reach verified buyers directly without middleman fee.</p>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? <FiCheck /> : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="list-form glass">
          {/* STEP 0 — Land Details */}
          {step === 0 && (
            <div className="form-step">
              <h2>Plot & Location Information</h2>
              <div className="form-grid-2">
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Listing Title *</label>
                  <input id="lt-title" className="form-input" value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. GDA Approved Residential Plot in Taramandal, Gorakhpur" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Colony / Area *</label>
                  <input id="lt-location" className="form-input" value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. Taramandal, near Ramgarh Tal" />
                </div>
                <div className="form-group">
                  <label className="form-label">City / District (UP) *</label>
                  <select id="lt-district" className="form-select" value={form.district}
                    onChange={(e) => set('district', e.target.value)}>
                    {districtsList.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Land Category *</label>
                  <select id="lt-type" className="form-select" value={form.landType}
                    onChange={(e) => set('landType', e.target.value)}>
                    {['Residential','Commercial','Agricultural','Industrial','Mixed Use'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Area *</label>
                  <div className="input-group">
                    <input id="lt-area" className="form-input" type="number" value={form.area}
                      onChange={(e) => set('area', e.target.value)} placeholder="e.g. 1800" />
                    <select className="form-select unit-select" value={form.areaUnit}
                      onChange={(e) => set('areaUnit', e.target.value)}>
                      {['sqft','bigha','biswa','dhur','gaj','acre','sqm'].map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Road Width (in Feet)</label>
                  <input id="lt-road-width" className="form-input" type="number" value={form.roadWidth}
                    onChange={(e) => set('roadWidth', e.target.value)} placeholder="e.g. 30" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nearby Key Landmarks</label>
                  <input id="lt-landmarks" className="form-input" value={form.nearbyLandmarks}
                    onChange={(e) => set('nearbyLandmarks', e.target.value)}
                    placeholder="e.g. Ramgarh Tal, AIIMS, BRD Medical College, NH 28" />
                </div>
                <div className="form-group">
                  <label className="form-label">Features & Approvals</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={form.roadFacing}
                        onChange={(e) => set('roadFacing', e.target.checked)} />
                      Main Road Facing
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={form.negotiable}
                        onChange={(e) => set('negotiable', e.target.checked)} />
                      Price Negotiable
                    </label>
                  </div>
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">GPS Coordinates (optional)</label>
                  <div className="range-inputs">
                    <input id="lt-lat" className="form-input" type="number" step="any"
                      value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="Latitude (e.g. 26.7381)" />
                    <span>,</span>
                    <input id="lt-lng" className="form-input" type="number" step="any"
                      value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="Longitude (e.g. 83.3986)" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Pricing & Photos */}
          {step === 1 && (
            <div className="form-step">
              <h2>Pricing & Photos</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Total Asking Price (₹) *</label>
                  <input id="lt-price" className="form-input" type="number" value={form.price}
                    onChange={(e) => set('price', e.target.value)} placeholder="e.g. 4500000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Calculated Rate per {form.areaUnit}</label>
                  <input className="form-input" readOnly style={{background:'var(--bg-3)', fontWeight:600}}
                    value={form.price && form.area ? `₹${Math.round(Number(form.price)/Number(form.area)).toLocaleString('en-IN')} / ${form.areaUnit}` : '—'} />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Detailed Description *</label>
                  <textarea id="lt-desc" className="form-textarea" style={{minHeight:'120px'}}
                    value={form.description} onChange={(e) => set('description', e.target.value)}
                    placeholder="Describe plot dimensions, registry status, electricity/water, distance from highway, GDA approval, etc..." />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Plot Photos (up to 10)</label>
                  <label className="upload-area" htmlFor="lt-photos">
                    <FiUpload size={32} color="var(--primary)" />
                    <span style={{fontWeight:600, color:'var(--text)'}}>Click to upload plot photos</span>
                    <small>JPG, PNG, WEBP — max 5MB each</small>
                  </label>
                  <input id="lt-photos" type="file" accept="image/*" multiple hidden onChange={handleImages} />
                  {imagePreviews.length > 0 && (
                    <div className="image-previews">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="preview-item">
                          <img src={src} alt={`Preview ${i+1}`} />
                          <button className="remove-img" onClick={() => removeImage(i)}><FiX /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Contact */}
          {step === 2 && (
            <div className="form-step">
              <h2>Seller / Owner Details</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input id="lt-name" className="form-input" value={form.name}
                    onChange={(e) => set('name', e.target.value)} placeholder="e.g. Manoj Tripathi" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone Number *</label>
                  <input id="lt-phone" className="form-input" value={form.phone}
                    onChange={(e) => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group" style={{gridColumn:'1/-1'}}>
                  <label className="form-label">Preferred Contact Method for Buyers</label>
                  <div className="contact-pref">
                    {['Phone', 'WhatsApp', 'Email'].map((p) => (
                      <button key={p} type="button"
                        className={`pref-btn ${form.contactPreference === p ? 'active' : ''}`}
                        onClick={() => set('contactPreference', p)}>{p}</button>
                    ))}
                  </div>
                </div>
                <div className="submit-notice glass" style={{gridColumn:'1/-1'}}>
                  <h4>📋 Seller Guidelines & Process</h4>
                  <ul>
                    <li>Your listing will be verified and published within 24 hours</li>
                    <li>Buyers will call or WhatsApp you directly</li>
                    <li>Zero brokerage or commission charged</li>
                    <li>Direct deal between buyer and landowner</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="form-nav">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            <div style={{flex:1}} />
            {step < STEPS.length - 1 ? (
              <button id="lt-next" className="btn btn-primary" onClick={() => validateStep() && setStep(s => s + 1)}>
                Continue →
              </button>
            ) : (
              <button id="lt-submit" className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : '🚀 Submit Plot Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
