import { useState, FormEvent, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import api from '../lib/api'

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-brand">
          <Logo size={44} collapsed/>
          <h1>SmartSeason</h1>
          <p>Field Agent Portal</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="auth-decor-row" style={{ width: i % 2 === 0 ? '80%' : '62%', animationDelay: `${i * 0.1}s` }}/>
          ))}
          <div style={{ marginTop: 14, fontFamily: 'Outfit,sans-serif', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', display: 'flex', gap: 8 }}>
            <span style={{ color: 'rgba(127,214,122,.55)' }}>Observe</span> ·
            <span style={{ color: 'rgba(127,214,122,.55)' }}>Update</span> ·
            <span style={{ color: 'rgba(127,214,122,.55)' }}>Grow</span>
          </div>
        </div>
      </div>
      <div className="auth-right">{children}</div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password) }
    catch (err: any) { setError(err.response?.data?.detail || err.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell>
      <div className="auth-card anim-up">
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to manage your assigned fields</p>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@farm.com" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input className="form-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required/>
              <button type="button" className="input-end-btn" onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: -6 }}>
            <Link to="/forgot-password" style={{ fontSize: '.8rem', color: 'var(--primary)' }}>Forgot password?</Link>
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner"/>Signing in…</> : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">New agent? <Link to="/register">Create account</Link></p>
      </div>
    </AuthShell>
  )
}

// ── Register ──────────────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form.name, form.email, form.password) }
    catch (err: any) { setError(err.response?.data?.detail || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell>
      <div className="auth-card anim-up">
        <h2>Create account</h2>
        <p className="auth-sub">Register as a field agent</p>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} placeholder="Jane Kamau" required/></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="jane@farm.com" required/></div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} placeholder="Min 8 characters" required minLength={8}/>
            <span className="form-hint">Minimum 8 characters</span>
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner"/>Creating account…</> : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </AuthShell>
  )
}

// ── Forgot Password ───────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true)
    await api.post('auth/forgot-password', { email }).catch(() => {})
    setSent(true); setLoading(false)
  }

  return (
    <AuthShell>
      <div className="auth-card anim-up">
        {sent ? (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📬</div>
            <h2>Check your email</h2>
            <p className="auth-sub">If that address exists, a reset link has been sent. Check your inbox and spam folder.</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>Back to Login</Link>
          </>
        ) : (
          <>
            <h2>Reset password</h2>
            <p className="auth-sub">Enter your email and we'll send a reset link.</p>
            <form className="auth-form" onSubmit={submit}>
              <div className="form-group"><label className="form-label">Email address</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@farm.com" required/></div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <><span className="spinner"/>Sending…</> : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-switch"><Link to="/login">← Back to login</Link></p>
          </>
        )}
      </div>
    </AuthShell>
  )
}

// ── Reset Password ────────────────────────────────────────────────
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('auth/reset-password', { token, new_password: password }); setDone(true) }
    catch (err: any) { setError(err.response?.data?.detail || 'Reset failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell>
      <div className="auth-card anim-up">
        {done ? (
          <>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
            <h2>Password updated</h2>
            <p className="auth-sub">Your password has been reset successfully.</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 20 }}>Sign In</Link>
          </>
        ) : (
          <>
            <h2>Set new password</h2>
            <p className="auth-sub">Enter your new password below.</p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form className="auth-form" onSubmit={submit}>
              <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8}/></div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? <><span className="spinner"/>Updating…</> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </AuthShell>
  )
}

// ── Verify Email ──────────────────────────────────────────────────
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading'|'ok'|'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    api.post('auth/verify-email', { token }).then(() => setStatus('ok')).catch(() => setStatus('error'))
  }, [token])

  return (
    <AuthShell>
      <div className="auth-card anim-up" style={{ textAlign: 'center' }}>
        {status === 'loading' && <><div className="spinner spinner-dark" style={{ width: 40, height: 40, margin: '0 auto 16px' }}/><p style={{ color: 'var(--text-3)' }}>Verifying your email…</p></>}
        {status === 'ok'      && <><div style={{ fontSize: '3rem' }}>🎉</div><h2 style={{ marginTop: 12 }}>Email verified!</h2><p className="auth-sub">Your account is now fully active.</p><Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>Go to Dashboard</Link></>}
        {status === 'error'   && <><div style={{ fontSize: '3rem' }}>😕</div><h2 style={{ marginTop: 12 }}>Link expired</h2><p className="auth-sub">This link is invalid or has expired.</p><Link to="/" className="btn btn-ghost" style={{ marginTop: 20, display: 'inline-flex' }}>Go to Dashboard</Link></>}
      </div>
    </AuthShell>
  )
}
