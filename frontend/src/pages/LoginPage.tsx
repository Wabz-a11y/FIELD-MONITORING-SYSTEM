import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wheat, Eye, EyeOff } from 'lucide-react';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

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
          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to your account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
