import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import { DashboardStats } from '../types';
import { StatCard, StatusBadge, StageBadge, Loading, EmptyState } from '../components/UI';
import '../components/UI.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { Sprout, AlertTriangle, Clock, BarChart2, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './DashboardPage.css';

const STAGE_COLORS: Record<string, string> = {
  planted: '#c67c00', growing: '#2d5a27', ready: '#c8a000', harvested: '#7c5c38',
};
const STATUS_COLORS: Record<string, string> = {
  active: '#2d5a27', at_risk: '#c0392b', completed: '#7c5c38',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fields/dashboard').then(r => { setStats(r.data); setLoading(false); });
  }, []);

  if (loading) return <Loading />;
  if (!stats) return null;

  const stageData = Object.entries(stats.stage_breakdown).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(stats.status_breakdown).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard-page">
      <div className="dash-header fade-up">
        <div>
          <h1 className="page-title">
            {isAdmin ? 'Operations Overview' : 'My Fields'}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? `Monitoring all fields across ${stats.total_fields} assignments`
              : `You have ${stats.total_fields} field${stats.total_fields !== 1 ? 's' : ''} assigned`}
          </p>
        </div>
        <div className="dash-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Fields"
          value={stats.total_fields}
          icon={<Sprout size={18} />}
          accent="var(--leaf)"
          className="fade-up fade-up-1"
        />
        <StatCard
          label="Active"
          value={stats.status_breakdown.active}
          sub={`${stats.total_fields ? Math.round(stats.status_breakdown.active / stats.total_fields * 100) : 0}% of fields`}
          icon={<Activity size={18} />}
          accent="var(--sage)"
          className="fade-up fade-up-2"
        />
        <StatCard
          label="At Risk"
          value={stats.status_breakdown.at_risk}
          sub="Needs attention"
          icon={<AlertTriangle size={18} />}
          accent="var(--risk)"
          className="fade-up fade-up-3"
        />
        <StatCard
          label="Completed"
          value={stats.status_breakdown.completed}
          sub="Harvested fields"
          icon={<BarChart2 size={18} />}
          accent="var(--clay)"
          className="fade-up fade-up-4"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row fade-up">
        <div className="card chart-card">
          <div className="card-header">
            <span className="card-title">Stage Breakdown</span>
          </div>
          <div className="card-body chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}
                  cursor={{ fill: 'var(--surface-2)' }}
                />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {stageData.map((entry) => (
                    <Cell key={entry.name} fill={STAGE_COLORS[entry.name] || 'var(--sage)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <span className="card-title">Status Distribution</span>
          </div>
          <div className="card-body chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={38} paddingAngle={3}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name.replace(' ', '_')] || 'var(--sage)'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row fade-up">
        {/* At Risk Fields */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ At Risk Fields</span>
            <Link to="/fields" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {stats.at_risk_fields.length === 0 ? (
            <EmptyState icon={<Sprout size={22} />} title="All fields healthy" description="No fields flagged at risk." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Field</th><th>Crop</th><th>Stage</th><th>Days</th></tr>
                </thead>
                <tbody>
                  {stats.at_risk_fields.map(f => (
                    <tr key={f.id}>
                      <td><Link to={`/fields/${f.id}`} className="field-link">{f.name}</Link></td>
                      <td>{f.crop_type}</td>
                      <td><StageBadge stage={f.stage} /></td>
                      <td className="text-muted">{f.days_since_planted}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <Clock size={16} color="var(--text-muted)" />
          </div>
          {stats.recent_updates.length === 0 ? (
            <EmptyState icon={<Activity size={22} />} title="No updates yet" description="Field updates will appear here." />
          ) : (
            <div className="activity-list">
              {stats.recent_updates.map(u => (
                <div key={u.id} className="activity-item">
                  <div className="activity-avatar">{u.agent_name?.charAt(0).toUpperCase() ?? '?'}</div>
                  <div className="activity-body">
                    <div className="activity-main">
                      <Link to={`/fields/${u.field_id}`} className="field-link">{u.field_name ?? 'Field'}</Link>
                      {u.stage && <StageBadge stage={u.stage} />}
                    </div>
                    <p className="activity-note">{u.notes.length > 80 ? u.notes.slice(0, 80) + '…' : u.notes}</p>
                    <div className="activity-meta">
                      <span>{u.agent_name}</span>
                      <span>{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
