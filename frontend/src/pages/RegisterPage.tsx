import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wheat } from 'lucide-react';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><Wheat size={28} /></div>
          <h1>SmartSeason</h1>
          <p>Field Monitoring System</p>
        </div>
        <div className="auth-illustration">
          <div className="field-rows">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="field-row" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <div className="auth-tagline">
            <span>Track</span> · <span>Monitor</span> · <span>Harvest</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card fade-up">
          <h2>Create account</h2>
          <p className="auth-sub">Join SmartSeason today</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="jane@farm.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="agent">Field Agent</option>
                <option value="admin">Admin / Coordinator</option>
              </select>
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
