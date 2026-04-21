import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sprout, Bell, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Logo from '../ui/Logo'
import { Avatar } from '../ui/index'

interface Props { unread: number; onNotifClick: () => void }

export default function Sidebar({ unread, onNotifClick }: Props) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('ss_sidebar') === '1')
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => { localStorage.setItem('ss_sidebar', collapsed ? '1' : '0') }, [collapsed])

  const nav = [
    { to: '/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
    { to: '/fields', icon: <Sprout size={18}/>, label: 'My Fields' },
    { to: '/profile', icon: <User size={18}/>, label: 'Profile' },
  ]

  const inner = (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div>
        <div className="sidebar-logo-row">
          <Logo size={32} collapsed={collapsed}/>
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
          </button>
        </div>
        <div className="sidebar-user">
          <Avatar initials={user?.avatar_initials||'?'} size={32}/>
          {!collapsed && <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
            <span className="sidebar-user-name">{user?.name}</span>
            <span className="sidebar-user-role">Field Agent</span>
          </div>}
        </div>
        <nav className="sidebar-nav">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} title={collapsed ? n.label : undefined}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </NavLink>
          ))}
          <button className="nav-item" onClick={onNotifClick} title={collapsed ? 'Notifications' : undefined}>
            <span className="nav-icon" style={{ position: 'relative' }}>
              <Bell size={18}/>
              {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
            </span>
            <span className="nav-label">Notifications</span>
            {unread > 0 && <span className="notif-count">{unread}</span>}
          </button>
        </nav>
      </div>
      <div>
        {!collapsed && (
          <div className="theme-toggle">
            {(['light','system','dark'] as const).map(t => (
              <button key={t} className={`theme-btn ${theme===t?'active':''}`} onClick={() => setTheme(t)}>
                {t==='light'?'☀️':t==='dark'?'🌙':'💻'}
              </button>
            ))}
          </div>
        )}
        <NavLink to="/settings" title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) => `nav-item ${isActive?'active':''}`}>
          <span className="nav-icon"><Settings size={18}/></span>
          <span className="nav-label">Settings</span>
        </NavLink>
        <button className="nav-item logout-item" onClick={() => { logout(); navigate('/login') }} title={collapsed ? 'Sign Out' : undefined}>
          <span className="nav-icon"><LogOut size={18}/></span>
          <span className="nav-label">Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
      <div className="sidebar-desktop">{inner}</div>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 14, right: -44, background: 'white', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }} onClick={() => setMobileOpen(false)}><X size={16}/></button>
            {inner}
          </div>
        </div>
      )}
    </>
  )
}
