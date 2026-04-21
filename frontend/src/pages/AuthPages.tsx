import { useState, FormEvent, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import api from '../lib/api'

// Real Unsplash farm/field photos
const AUTH_IMAGES = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=80', // aerial fields
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=80', // green crops
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80', // farm landscape
]

function AuthShell({ children, image }: { children: React.ReactNode; image?: string }) {
  const img = image || AUTH_IMAGES[0]
  return (
    <div className="auth-shell">
      {/* Left — full photo panel */}
      <div className="auth-left" style={{ padding:0, overflow:'hidden' }}>
        {/* Photo */}
        <img src={img} alt="Farm field" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.55 }}/>
        {/* Gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg, rgba(14,34,19,.85) 0%, rgba(3,14,5,.75) 100%)' }}/>
        {/* Content */}
        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%', padding:'44px 48px' }}>
          <div>
            <Logo size={44} collapsed/>
            <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:'1.75rem', letterSpacing:'-.04em', color:'white', marginTop:16, marginBottom:6 }}>SmartSeason</h1>
            <p style={{ fontSize:'.875rem', color:'rgba(255,255,255,.5)' }}>Field Agent Portal</p>
          </div>
          <div>
            <blockquote style={{ borderLeft:'3px solid rgba(127,214,122,.6)', paddingLeft:16, marginBottom:24 }}>
              <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.7)', lineHeight:1.6, fontStyle:'italic' }}>
                "SmartSeason keeps me on top of every field — I never miss a harvest window."
              </p>
              <footer style={{ fontSize:'.78rem', color:'rgba(255,255,255,.4)', marginTop:8 }}>— Carol W., Field Agent, Kiambu</footer>
            </blockquote>
            <div style={{ display:'flex', gap:20 }}>
              {[['1,200+','Fields tracked'],['340+','Active agents'],['98%','Uptime']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'white' }}>{v}</div>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Right — form */}
      <div className="auth-right">{children}</div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password) }
    catch (err: any) { setError(err.response?.data?.detail || err.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell image={AUTH_IMAGES[0]}>
      <div className="auth-card anim-up">
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to manage your assigned fields</p>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@farm.com" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input className="form-input" type={showPw?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required/>
              <button type="button" className="input-end-btn" onClick={() => setShowPw(p => !p)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
          </div>
          <div style={{ textAlign:'right', marginTop:-6 }}>
            <Link to="/forgot-password" style={{ fontSize:'.8rem', color:'var(--primary)' }}>Forgot password?</Link>
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading?<><span className="spinner"/>Signing in…</>:'Sign In'}
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
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({...f,[k]:e.target.value}))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await register(form.name, form.email, form.password) }
    catch (err: any) { setError(err.response?.data?.detail || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell image={AUTH_IMAGES[1]}>
      <div className="auth-card anim-up">
        <h2>Create account</h2>
        <p className="auth-sub">Register as a field agent</p>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="Jane Kamau" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="jane@farm.com" required/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input className="form-input" type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 8 characters" required minLength={8}/>
              <button type="button" className="input-end-btn" onClick={() => setShowPw(p => !p)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
            <span className="form-hint">Minimum 8 characters</span>
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading?<><span className="spinner"/>Creating account…</>:'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </AuthShell>
  )
}

// ── Forgot Password ───────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true)
    await api.post('auth/forgot-password', { email }).catch(() => {})
    setSent(true); setLoading(false)
  }
  return (
    <AuthShell image={AUTH_IMAGES[2]}>
      <div className="auth-card anim-up">
        {sent ? (
          <>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📬</div>
            <h2>Check your email</h2>
            <p className="auth-sub">If that address exists, a reset link has been sent. Check your inbox and spam folder.</p>
            <Link to="/login" className="btn btn-primary" style={{ display:'block', textAlign:'center', marginTop:20 }}>Back to Login</Link>
          </>
        ) : (
          <>
            <h2>Reset password</h2>
            <p className="auth-sub">Enter your email and we'll send a reset link.</p>
            <form className="auth-form" onSubmit={submit}>
              <div className="form-group"><label className="form-label">Email address</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@farm.com" required/>
              </div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading?<><span className="spinner"/>Sending…</>:'Send Reset Link'}
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
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('auth/reset-password', { token, new_password: password }); setDone(true) }
    catch (err: any) { setError(err.response?.data?.detail || 'Reset failed') }
    finally { setLoading(false) }
  }

  return (
    <AuthShell image={AUTH_IMAGES[0]}>
      <div className="auth-card anim-up">
        {done ? (
          <>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>✅</div>
            <h2>Password updated</h2>
            <p className="auth-sub">Your password has been reset successfully.</p>
            <Link to="/login" className="btn btn-primary" style={{ display:'block', textAlign:'center', marginTop:20 }}>Sign In</Link>
          </>
        ) : (
          <>
            <h2>Set new password</h2>
            <p className="auth-sub">Enter your new password below.</p>
            {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
            <form className="auth-form" onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrap">
                  <input className="form-input" type={showPw?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8}/>
                  <button type="button" className="input-end-btn" onClick={() => setShowPw(p => !p)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
                </div>
              </div>
              <button className="btn btn-primary auth-submit" disabled={loading}>
                {loading?<><span className="spinner"/>Updating…</>:'Update Password'}
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
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const [status, setStatus] = useState<'loading'|'ok'|'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    api.post('auth/verify-email', { token }).then(() => setStatus('ok')).catch(() => setStatus('error'))
  }, [token])

  return (
    <AuthShell image={AUTH_IMAGES[1]}>
      <div className="auth-card anim-up" style={{ textAlign:'center' }}>
        {status === 'loading' && <><div className="spinner spinner-dark" style={{ width:40, height:40, margin:'0 auto 16px' }}/><p style={{ color:'var(--text-3)' }}>Verifying…</p></>}
        {status === 'ok'      && <><div style={{ fontSize:'3rem' }}>🎉</div><h2 style={{ marginTop:12 }}>Email verified!</h2><p className="auth-sub">Your account is now active.</p><Link to="/dashboard" className="btn btn-primary" style={{ marginTop:20, display:'inline-flex' }}>Go to Dashboard</Link></>}
        {status === 'error'   && <><div style={{ fontSize:'3rem' }}>😕</div><h2 style={{ marginTop:12 }}>Link expired</h2><p className="auth-sub">This link is invalid or expired.</p><Link to="/dashboard" className="btn btn-ghost" style={{ marginTop:20, display:'inline-flex' }}>Go to Dashboard</Link></>}
      </div>
    </AuthShell>
  )
}
