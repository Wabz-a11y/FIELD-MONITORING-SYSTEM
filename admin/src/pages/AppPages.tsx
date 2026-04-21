import { useEffect, useState, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { Plus, Search, Sprout, AlertTriangle, Activity, Users, TrendingUp, Clock, ArrowLeft, MapPin, Calendar, Ruler, X, Edit, Trash2 } from 'lucide-react'
import api from '../lib/api'
import type { Field, FieldUpdate, DashboardStats, User } from '../types'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast, StatCard, StatusBadge, StageBadge, HealthDots, PageHeader, Loading, EmptyState, Avatar } from '../components/ui/index'
import { nairobiDate, nairobiTime, formatDate, timeAgo } from '../lib/time'

const STAGES = ['planted', 'growing', 'ready', 'harvested'] as const
const STAGE_COLORS: Record<string, string> = { planted: '#f59e0b', growing: '#5cb857', ready: '#7C3AED', harvested: '#7c6fa0' }
const STATUS_COLORS: Record<string, string> = { active: '#5cb857', at_risk: '#ef4444', completed: '#9b67e8' }

// ── Dashboard ─────────────────────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState(nairobiTime())
  useEffect(() => {
    api.get('fields/dashboard').then(r => { setStats(r.data); setLoading(false) })
    const t = setInterval(() => setClock(nairobiTime()), 10000)
    return () => clearInterval(t)
  }, [])
  if (loading) return <Loading/>
  if (!stats)  return null
  const stageData  = Object.entries(stats.stage_breakdown).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(stats.status_breakdown).map(([name, value]) => ({ name: name.replace('_', ' '), value, key: name }))
  return (
    <div className="app-page">
      <div className="page-header anim-up">
        <div><h1 className="page-title">Operations Overview</h1><p className="page-subtitle">Welcome back, {user?.name?.split(' ')[0]} · {nairobiDate()}</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '6px 13px', fontSize: '.8rem', color: 'var(--text-3)' }}>
          <Clock size={13}/><span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '.95rem', color: 'var(--text-1)' }}>{clock}</span>
          <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--primary)' }}>EAT</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Fields" value={stats.total_fields}                  icon={<Sprout size={17}/>}       color="var(--primary)"  delay="0ms"/>
        <StatCard label="Active"       value={stats.status_breakdown.active || 0}   icon={<Activity size={17}/>}     color="var(--green)"    delay="50ms" sub={`${stats.total_fields ? Math.round((stats.status_breakdown.active||0)/stats.total_fields*100) : 0}%`}/>
        <StatCard label="At Risk"      value={stats.status_breakdown.at_risk || 0}  icon={<AlertTriangle size={17}/>} color="#ef4444"         delay="100ms"/>
        <StatCard label="Agents"       value={stats.total_agents ?? '—'}            icon={<Users size={17}/>}        color="#9b67e8"         delay="150ms"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card"><div className="card-header"><span className="card-title">Stage Breakdown</span></div>
          <div style={{ padding: '8px 4px 12px' }}>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={stageData} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} cursor={{ fill: 'var(--surface-2)' }}/>
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>{stageData.map(e => <Cell key={e.name} fill={STAGE_COLORS[e.name] || 'var(--primary)'}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card"><div className="card-header"><span className="card-title">Status Distribution</span></div>
          <div style={{ padding: '8px 4px 12px' }}>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={40} paddingAngle={3}>
                  {statusData.map(e => <Cell key={e.key} fill={STATUS_COLORS[e.key] || 'var(--primary)'}/>)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}/>
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">⚠️ At-Risk Fields</span><Link to="/fields?status=at_risk" className="btn btn-sm btn-ghost">View All</Link></div>
          {stats.at_risk_fields.length === 0 ? <EmptyState icon={<Sprout size={22}/>} title="All fields healthy"/> :
            <div className="table-wrap"><table><thead><tr><th>Field</th><th>Crop</th><th>Stage</th><th>Days</th></tr></thead>
              <tbody>{stats.at_risk_fields.map(f => (
                <tr key={f.id}><td><Link to={`/fields/${f.id}`} className="link-primary">{f.name}</Link></td>
                <td style={{ color: 'var(--text-3)', fontSize: '.82rem' }}>{f.crop_type}</td>
                <td><StageBadge stage={f.stage}/></td>
                <td style={{ color: 'var(--text-3)', fontSize: '.82rem' }}>{f.days_since_planted}d</td></tr>
              ))}</tbody></table></div>}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Activity</span></div>
          {stats.recent_updates.length === 0 ? <EmptyState icon={<Activity size={22}/>} title="No updates yet"/> :
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {stats.recent_updates.slice(0, 7).map(u => (
                <div key={u.id} style={{ display: 'flex', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#4e2d9a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{u.agent_name?.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                      <Link to={`/fields/${u.field_id}`} className="link-primary" style={{ fontSize: '.83rem' }}>{u.field_name}</Link>
                      {u.stage && <StageBadge stage={u.stage}/>}
                    </div>
                    <div style={{ fontSize: '.77rem', color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 2 }}>{u.notes.length > 75 ? u.notes.slice(0, 75) + '…' : u.notes}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-3)' }}>{u.agent_name} · {timeAgo(u.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  )
}

// ── Field modal ───────────────────────────────────────────────────
function FieldModal({ field, agents, onClose, onSaved }: { field?: Field; agents: User[]; onClose: () => void; onSaved: (f: Field) => void }) {
  const toast = useToast()
  const [form, setForm] = useState({ name: field?.name||'', crop_type: field?.crop_type||'', planting_date: field?.planting_date ? field.planting_date.slice(0,10) : '', location: field?.location||'', size_hectares: field?.size_hectares?.toString()||'', assigned_agent_id: field?.assigned_agent_id||'', notes: field?.notes||'', stage: field?.stage||'planted' })
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const p: any = { ...form, planting_date: new Date(form.planting_date).toISOString(), size_hectares: form.size_hectares ? parseFloat(form.size_hectares) : undefined, assigned_agent_id: form.assigned_agent_id || undefined }
      const { data } = field ? await api.patch(`fields/${field.id}`, p) : await api.post('fields/', p)
      onSaved(data); toast.show(field ? 'Field updated!' : 'Field created!', 'success')
    } catch (err: any) { toast.show(err.response?.data?.detail || 'Failed', 'error') }
    finally { setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">{field ? 'Edit Field' : 'Create New Field'}</span><button className="btn btn-icon btn-ghost" onClick={onClose}><X size={15}/></button></div>
        <form onSubmit={submit}>
          <div className="modal-grid">
            <div className="form-group"><label className="form-label">Field Name *</label><input className="form-input" value={form.name} onChange={set('name')} placeholder="North Block A" required/></div>
            <div className="form-group"><label className="form-label">Crop Type *</label><input className="form-input" value={form.crop_type} onChange={set('crop_type')} placeholder="Maize, Wheat…" required/></div>
            <div className="form-group"><label className="form-label">Planting Date *</label><input className="form-input" type="date" value={form.planting_date} onChange={set('planting_date')} required/></div>
            <div className="form-group"><label className="form-label">Size (ha)</label><input className="form-input" type="number" step="0.1" value={form.size_hectares} onChange={set('size_hectares')} placeholder="2.5"/></div>
            {field && <div className="form-group"><label className="form-label">Stage</label><select className="form-select" value={form.stage} onChange={set('stage')}>{STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div>}
            <div className="form-group"><label className="form-label">Assign Agent</label><select className="form-select" value={form.assigned_agent_id} onChange={set('assigned_agent_id')}><option value="">— Unassigned —</option>{agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
            <div className="form-group modal-full"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={set('location')} placeholder="GPS or description"/></div>
            <div className="form-group modal-full"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={set('notes')} placeholder="Additional notes…"/></div>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><span className="spinner"/>Saving…</> : (field ? 'Save Changes' : 'Create Field')}</button></div>
        </form>
      </div>
    </div>
  )
}

// ── Fields List ───────────────────────────────────────────────────
export function FieldsPage() {
  const [fields, setFields]   = useState<Field[]>([])
  const [agents, setAgents]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [stageF, setStageF]   = useState('')
  const [statusF, setStatusF] = useState('')
  const [modal, setModal]     = useState<false|'create'|Field>(false)
  const toast = useToast()
  useEffect(() => {
    Promise.all([api.get('fields/'), api.get('users/agents')]).then(([f, a]) => { setFields(f.data); setAgents(a.data); setLoading(false) })
  }, [])
  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try { await api.delete(`fields/${id}`); setFields(f => f.filter(x => x.id !== id)); toast.show(`"${name}" deleted`, 'success') }
    catch { toast.show('Failed to delete', 'error') }
  }
  const filtered = fields.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.crop_type.toLowerCase().includes(search.toLowerCase())) return false
    if (stageF && f.stage !== stageF) return false
    if (statusF && f.status !== statusF) return false
    return true
  })
  return (
    <div className="app-page">
      <PageHeader title="Fields" subtitle={`${fields.length} fields total`} action={<button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16}/>New Field</button>}/>
      <div className="filter-row anim-up">
        <div className="search-box"><Search size={14} className="search-icon"/><input className="search-input" placeholder="Search by name or crop…" value={search} onChange={e => setSearch(e.target.value)}/></div>
        <select className="form-select filter-select" value={stageF} onChange={e => setStageF(e.target.value)}>
          <option value="">All Stages</option>{STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select>
        <select className="form-select filter-select" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All Statuses</option><option value="active">Active</option><option value="at_risk">At Risk</option><option value="completed">Completed</option></select>
      </div>
      {loading ? <Loading/> : filtered.length === 0 ? <EmptyState icon={<Sprout size={24}/>} title={fields.length===0?'No fields yet':'No results'} description={fields.length===0?'Create your first field to get started.':undefined}/> :
        <div className="fields-grid">
          {filtered.map((f, i) => (
            <div key={f.id} className="field-card anim-up" style={{ animationDelay: `${i*35}ms` }}>
              <div className="fc-top">
                <div className="fc-badges"><StatusBadge status={f.status}/><StageBadge stage={f.stage}/></div>
                <div className="fc-actions">
                  <button className="btn btn-icon btn-ghost btn-sm" onClick={() => setModal(f)}><Edit size={13}/></button>
                  <button className="btn btn-icon btn-danger btn-sm" onClick={() => del(f.id, f.name)}><Trash2 size={13}/></button>
                </div>
              </div>
              <Link to={`/fields/${f.id}`}><div className="fc-name">{f.name}</div><div className="fc-crop">{f.crop_type} · {f.days_since_planted}d</div></Link>
              {f.assigned_agent_name && <div className="fc-agent"><div className="fc-avatar">{f.assigned_agent_name.charAt(0)}</div><span>{f.assigned_agent_name}</span></div>}
              <div className="fc-meta"><span>{f.location||'No location'}</span><span>{f.last_update ? timeAgo(f.last_update) : 'No updates'}</span></div>
            </div>
          ))}
        </div>}
      {modal && <FieldModal field={modal==='create'?undefined:modal as Field} agents={agents} onClose={() => setModal(false)} onSaved={f => { setFields(p => modal==='create'?[f,...p]:p.map(x=>x.id===f.id?f:x)); setModal(false) }}/>}
    </div>
  )
}

// ── Field Detail ──────────────────────────────────────────────────
export function FieldDetailPage() {
  const { id } = useParams<{ id: string }>(); const navigate = useNavigate()
  const [field, setField]   = useState<Field|null>(null)
  const [updates, setUpdates] = useState<FieldUpdate[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!id) return
    Promise.all([api.get(`fields/${id}`), api.get(`updates/field/${id}`)]).then(([f, u]) => { setField(f.data); setUpdates(u.data); setLoading(false) })
  }, [id])
  if (loading) return <Loading/>
  if (!field) return <div className="app-page" style={{ color: 'var(--text-3)' }}>Field not found.</div>
  const stepIdx = STAGES.indexOf(field.stage as any)
  return (
    <div className="app-page">
      <button className="back-btn anim-up" onClick={() => navigate('/fields')}><ArrowLeft size={15}/> Back to Fields</button>
      <div className="anim-up anim-d1" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}><StatusBadge status={field.status}/><StageBadge stage={field.stage}/></div>
        <h1 className="page-title">{field.name}</h1>
        <p className="page-subtitle">{field.crop_type}{field.location ? ` · ${field.location}` : ''}</p>
      </div>
      <div className="card anim-up anim-d2" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '18px 22px' }}>
          <div className="stage-progress">
            {STAGES.map((s, i) => (
              <div key={s} className={`stage-step ${i<=stepIdx?'done':''} ${i===stepIdx?'current':''}`}>
                <div className="step-dot">{i<=stepIdx?'✓':''}</div>
                {i < STAGES.length-1 && <div className={`step-line ${i<stepIdx?'done':''}`}/>}
                <span className="step-label">{s.charAt(0).toUpperCase()+s.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="detail-body">
        <div className="card anim-up anim-d3">
          <div className="card-header"><span className="card-title">Field Info</span></div>
          {[
            { icon: <Calendar size={13}/>, lbl: 'Planted', val: formatDate(field.planting_date, 'MMM d, yyyy') },
            { icon: <Calendar size={13}/>, lbl: 'Days in field', val: `${field.days_since_planted} days` },
            field.location ? { icon: <MapPin size={13}/>, lbl: 'Location', val: field.location } : null,
            field.size_hectares ? { icon: <Ruler size={13}/>, lbl: 'Size', val: `${field.size_hectares} ha` } : null,
            field.assigned_agent_name ? { icon: <Users size={13}/>, lbl: 'Agent', val: field.assigned_agent_name } : null,
            { icon: <Clock size={13}/>, lbl: 'Last update', val: field.last_update ? timeAgo(field.last_update) : 'Never' },
          ].filter(Boolean).map((r: any, i) => (
            <div key={i} className="info-row"><span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{r.icon}</span><span className="info-lbl">{r.lbl}</span><span className="info-val">{r.val}</span></div>
          ))}
          {field.notes && <div style={{ padding: '11px 16px', borderTop: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{field.notes}</div>}
        </div>
        <div className="card anim-up anim-d4">
          <div className="card-header">
            <span className="card-title">Update Log</span>
            <span style={{ fontSize: '.72rem', color: 'var(--text-3)', background: 'var(--surface-2)', padding: '2px 9px', borderRadius: 99 }}>{updates.length}</span>
          </div>
          {updates.length === 0 ? <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '.85rem' }}>No updates yet.</div> :
            <div className="update-timeline">
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
    </div>
  )
}

// ── Agents ────────────────────────────────────────────────────────
export function AgentsPage() {
  const [agents, setAgents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('users/agents').then(r => { setAgents(r.data); setLoading(false) }) }, [])
  return (
    <div className="app-page">
      <PageHeader title="Field Agents" subtitle={`${agents.length} registered agent${agents.length!==1?'s':''}`}/>
      {loading ? <Loading/> : agents.length === 0 ? <EmptyState icon={<Users size={24}/>} title="No agents yet" description="Agents will appear here once they register."/> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {agents.map(a => (
            <div key={a.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar initials={a.avatar_initials} size={42} color="linear-gradient(135deg,var(--primary),#4e2d9a)"/>
                <div><div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '.95rem' }}>{a.name}</div><div style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{a.email}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.68rem', fontWeight: 700, background: a.email_verified?'var(--green-100)':'#fef3c7', color: a.email_verified?'var(--green-dark)':'#92400e', padding: '2px 9px', borderRadius: 99 }}>{a.email_verified?'✓ Verified':'⚠ Unverified'}</span>
              </div>
              {a.phone && <div style={{ fontSize: '.78rem', color: 'var(--text-2)', marginTop: 8 }}>📞 {a.phone}</div>}
              {a.bio   && <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>"{a.bio}"</div>}
            </div>
          ))}
        </div>}
    </div>
  )
}

// ── Profile ───────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, refresh } = useAuth(); const toast = useToast()
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', bio: user?.bio||'', notif_pref: user?.notif_pref||'both' })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' })
  const [saving, setSaving] = useState(false)
  const set   = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => setForm(f => ({...f,[k]:e.target.value}))
  const setPw = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setPwForm(f => ({...f,[k]:e.target.value}))
  const saveProfile = async (e: FormEvent) => { e.preventDefault(); setSaving(true); try { await api.patch('profile/',form); await refresh(); toast.show('Saved!','success') } catch(err:any){toast.show(err.response?.data?.detail||'Failed','error')} finally{setSaving(false)} }
  const changePw = async (e: FormEvent) => { e.preventDefault(); try { await api.post('profile/change-password',pwForm); toast.show('Password changed!','success'); setPwForm({current_password:'',new_password:''}) } catch(err:any){toast.show(err.response?.data?.detail||'Failed','error')} }
  const resend = async () => { try{await api.post('auth/resend-verification');toast.show('Verification email sent!','info')}catch{toast.show('Failed','error')} }
  return (
    <div className="app-page" style={{ maxWidth: 680 }}>
      <PageHeader title="My Profile" subtitle="Manage your account details"/>
      {!user?.email_verified && <div className="alert alert-warning" style={{ marginBottom: 20 }}>⚠️ Email not verified.&nbsp;<button style={{ color:'var(--primary)',fontWeight:600,background:'none',border:'none',cursor:'pointer',padding:0 }} onClick={resend}>Resend</button></div>}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <Avatar initials={user?.avatar_initials||'?'} size={58} color="linear-gradient(135deg,var(--primary),#4e2d9a)"/>
        <div><div style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:'1.15rem' }}>{user?.name}</div><div style={{ fontSize:'.82rem',color:'var(--text-3)',margin:'2px 0 5px' }}>{user?.email}</div><span style={{ fontSize:'.68rem',fontWeight:700,background:'var(--purple-100)',color:'var(--purple-700)',padding:'2px 9px',borderRadius:99 }}>{user?.email_verified?'✓ Verified':'⚠ Unverified'} · Coordinator</span></div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><span className="card-title">Personal Details</span></div>
        <div className="card-body">
          <form onSubmit={saveProfile} style={{ display:'flex',flexDirection:'column',gap:13 }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} required/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000"/></div>
            </div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={form.bio} onChange={set('bio')} rows={3}/></div>
            <div className="form-group"><label className="form-label">Notification Preference</label><select className="form-select" value={form.notif_pref} onChange={set('notif_pref')}><option value="inapp">In-app only</option><option value="email">Email only</option><option value="both">Both</option></select></div>
            <div><button className="btn btn-primary" disabled={saving}>{saving?<><span className="spinner"/>Saving…</>:'Save Changes'}</button></div>
          </form>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Change Password</span></div>
        <div className="card-body">
          <form onSubmit={changePw} style={{ display:'flex',flexDirection:'column',gap:13 }}>
            <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={pwForm.current_password} onChange={setPw('current_password')} required/></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={pwForm.new_password} onChange={setPw('new_password')} required minLength={8}/></div>
            <div><button className="btn btn-primary">Change Password</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────────────────────────
