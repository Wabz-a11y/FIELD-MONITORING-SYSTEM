import { FieldStage, FieldStatus } from '../types';
import { AlertTriangle, CheckCircle2, Leaf, Sprout, Sun, Archive } from 'lucide-react';

// ── Status Badge ──────────────────────────────────────────────────────────────
interface StatusBadgeProps { status: FieldStatus; }
export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<FieldStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    active:    { label: 'Active',    cls: 'badge-active',    icon: <Leaf size={11} /> },
    at_risk:   { label: 'At Risk',   cls: 'badge-risk',      icon: <AlertTriangle size={11} /> },
    completed: { label: 'Completed', cls: 'badge-completed', icon: <CheckCircle2 size={11} /> },
  };
  const { label, cls, icon } = map[status];
  return (
    <span className={`badge ${cls}`}>
      {icon}{label}
    </span>
  );
}

// ── Stage Badge ───────────────────────────────────────────────────────────────
interface StageBadgeProps { stage: FieldStage; }
export function StageBadge({ stage }: StageBadgeProps) {
  const map: Record<FieldStage, { label: string; cls: string; icon: React.ReactNode }> = {
    planted:   { label: 'Planted',   cls: 'badge-planted',   icon: <Sprout size={11} /> },
    growing:   { label: 'Growing',   cls: 'badge-growing',   icon: <Leaf size={11} /> },
    ready:     { label: 'Ready',     cls: 'badge-ready',     icon: <Sun size={11} /> },
    harvested: { label: 'Harvested', cls: 'badge-harvested', icon: <Archive size={11} /> },
  };
  const { label, cls, icon } = map[stage];
  return <span className={`badge ${cls}`}>{icon}{label}</span>;
}

// ── Health Score ──────────────────────────────────────────────────────────────
export function HealthDots({ score }: { score: number }) {
  return (
    <div className="health-dots">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i < score ? (score <= 4 ? 'dot-red' : score <= 6 ? 'dot-amber' : 'dot-green') : ''}`}
        />
      ))}
      <span className="health-label">{score}/10</span>
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header fade-up">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: number | string; sub?: string; accent?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="stat-card fade-up" style={{ '--accent': accent } as React.CSSProperties}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }: {
  icon: React.ReactNode; title: string; description?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Loading() {
  return (
    <div className="loading-page">
      <div className="loading-spinner" />
    </div>
  );
}
