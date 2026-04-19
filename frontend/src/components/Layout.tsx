import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Sprout, LogOut, Wheat, ChevronRight } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><Wheat size={20} /></div>
          <span className="logo-text">SmartSeason</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`user-badge ${user?.role}`}>{user?.role === 'admin' ? 'Coordinator' : 'Field Agent'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
          <NavLink to="/fields" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Sprout size={18} />
            <span>Fields</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
