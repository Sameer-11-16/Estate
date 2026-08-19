import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiMapPin } from 'react-icons/fi';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, setLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate(res.data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2>Welcome Back</h2>
        <p className="text-muted text-center">Sign in to your account to continue</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" />
              <input id="login-email" className="form-input" type="email" required
                value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="you@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" />
              <input id="login-password" className="form-input" type="password" required
                value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="••••••••" />
            </div>
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-demo">
          <p>Demo accounts:</p>
          <div className="demo-accounts">
            <button className="demo-btn" onClick={() => setForm({email:'admin@landestate.in', password:'admin123456'})}>
              Admin
            </button>
            <button className="demo-btn" onClick={() => setForm({email:'seller@landestate.in', password:'seller123456'})}>
              Seller
            </button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
