import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Field, FieldUpdate, User, FieldStage } from '../types';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge, StageBadge, HealthDots, Loading } from '../components/UI';
import '../components/UI.css';
import {
  ArrowLeft, Plus, MapPin, Calendar, Ruler, User as UserIcon,
  Sprout, TrendingUp, X, Trash2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import './FieldDetailPage.css';

function AddUpdateModal({ fieldId, onClose, onAdded }: {
  fieldId: string;
  onClose: () => void;
  onAdded: (u: FieldUpdate) => void;
}) {
  const [form, setForm] = useState({ notes: '', stage: '' as FieldStage | '', health_score: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { field_id: fieldId, notes: form.notes };
      if (form.stage) payload.stage = form.stage;
      if (form.health_score) payload.health_score = parseInt(form.health_score);
      const { data } = await api.post('/updates/', payload);
      onAdded(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || 'Failed to save update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add Field Update</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        {error && <div style={{ background: '#fdecea', border: '1px solid #f5c6c3', color: 'var(--risk)', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Notes / Observations *</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Describe what you observed in the field…"
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Update Stage (optional)</label>
                <select className="form-select" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as FieldStage | '' }))}>
                  <option value="">— No change —</option>
                  <option value="planted">Planted</option>
                  <option value="growing">Growing</option>
                  <option value="ready">Ready</option>
                  <option value="harvested">Harvested</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Health Score (1–10)</label>
                <input
                  className="form-input"
                  type="number"
                  min={1} max={10}
                  value={form.health_score}
                  onChange={e => setForm(f => ({ ...f, health_score: e.target.value }))}
                  placeholder="7"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditFieldModal({ field, agents, onClose, onUpdated }: {
  field: Field;
  agents: User[];
  onClose: () => void;
  onUpdated: (f: Field) => void;
}) {
  const [form, setForm] = useState({
    name: field.name,
    crop_type: field.crop_type,
    location: field.location ?? '',
    size_hectares: field.size_hectares?.toString() ?? '',
    assigned_agent_id: field.assigned_agent_id ?? '',
    stage: field.stage,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: Record<string, unknown> = {
      name: form.name,
      crop_type: form.crop_type,
      stage: form.stage,
    };
    if (form.location) payload.location = form.location;
    if (form.size_hectares) payload.size_hectares = parseFloat(form.size_hectares);
    if (form.assigned_agent_id) payload.assigned_agent_id = form.assigned_agent_id;
    const { data } = await api.patch(`/fields/${field.id}`, payload);
    onUpdated(data);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Field</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Type</label>
              <input className="form-input" value={form.crop_type} onChange={set('crop_type')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stage</label>
              <select className="form-select" value={form.stage} onChange={set('stage')}>
                <option value="planted">Planted</option>
                <option value="growing">Growing</option>
                <option value="ready">Ready</option>
                <option value="harvested">Harvested</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Size (ha)</label>
              <input className="form-input" type="number" step="0.1" value={form.size_hectares} onChange={set('size_hectares')} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={set('location')} />
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
              {loading ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [field, setField] = useState<Field | null>(null);
  const [updates, setUpdates] = useState<FieldUpdate[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/fields/${id}`),
      api.get(`/updates/field/${id}`),
      isAdmin ? api.get('/users/agents') : Promise.resolve({ data: [] }),
    ]).then(([f, u, a]) => {
      setField(f.data);
      setUpdates(u.data);
      setAgents(a.data);
      setLoading(false);
    });
  }, [id, isAdmin]);

  const deleteField = async () => {
    if (!confirm('Delete this field? This cannot be undone.')) return;
    await api.delete(`/fields/${id}`);
    navigate('/fields');
  };

  if (loading) return <Loading />;
  if (!field) return <div style={{ padding: 40 }}>Field not found.</div>;

  const STAGE_STEPS: FieldStage[] = ['planted', 'growing', 'ready', 'harvested'];
  const stepIdx = STAGE_STEPS.indexOf(field.stage);

  return (
    <div className="field-detail-page">
      {/* Back */}
      <button className="back-btn fade-up" onClick={() => navigate('/fields')}>
        <ArrowLeft size={16} /> Back to Fields
      </button>

      {/* Header */}
      <div className="detail-header fade-up fade-up-1">
        <div className="detail-title-row">
          <div>
            <div className="detail-badges">
              <StatusBadge status={field.status} />
              <StageBadge stage={field.stage} />
            </div>
            <h1 className="page-title" style={{ marginTop: 8 }}>{field.name}</h1>
            <p className="page-subtitle">{field.crop_type}</p>
          </div>
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={() => setShowUpdate(true)}>
              <Plus size={15} /> Add Update
            </button>
            {isAdmin && (
              <>
                <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={deleteField}><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="card fade-up fade-up-2" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="stage-progress">
            {STAGE_STEPS.map((s, i) => (
              <div key={s} className={`stage-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                <div className="stage-dot">
                  {i <= stepIdx ? <Sprout size={12} /> : null}
                </div>
                {i < STAGE_STEPS.length - 1 && <div className={`stage-line ${i < stepIdx ? 'done' : ''}`} />}
                <span className="stage-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info + Updates */}
      <div className="detail-body">
        {/* Info card */}
        <div className="detail-info fade-up fade-up-3">
          <div className="card">
            <div className="card-header"><span className="card-title">Field Info</span></div>
            <div className="info-list">
              <div className="info-row">
                <Calendar size={15} /><span className="info-label">Planted</span>
                <span className="info-val">{format(new Date(field.planting_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="info-row">
                <TrendingUp size={15} /><span className="info-label">Days in Field</span>
                <span className="info-val">{field.days_since_planted} days</span>
              </div>
              {field.location && (
                <div className="info-row">
                  <MapPin size={15} /><span className="info-label">Location</span>
                  <span className="info-val">{field.location}</span>
                </div>
              )}
              {field.size_hectares && (
                <div className="info-row">
                  <Ruler size={15} /><span className="info-label">Size</span>
                  <span className="info-val">{field.size_hectares} ha</span>
                </div>
              )}
              {field.assigned_agent_name && (
                <div className="info-row">
                  <UserIcon size={15} /><span className="info-label">Agent</span>
                  <span className="info-val">{field.assigned_agent_name}</span>
                </div>
              )}
              <div className="info-row">
                <Calendar size={15} /><span className="info-label">Last Update</span>
                <span className="info-val">
                  {field.last_update
                    ? formatDistanceToNow(new Date(field.last_update), { addSuffix: true })
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Updates log */}
        <div className="updates-log fade-up fade-up-4">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Update Log</span>
              <span className="updates-count">{updates.length}</span>
            </div>
            {updates.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No updates yet. Be the first to log an observation.
              </div>
            ) : (
              <div className="update-timeline">
                {updates.map(u => (
                  <div key={u.id} className="update-entry">
                    <div className="update-dot" />
                    <div className="update-content">
                      <div className="update-meta">
                        <span className="update-agent">{u.agent_name}</span>
                        {u.stage && <StageBadge stage={u.stage} />}
                        {u.health_score && <HealthDots score={u.health_score} />}
                        <span className="update-time">{formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}</span>
                      </div>
                      <p className="update-notes">{u.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUpdate && (
        <AddUpdateModal
          fieldId={field.id}
          onClose={() => setShowUpdate(false)}
          onAdded={(u) => {
            setUpdates(prev => [u, ...prev]);
            if (u.stage) setField(prev => prev ? { ...prev, stage: u.stage! } : prev);
            setShowUpdate(false);
          }}
        />
      )}
      {showEdit && isAdmin && (
        <EditFieldModal
          field={field}
          agents={agents}
          onClose={() => setShowEdit(false)}
          onUpdated={(f) => { setField(f); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
