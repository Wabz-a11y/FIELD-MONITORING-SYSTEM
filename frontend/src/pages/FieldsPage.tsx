import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Field, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge, StageBadge, PageHeader, Loading, EmptyState } from '../components/UI';
import '../components/UI.css';
import { Plus, Search, Sprout, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './FieldsPage.css';

function CreateFieldModal({ agents, onClose, onCreated }: {
  agents: User[];
  onClose: () => void;
  onCreated: (f: Field) => void;
}) {
  const [form, setForm] = useState({
    name: '', crop_type: '', planting_date: '', location: '',
    size_hectares: '', assigned_agent_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        planting_date: new Date(form.planting_date).toISOString(),
        size_hectares: form.size_hectares ? parseFloat(form.size_hectares) : undefined,
        assigned_agent_id: form.assigned_agent_id || undefined,
      };
      const { data } = await api.post('/fields/', payload);
      onCreated(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Failed to create field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Field</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={submit}>
          <div className="modal-form-grid">
            <div className="form-group">
              <label className="form-label">Field Name *</label>
              <input className="form-input" value={form.name} onChange={set('name')} placeholder="North Block A" required />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type *</label>
              <input className="form-input" value={form.crop_type} onChange={set('crop_type')} placeholder="Maize, Wheat…" required />
            </div>
            <div className="form-group">
              <label className="form-label">Planting Date *</label>
              <input className="form-input" type="date" value={form.planting_date} onChange={set('planting_date')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Size (hectares)</label>
              <input className="form-input" type="number" step="0.1" value={form.size_hectares} onChange={set('size_hectares')} placeholder="2.5" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={set('location')} placeholder="GPS or description" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Assign to Agent</label>
              <select className="form-select" value={form.assigned_agent_id} onChange={set('assigned_agent_id')}>
                <option value="">— Unassigned —</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating…</> : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FieldsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [fields, setFields] = useState<Field[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/fields/').then(r => { setFields(r.data); setLoading(false); });
    if (isAdmin) api.get('/users/agents').then(r => setAgents(r.data));
  }, [isAdmin]);

  const filtered = fields.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.crop_type.toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter && f.stage !== stageFilter) return false;
    if (statusFilter && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="fields-page">
      <PageHeader
        title="Fields"
        subtitle={`${fields.length} field${fields.length !== 1 ? 's' : ''} ${isAdmin ? 'total' : 'assigned to you'}`}
        action={isAdmin ? (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Field
          </button>
        ) : undefined}
      />

      {/* Filters */}
      <div className="fields-filters fade-up">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search fields or crops…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select filter-select" value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
          <option value="">All Stages</option>
          <option value="planted">Planted</option>
          <option value="growing">Growing</option>
          <option value="ready">Ready</option>
          <option value="harvested">Harvested</option>
        </select>
        <select className="form-select filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <EmptyState
          icon={<Sprout size={24} />}
          title={fields.length === 0 ? 'No fields yet' : 'No results found'}
          description={fields.length === 0 && isAdmin ? 'Create your first field to get started.' : undefined}
        />
      ) : (
        <div className="fields-grid fade-up">
          {filtered.map((f, i) => (
            <Link key={f.id} to={`/fields/${f.id}`} className="field-card" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="field-card-top">
                <div className="field-card-badges">
                  <StatusBadge status={f.status} />
                  <StageBadge stage={f.stage} />
                </div>
                <span className="field-days">{f.days_since_planted}d</span>
              </div>
              <h3 className="field-card-name">{f.name}</h3>
              <p className="field-card-crop">{f.crop_type}</p>
              <div className="field-card-meta">
                {f.assigned_agent_name && (
                  <div className="field-agent">
                    <div className="field-agent-avatar">{f.assigned_agent_name.charAt(0)}</div>
                    <span>{f.assigned_agent_name}</span>
                  </div>
                )}
                <span className="field-updated">
                  {f.last_update
                    ? `Updated ${formatDistanceToNow(new Date(f.last_update), { addSuffix: true })}`
                    : 'No updates yet'}
                </span>
              </div>
              {f.location && <p className="field-location">📍 {f.location}</p>}
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateFieldModal
          agents={agents}
          onClose={() => setShowCreate(false)}
          onCreated={(f) => { setFields(prev => [f, ...prev]); setShowCreate(false); }}
        />
      )}
    </div>
  );
}
