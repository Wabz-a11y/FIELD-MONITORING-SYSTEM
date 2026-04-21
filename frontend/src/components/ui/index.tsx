import { useState, useEffect, useRef, createContext, useContext, useCallback, ReactNode } from 'react'
import type { FieldStage, FieldStatus } from '../../types'
import { AlertTriangle, CheckCircle2, Leaf, Sprout, Sun, Archive, TrendingUp, CheckCheck, Bell, X, Info } from 'lucide-react'

// ── Badges ────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: FieldStatus }) {
  const m = { active: { l: 'Active', i: <Leaf size={10}/> }, at_risk: { l: 'At Risk', i: <AlertTriangle size={10}/> }, completed: { l: 'Completed', i: <CheckCircle2 size={10}/> } }
  return <span className={`badge badge-${status}`}>{m[status].i} {m[status].l}</span>
}

export function StageBadge({ stage }: { stage: FieldStage }) {
  const m = { planted: { l: 'Planted', i: <Sprout size={10}/> }, growing: { l: 'Growing', i: <Leaf size={10}/> }, ready: { l: 'Ready', i: <Sun size={10}/> }, harvested: { l: 'Harvested', i: <Archive size={10}/> } }
  return <span className={`badge badge-${stage}`}>{m[stage].i} {m[stage].l}</span>
}

// ── Health Dots ───────────────────────────────────────────────────
export function HealthDots({ score }: { score: number }) {
  const cls = score <= 4 ? 'h-red' : score <= 6 ? 'h-amber' : 'h-green'
  return (
    <div className="health-dots">
      {Array.from({ length: 10 }).map((_, i) => <span key={i} className={`health-dot ${i < score ? cls : ''}`}/>)}
      <span className="health-score">{score}/10</span>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color = 'var(--primary)', icon, delay }: {
  label: string; value: number|string; sub?: string; color?: string; icon?: ReactNode; delay?: string
}) {
  return (
    <div className="stat-card anim-up" style={{ '--c': color, animationDelay: delay } as React.CSSProperties}>
      <div className="stat-card-top">
        <div className="stat-card-icon" style={{ background: `${color}1a`, color }}>{icon || <TrendingUp size={17}/>}</div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="page-header anim-up">
      <div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32, color }: { initials: string; size?: number; color?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: color || 'linear-gradient(135deg,var(--green),var(--green-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: size * 0.34, color: 'white' }}>
      {initials}
    </div>
  )
}

// ── Loading / Empty ───────────────────────────────────────────────
export function Loading() { return <div className="page-loader"><div className="spinner spinner-dark"/></div> }

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || <Sprout size={22}/>}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────
type ToastType = 'success'|'error'|'warning'|'info'
interface IToast { id: number; message: string; type: ToastType }
interface ToastCtx { show: (msg: string, type?: ToastType) => void }
const ToastCtx = createContext<ToastCtx>({ show: () => {} })
let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([])
  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_id
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3600)
  }, [])
  const remove = (id: number) => setToasts(t => t.filter(x => x.id !== id))
  const icons = { success: <CheckCircle2 size={15}/>, error: <AlertTriangle size={15}/>, warning: <AlertTriangle size={15}/>, info: <Info size={15}/> }
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{icons[t.type]}</span>
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => remove(t.id)}><X size={13}/></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => useContext(ToastCtx)

// ── Notifications Panel ───────────────────────────────────────────
import type { Notification } from '../../types'
import api from '../../lib/api'
import { timeAgo } from '../../lib/time'

const typeIcon: Record<string, string> = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '🔴' }

export function NotificationsPanel({ open, onClose, onRead }: { open: boolean; onClose: () => void; onRead: () => void }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.get('notifications/').then(r => { setNotifs(r.data); setLoading(false) })
  }, [open])

  const markRead = async (id: string) => {
    await api.patch(`notifications/${id}/read`)
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x)); onRead()
  }
  const markAll = async () => {
    await api.patch('notifications/read-all')
    setNotifs(n => n.map(x => ({ ...x, read: true }))); onRead()
  }

  if (!open) return null
  return (
    <div className="notif-panel-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={e => e.stopPropagation()}>
        <div className="notif-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={15}/>
            <span className="notif-panel-title">Notifications</span>
            {notifs.filter(n => !n.read).length > 0 && <span className="notif-unread-chip">{notifs.filter(n=>!n.read).length}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={markAll}><CheckCheck size={13}/> All read</button>
            <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={15}/></button>
          </div>
        </div>
        <div className="notif-list">
          {loading && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: '.85rem' }}>Loading…</div>}
          {!loading && notifs.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
              <Bell size={28} style={{ opacity: .25, display: 'block', margin: '0 auto 10px' }}/>No notifications yet
            </div>
          )}
          {notifs.map(n => (
            <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => !n.read && markRead(n.id)}>
              <span className="notif-emoji">{typeIcon[n.type]||'ℹ️'}</span>
              <div className="notif-body">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-msg">{n.message}</div>
                <div className="notif-time">{timeAgo(n.created_at)}</div>
              </div>
              {!n.read && <span className="notif-dot"/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
