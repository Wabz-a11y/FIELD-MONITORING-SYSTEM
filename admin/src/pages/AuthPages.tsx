import { useState, FormEvent, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import api from '../lib/api'

const AUTH_IMAGES = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=80',
  'https://images.unsplash.com/photo-1595855759920-86582396756a?w=900&q=80',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=900&q=80',
]

function AuthShell({ children, image }: { children: React.ReactNode; image?: string }) {
  const img = image || AUTH_IMAGES[0]
  return (
    <div className="auth-shell">
      <div className="auth-left" style={{ padding:0, overflow:'hidden' }}>
        <img src={img} alt="Farm" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.45 }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,rgba(20,10,60,.88) 0%,rgba(10,5,30,.78) 100%)' }}/>
        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%', padding:'44px 48px' }}>
          <div>
            <Logo size={44} collapsed/>
            <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:900, fontSize:'1.75rem', letterSpacing:'-.04em', color:'white', marginTop:16, marginBottom:6 }}>SmartSeason</h1>
            <p style={{ fontSize:'.875rem', color:'rgba(255,255,255,.5)' }}>Admin Dashboard</p>
          </div>
          <div>
            <blockquote style={{ borderLeft:'3px solid rgba(108,63,197,.7)', paddingLeft:16, marginBottom:24 }}>
              <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.7)', lineHeight:1.6, fontStyle:'italic' }}>
                "Full visibility across all our fields in one place. We've never missed an at-risk crop since."
              </p>
              <footer style={{ fontSize:'.78rem', color:'rgba(255,255,255,.4)', marginTop:8 }}>— Alice K., Farm Coordinator, Nairobi</footer>
            </blockquote>
            <div style={{ display:'flex', gap:20 }}>
              {[['1,200+','Fields monitored'],['340+','Agents managed'],['98%','Platform uptime']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.1rem', color:'white' }}>{v}</div>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.4)', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right">{children}</div>
    </div>
  )
}

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
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
        <p className="auth-sub">Sign in to your coordinator account</p>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group"><label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@farm.com" required/></div>
          <div className="form-group"><label className="form-label">Password</label>
            <div className="input-wrap">
              <input className="form-input" type={showPw?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required/>
              <button type="button" className="input-end-btn" onClick={() => setShowPw(p=>!p)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div></div>
          <div style={{ textAlign:'right', marginTop:-6 }}>
            <Link to="/forgot-password" style={{ fontSize:'.8rem', color:'var(--primary)' }}>Forgot password?</Link>
          </div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading?<><span className="spinner"/>Signing in…</>:'Sign In'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm]     = useState({ name:'', email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}))
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
        <p className="auth-sub">Set up your coordinator account</p>
        {error && <div className="alert alert-error" style={{ marginBottom:16 }}>{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} placeholder="Jane Smith" required/></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="jane@farm.com" required/></div>
          <div className="form-group"><label className="form-label">Password</label>
            <div className="input-wrap">
              <input className="form-input" type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 8 characters" required minLength={8}/>
              <button type="button" className="input-end-btn" onClick={() => setShowPw(p=>!p)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
            <span className="form-hint">Minimum 8 characters</span></div>
          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading?<><span className="spinner"/>Creating…</>:'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail]   = useState(''); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false)
  const submit = async (e: FormEvent) => { e.preventDefault(); setLoading(true); await api.post('auth/forgot-password',{email}).catch(()=>{}); setSent(true); setLoading(false) }
  return (
    <AuthShell image={AUTH_IMAGES[2]}>
      <div className="auth-card anim-up">
        {sent ? (<><div style={{fontSize:'2.5rem',marginBottom:12}}>📬</div><h2>Check your email</h2><p className="auth-sub">If that address exists, a reset link has been sent.</p><Link to="/login" className="btn btn-primary" style={{display:'block',textAlign:'center',marginTop:20}}>Back to Login</Link></>) : (
          <><h2>Reset password</h2><p className="auth-sub">Enter your email for a reset link.</p>
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <button className="btn btn-primary auth-submit" disabled={loading}>{loading?<><span className="spinner"/>Sending…</>:'Send Reset Link'}</button>
          </form>
          <p className="auth-switch"><Link to="/login">← Back to login</Link></p></>
        )}
      </div>
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const [sp] = useSearchParams(); const token = sp.get('token')||''
  const [password, setPassword] = useState(''); const [showPw,setShowPw] = useState(false)
  const [done, setDone] = useState(false); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('auth/reset-password',{token,new_password:password}); setDone(true) }
    catch (err: any) { setError(err.response?.data?.detail||'Reset failed') }
    finally { setLoading(false) }
  }
  return (
    <AuthShell image={AUTH_IMAGES[0]}>
      <div className="auth-card anim-up">
        {done ? (<><div style={{fontSize:'2.5rem',marginBottom:12}}>✅</div><h2>Password updated</h2><p className="auth-sub">Your password has been reset.</p><Link to="/login" className="btn btn-primary" style={{display:'block',textAlign:'center',marginTop:20}}>Sign In</Link></>) : (
          <><h2>Set new password</h2><p className="auth-sub">Enter your new password.</p>
          {error && <div className="alert alert-error" style={{marginBottom:16}}>{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group"><label className="form-label">New Password</label>
              <div className="input-wrap">
                <input className="form-input" type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/>
                <button type="button" className="input-end-btn" onClick={()=>setShowPw(p=>!p)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div></div>
            <button className="btn btn-primary auth-submit" disabled={loading}>{loading?<><span className="spinner"/>Updating…</>:'Update Password'}</button>
          </form></>
        )}
      </div>
    </AuthShell>
  )
}

export function VerifyEmailPage() {
  const [sp] = useSearchParams(); const token = sp.get('token')||''
  const [status, setStatus] = useState<'loading'|'ok'|'error'>('loading')
  useEffect(() => { if (!token){setStatus('error');return}; api.post('auth/verify-email',{token}).then(()=>setStatus('ok')).catch(()=>setStatus('error')) },[token])
  return (
    <AuthShell image={AUTH_IMAGES[1]}>
      <div className="auth-card anim-up" style={{textAlign:'center'}}>
        {status==='loading'&&<><div className="spinner spinner-dark" style={{width:40,height:40,margin:'0 auto 16px'}}/><p style={{color:'var(--text-3)'}}>Verifying…</p></>}
        {status==='ok'    &&<><div style={{fontSize:'3rem'}}>🎉</div><h2 style={{marginTop:12}}>Email verified!</h2><p className="auth-sub">Your account is now active.</p><Link to="/dashboard" className="btn btn-primary" style={{marginTop:20,display:'inline-flex'}}>Go to Dashboard</Link></>}
        {status==='error' &&<><div style={{fontSize:'3rem'}}>😕</div><h2 style={{marginTop:12}}>Link expired</h2><p className="auth-sub">This link is invalid or expired.</p><Link to="/dashboard" className="btn btn-ghost" style={{marginTop:20,display:'inline-flex'}}>Go to Dashboard</Link></>}
      </div>
    </AuthShell>
  )
}
