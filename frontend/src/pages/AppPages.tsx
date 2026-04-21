import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Search, Sprout, AlertTriangle, Activity, CheckCircle2, Clock, ArrowLeft, MapPin, Calendar, Ruler, X } from 'lucide-react'
import api from '../lib/api'
import type { Field, FieldUpdate, DashboardStats } from '../types'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast, StatCard, StatusBadge, StageBadge, HealthDots, PageHeader, Loading, EmptyState, Avatar } from '../components/ui/index'
import { nairobiDate, nairobiTime, formatDate, timeAgo } from '../lib/time'

const STAGES = ['planted', 'growing', 'ready', 'harvested'] as const

// ── Dashboard ─────────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [clock, setClock]   = useState(nairobiTime())

  useEffect(() => {
    api.get('fields/dashboard').then(r => { setStats(r.data); setLoading(false) })
    const t = setInterval(() => setClock(nairobiTime()), 10000)
    return () => clearInterval(t)
  }, [])

  if (loading) return <Loading/>
  if (!stats)  return null

  return (
    <div className="app-page">
      <div className="page-header anim-up">
        <div>
          <h1 className="page-title">My Fields</h1>
          <p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} · {nairobiDate()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '6px 13px', fontSize: '.8rem', color: 'var(--text-3)' }}>
          <Clock size={13}/><span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '.95rem', color: 'var(--text-1)' }}>{clock}</span>
          <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--primary)' }}>EAT</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard label="Assigned"  value={stats.total_fields}                 icon={<Sprout size={17}/>}       color="var(--primary)"  delay="0ms"/>
        <StatCard label="Active"    value={stats.status_breakdown.active || 0}  icon={<Activity size={17}/>}     color="var(--green)"    delay="50ms"/>
        <StatCard label="At Risk"   value={stats.status_breakdown.at_risk || 0} icon={<AlertTriangle size={17}/>} color="#ef4444"         delay="100ms"/>
        <StatCard label="Completed" value={stats.status_breakdown.completed||0} icon={<CheckCircle2 size={17}/>} color="var(--purple)"   delay="150ms"/>
      </div>

      {stats.at_risk_fields.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius)', padding: '13px 16px', marginBottom: 20, fontSize: '.875rem', color: '#92400e' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
          <div>
            <strong>{stats.at_risk_fields.length} field{stats.at_risk_fields.length > 1 ? 's' : ''} need attention</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 7 }}>
              {stats.at_risk_fields.map(f => (
                <Link key={f.id} to={`/fields/${f.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,.12)', padding: '3px 10px', borderRadius: 99, fontSize: '.78rem', fontWeight: 600, color: '#92400e' }}>
                  {f.name} <StageBadge stage={f.stage}/>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card anim-up anim-d2">
        <div className="card-header">
          <span className="card-title">Recent Updates</span>
          <Link to="/fields" className="btn btn-sm btn-ghost">All Fields →</Link>
        </div>
        {stats.recent_updates.length === 0
          ? <EmptyState icon={<Activity size={22}/>} title="No updates yet" description="Log your first field observation."/>
          : <div className="activity-feed">
              {stats.recent_updates.slice(0, 7).map(u => (
                <Link to={`/fields/${u.field_id}`} key={u.id} className="activity-item">
                  <div className="activity-avatar">{u.agent_name?.charAt(0).toUpperCase() || '?'}</div>
                  <div className="activity-body">
                    <div className="activity-top">
                      <span className="activity-field">{u.field_name}</span>
                      {u.stage && <StageBadge stage={u.stage}/>}
                      {u.health_score != null && <HealthDots score={u.health_score}/>}
                    </div>
                    <p className="activity-note">{u.notes.length > 80 ? u.notes.slice(0, 80) + '…' : u.notes}</p>
                    <div className="activity-meta">{u.agent_name} · {timeAgo(u.created_at)}</div>
                  </div>
                </Link>
              ))}
            </div>}
      </div>
    </div>
  )
}

// ── Fields List ───────────────────────────────────────────────────
export function FieldsPage() {
  const [fields, setFields]   = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [stageF, setStageF]   = useState('')
  const [statusF, setStatusF] = useState('')

  useEffect(() => { api.get('fields/').then(r => { setFields(r.data); setLoading(false) }) }, [])

  const filtered = fields.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.crop_type.toLowerCase().includes(search.toLowerCase())) return false
    if (stageF  && f.stage  !== stageF)  return false
    if (statusF && f.status !== statusF) return false
    return true
  })

  return (
    <div className="app-page">
      <PageHeader title="My Fields" subtitle={`${fields.length} field${fields.length !== 1 ? 's' : ''} assigned to you`}/>
      <div className="filter-row anim-up">
        <div className="search-box">
          <Search size={14} className="search-icon"/>
          <input className="search-input" placeholder="Search fields or crops…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="form-select filter-select" value={stageF} onChange={e => setStageF(e.target.value)}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="form-select filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option><option value="at_risk">At Risk</option><option value="completed">Completed</option>
        </select>
      </div>
      {loading ? <Loading/> : filtered.length === 0
        ? <EmptyState icon={<Sprout size={24}/>} title={fields.length === 0 ? 'No fields assigned' : 'No matches'} description={fields.length === 0 ? 'Your coordinator will assign fields to you.' : undefined}/>
        : <div className="fields-grid">
            {filtered.map((f, i) => (
              <Link key={f.id} to={`/fields/${f.id}`} className="field-card anim-up" style={{ animationDelay: `${i * 35}ms` }}>
                <div className="fc-top">
                  <div className="fc-badges"><StatusBadge status={f.status}/><StageBadge stage={f.stage}/></div>
                  <span className="fc-days">{f.days_since_planted}d</span>
                </div>
                <div className="fc-name">{f.name}</div>
                <div className="fc-crop">{f.crop_type}{f.location ? ` · ${f.location}` : ''}</div>
                <div className="fc-meta">
                  {f.size_hectares && <span>{f.size_hectares} ha</span>}
                  <span>{f.last_update ? timeAgo(f.last_update) : 'No updates yet'}</span>
                </div>
              </Link>
            ))}
          </div>}
    </div>
  )
}

// ── Field Detail ──────────────────────────────────────────────────
function AddUpdateModal({ fieldId, onClose, onAdded }: { fieldId: string; onClose: () => void; onAdded: (u: FieldUpdate) => void }) {
  const toast = useToast()
  const [form, setForm] = useState({ notes: '', stage: '', health_score: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const p: any = { field_id: fieldId, notes: form.notes }
      if (form.stage) p.stage = form.stage
      if (form.health_score) p.health_score = parseInt(form.health_score)
      const { data } = await api.post('updates/', p)
      onAdded(data); toast.show('Update logged!', 'success')
    } catch (err: any) { toast.show(err.response?.data?.detail || 'Failed', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Log Field Update</span>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={15}/></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Observations *</label>
            <textarea className="form-textarea" value={form.notes} onChange={set('notes')} rows={4} placeholder="Crop height, pest activity, irrigation status, any concerns…" required/>
          </div>
          <div className="modal-grid">
            <div className="form-group">
              <label className="form-label">Update Stage</label>
              <select className="form-select" value={form.stage} onChange={set('stage')}>
                <option value="">— No change —</option>
                {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Health Score (1–10)</label>
              <input className="form-input" type="number" min={1} max={10} value={form.health_score} onChange={set('health_score')} placeholder="e.g. 8"/>
              <span className="form-hint">1 = Critical · 10 = Excellent</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"/>Saving…</> : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function FieldDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [field, setField]       = useState<Field | null>(null)
  const [updates, setUpdates]   = useState<FieldUpdate[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([api.get(`fields/${id}`), api.get(`updates/field/${id}`)])
      .then(([f, u]) => { setField(f.data); setUpdates(u.data); setLoading(false) })
  }, [id])

  if (loading) return <Loading/>
  if (!field)  return <div className="app-page" style={{ color: 'var(--text-3)' }}>Field not found.</div>

  const stepIdx = STAGES.indexOf(field.stage as any)

  return (
    <div className="app-page">
      <button className="back-btn anim-up" onClick={() => navigate('/fields')}><ArrowLeft size={15}/> Back to Fields</button>

      <div className="anim-up anim-d1" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}><StatusBadge status={field.status}/><StageBadge stage={field.stage}/></div>
        <h1 className="page-title">{field.name}</h1>
        <p className="page-subtitle">{field.crop_type}{field.location ? ` · ${field.location}` : ''}</p>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setShowModal(true)}><Plus size={15}/> Log Update</button>
      </div>

      <div className="card anim-up anim-d2" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '18px 22px' }}>
          <div className="stage-progress">
            {STAGES.map((s, i) => (
              <div key={s} className={`stage-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                <div className="step-dot">{i <= stepIdx ? '✓' : ''}</div>
                {i < STAGES.length - 1 && <div className={`step-line ${i < stepIdx ? 'done' : ''}`}/>}
                <span className="step-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="card anim-up anim-d3">
          <div className="card-header"><span className="card-title">Field Info</span></div>
          {[
            { icon: <Calendar size={13}/>, lbl: 'Planted',      val: formatDate(field.planting_date, 'MMM d, yyyy') },
            { icon: <Calendar size={13}/>, lbl: 'Days in field', val: `${field.days_since_planted} days` },
            field.location      ? { icon: <MapPin size={13}/>, lbl: 'Location', val: field.location } : null,
            field.size_hectares ? { icon: <Ruler size={13}/>,  lbl: 'Size',     val: `${field.size_hectares} ha` } : null,
            { icon: <Clock size={13}/>,    lbl: 'Last update', val: field.last_update ? timeAgo(field.last_update) : 'Never' },
          ].filter(Boolean).map((r: any, i) => (
            <div key={i} className="info-row">
              <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{r.icon}</span>
              <span className="info-lbl">{r.lbl}</span>
              <span className="info-val">{r.val}</span>
            </div>
          ))}
          {field.notes && <div style={{ padding: '11px 16px', borderTop: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{field.notes}</div>}
        </div>

        <div className="card anim-up anim-d4">
          <div className="card-header">
            <span className="card-title">Update Log</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '.72rem', color: 'var(--text-3)', background: 'var(--surface-2)', padding: '2px 9px', borderRadius: 99 }}>{updates.length}</span>
              <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}><Plus size={13}/> Log</button>
            </div>
          </div>
          {updates.length === 0
            ? <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '.85rem' }}>No updates yet. Tap <strong>Log Update</strong> to start.</div>
            : <div className="update-timeline">
                {updates.map(u => (
                  <div key={u.id} className="update-entry">
                    <div className="update-dot"/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="update-meta">
                        <span className="update-agent">{u.agent_name}</span>
                        {u.stage && <StageBadge stage={u.stage}/>}
                        {u.health_score != null && <HealthDots score={u.health_score}/>}
                        <span className="update-time">{timeAgo(u.created_at)}</span>
                      </div>
                      <p className="update-notes">{u.notes}</p>
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      </div>

      {showModal && (
        <AddUpdateModal fieldId={field.id} onClose={() => setShowModal(false)}
          onAdded={u => {
            setUpdates(p => [u, ...p])
            if (u.stage) setField(p => p ? { ...p, stage: u.stage! } : p)
            setShowModal(false)
          }}/>
      )}
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, refresh } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', bio: user?.bio||'', notif_pref: user?.notif_pref||'both' })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const set   = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setPw = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setPwForm(f => ({ ...f, [k]: e.target.value }))

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { await api.patch('profile/', form); await refresh(); toast.show('Profile saved!', 'success') }
    catch (err: any) { toast.show(err.response?.data?.detail || 'Failed', 'error') }
    finally { setSaving(false) }
  }

  const changePw = async (e: FormEvent) => {
    e.preventDefault()
    try { await api.post('profile/change-password', pwForm); toast.show('Password changed!', 'success'); setPwForm({ current_password: '', new_password: '' }) }
    catch (err: any) { toast.show(err.response?.data?.detail || 'Failed', 'error') }
  }

  const resend = async () => {
    try { await api.post('auth/resend-verification'); toast.show('Verification email sent!', 'info') }
    catch { toast.show('Failed to send', 'error') }
  }

  return (
    <div className="app-page" style={{ maxWidth: 680 }}>
      <PageHeader title="My Profile" subtitle="Manage your account details"/>
      {!user?.email_verified && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          ⚠️ Email not verified.&nbsp;
          <button style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={resend}>Resend verification</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <Avatar initials={user?.avatar_initials||'?'} size={58}/>
        <div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.15rem' }}>{user?.name}</div>
          <div style={{ fontSize: '.82rem', color: 'var(--text-3)', margin: '2px 0 5px' }}>{user?.email}</div>
          <span style={{ fontSize: '.68rem', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-dark)', padding: '2px 9px', borderRadius: 99 }}>
            {user?.email_verified ? '✓ Verified' : '⚠ Unverified'} · Field Agent
          </span>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">Personal Details</span></div>
        <div className="card-body">
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} required/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000"/></div>
            </div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={form.bio} onChange={set('bio')} rows={3} placeholder="A short bio…"/></div>
            <div className="form-group">
              <label className="form-label">Notification Preference</label>
              <select className="form-select" value={form.notif_pref} onChange={set('notif_pref')}>
                <option value="inapp">In-app only</option>
                <option value="email">Email only</option>
                <option value="both">Both in-app and email</option>
              </select>
            </div>
            <div><button className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner"/>Saving…</> : 'Save Changes'}</button></div>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Change Password</span></div>
        <div className="card-body">
          <form onSubmit={changePw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={pwForm.current_password} onChange={setPw('current_password')} required/></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={pwForm.new_password} onChange={setPw('new_password')} required minLength={8}/><span className="form-hint">Minimum 8 characters</span></div>
            <div><button className="btn btn-primary">Change Password</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────
export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [notifPref, setNotifPref] = useState(user?.notif_pref || 'both')
  const [deleting, setDeleting] = useState(false)

  const saveNotif = async () => {
    try { await api.patch('profile/', { notif_pref: notifPref }); toast.show('Preference saved!', 'success') }
    catch { toast.show('Failed', 'error') }
  }

  const deleteAccount = async () => {
    if (!confirm('Permanently delete your account? This cannot be undone.')) return
    setDeleting(true)
    try { await api.delete('profile/account'); logout(); navigate('/') }
    catch { toast.show('Failed to delete account', 'error'); setDeleting(false) }
  }

  const ThemeOpt = ({ v, l, e }: { v: typeof theme; l: string; e: string }) => (
    <button onClick={() => setTheme(v)} style={{ flex: 1, padding: '12px 8px', border: `2px solid ${theme===v?'var(--primary)':'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: theme===v?'var(--surface-3)':'var(--surface)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all .15s' }}>
      <span style={{ fontSize: '1.3rem' }}>{e}</span>
      <span style={{ fontSize: '.78rem', fontWeight: 700, color: theme===v?'var(--primary)':'var(--text-2)' }}>{l}</span>
    </button>
  )

  return (
    <div className="app-page" style={{ maxWidth: 600 }}>
      <PageHeader title="Settings" subtitle="Preferences and account"/>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><span className="card-title">Appearance</span></div>
        <div className="card-body">
          <p style={{ fontSize: '.85rem', color: 'var(--text-3)', marginBottom: 14 }}>Choose how SmartSeason looks to you.</p>
          <div style={{ display: 'flex', gap: 10 }}><ThemeOpt v="light" l="Light" e="☀️"/><ThemeOpt v="system" l="System" e="💻"/><ThemeOpt v="dark" l="Dark" e="🌙"/></div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><span className="card-title">Notifications</span></div>
        <div className="card-body">
          <p style={{ fontSize: '.85rem', color: 'var(--text-3)', marginBottom: 14 }}>Choose how you receive alerts.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
            {[{v:'inapp',l:'In-app only',d:'See notifications inside SmartSeason only.'},{v:'email',l:'Email only',d:'Receive alerts by email only.'},{v:'both',l:'Both',d:'In-app and email notifications.'}].map(o => (
              <label key={o.v} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', border: `1.5px solid ${notifPref===o.v?'var(--primary)':'var(--border)'}`, borderRadius: 'var(--radius-sm)', background: notifPref===o.v?'var(--surface-3)':'var(--surface)', cursor: 'pointer' }}>
                <input type="radio" name="notif" value={o.v} checked={notifPref===o.v} onChange={() => setNotifPref(o.v as any)} style={{ marginTop: 2 }}/>
                <div><div style={{ fontWeight: 700, fontSize: '.875rem' }}>{o.l}</div><div style={{ fontSize: '.77rem', color: 'var(--text-3)' }}>{o.d}</div></div>
              </label>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveNotif}>Save Preference</button>
        </div>
      </div>
      <div className="card" style={{ border: '1.5px solid #fecaca' }}>
        <div className="card-header" style={{ background: '#fef2f2' }}><span className="card-title" style={{ color: 'var(--red)' }}>⚠️ Danger Zone</span></div>
        <div className="card-body">
          <p style={{ fontSize: '.875rem', color: 'var(--text-2)', marginBottom: 14 }}>Deleting your account is permanent. All data will be removed.</p>
          <button className="btn btn-danger" onClick={deleteAccount} disabled={deleting}>{deleting?<><span className="spinner"/>Deleting…</>:'Delete My Account'}</button>
        </div>
      </div>
    </div>
  )
}
