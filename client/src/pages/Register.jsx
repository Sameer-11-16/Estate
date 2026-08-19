import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin } from 'react-icons/fi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    try {
      const res = await API.post('/auth/register', { name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data);
      toast.success('Account created! Welcome to LandEstate 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
      </div>
      <div className="auth-card glass animate-fade-up">
        <div className="auth-logo">
          <div className="logo-icon"><FiMapPin /></div>
          <span>Land<strong>Estate</strong></span>
        </div>
        <h2>Create Account</h2>
        <p className="text-muted text-center">Join thousands of buyers and sellers</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="input-icon-wrap">
              <FiUser className="input-icon" />
              <input id="reg-name" className="form-input" required
                value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" />
              <input id="reg-email" className="form-input" type="email" required
                value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-icon-wrap">
              <FiPhone className="input-icon" />
              <input id="reg-phone" className="form-input"
                value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" />
              <input id="reg-password" className="form-input" type="password" required
                value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min 6 characters" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" />
              <input id="reg-confirm" className="form-input" type="password" required
                value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Repeat password" />
            </div>
          </div>
          <button id="reg-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
