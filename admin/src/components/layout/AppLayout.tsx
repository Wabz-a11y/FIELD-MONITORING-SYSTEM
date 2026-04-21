import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { NotificationsPanel } from '../ui/index'
import api from '../../lib/api'

export default function AppLayout() {
  const [notifOpen, setNotifOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const fetchUnread = () => api.get('notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {})
  useEffect(() => { fetchUnread(); const t = setInterval(fetchUnread, 30000); return () => clearInterval(t) }, [])
  return (
    <div className="app-layout">
      <Sidebar unread={unread} onNotifClick={() => setNotifOpen(true)}/>
      <div className="app-main"><Outlet/></div>
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} onRead={fetchUnread}/>
    </div>
  )
}