export function SettingsPage() {
  const { theme, setTheme } = useTheme(); const { user, logout } = useAuth(); const toast = useToast(); const navigate = useNavigate()
  const [notifPref, setNotifPref] = useState(user?.notif_pref||'both'); const [deleting, setDeleting] = useState(false)
  const saveNotif = async () => { try{await api.patch('profile/',{notif_pref:notifPref});toast.show('Saved!','success')}catch{toast.show('Failed','error')} }
  const deleteAccount = async () => { if(!confirm('Delete account permanently?'))return; setDeleting(true); try{await api.delete('profile/account');logout();navigate('/login')}catch{toast.show('Failed','error');setDeleting(false)} }
  const TO = ({ v,l,e }: { v:typeof theme;l:string;e:string }) => <button onClick={()=>setTheme(v)} style={{ flex:1,padding:'12px 8px',border:`2px solid ${theme===v?'var(--primary)':'var(--border)'}`,borderRadius:'var(--radius-sm)',background:theme===v?'var(--surface-3)':'var(--surface)',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:5,transition:'all .15s' }}><span style={{fontSize:'1.3rem'}}>{e}</span><span style={{fontSize:'.78rem',fontWeight:700,color:theme===v?'var(--primary)':'var(--text-2)'}}>{l}</span></button>
  return (
    <div className="app-page" style={{ maxWidth: 600 }}>
      <PageHeader title="Settings" subtitle="Preferences and account"/>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><span className="card-title">Appearance</span></div>
        <div className="card-body"><p style={{ fontSize:'.85rem',color:'var(--text-3)',marginBottom:14 }}>Choose how SmartSeason looks to you.</p><div style={{ display:'flex',gap:10 }}><TO v="light" l="Light" e="☀️"/><TO v="system" l="System" e="💻"/><TO v="dark" l="Dark" e="🌙"/></div></div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><span className="card-title">Notifications</span></div>
        <div className="card-body">
          <p style={{ fontSize:'.85rem',color:'var(--text-3)',marginBottom:14 }}>Choose how you receive alerts.</p>
          <div style={{ display:'flex',flexDirection:'column',gap:9,marginBottom:16 }}>
            {[{v:'inapp',l:'In-app only',d:'Notifications inside SmartSeason only.'},{v:'email',l:'Email only',d:'Alerts by email only.'},{v:'both',l:'Both',d:'In-app and email notifications.'}].map(o=>(
              <label key={o.v} style={{ display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',border:`1.5px solid ${notifPref===o.v?'var(--primary)':'var(--border)'}`,borderRadius:'var(--radius-sm)',background:notifPref===o.v?'var(--surface-3)':'var(--surface)',cursor:'pointer' }}>
                <input type="radio" name="notif" value={o.v} checked={notifPref===o.v} onChange={()=>setNotifPref(o.v as any)} style={{marginTop:2}}/>
                <div><div style={{fontWeight:700,fontSize:'.875rem'}}>{o.l}</div><div style={{fontSize:'.77rem',color:'var(--text-3)'}}>{o.d}</div></div>
              </label>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={saveNotif}>Save Preference</button>
        </div>
      </div>
      <div className="card" style={{ border:'1.5px solid #fecaca' }}>
        <div className="card-header" style={{ background:'#fef2f2' }}><span className="card-title" style={{ color:'var(--red)' }}>⚠️ Danger Zone</span></div>
        <div className="card-body"><p style={{ fontSize:'.875rem',color:'var(--text-2)',marginBottom:14 }}>Permanently delete your account and all associated data.</p><button className="btn btn-danger" onClick={deleteAccount} disabled={deleting}>{deleting?<><span className="spinner"/>Deleting…</>:'Delete My Account'}</button></div>
      </div>
    </div>
  )
}
