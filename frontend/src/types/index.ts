export type UserRole = 'admin' | 'agent';
export type FieldStage = 'planted' | 'growing' | 'ready' | 'harvested';
export type FieldStatus = 'active' | 'at_risk' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Field {
  id: string;
  name: string;
  crop_type: string;
  planting_date: string;
  stage: FieldStage;
  status: FieldStatus;
  location?: string;
  size_hectares?: number;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  created_at: string;
  updated_at: string;
  days_since_planted: number;
  last_update?: string;
}

export interface FieldUpdate {
  id: string;
  field_id: string;
  field_name?: string;
  agent_id: string;
  agent_name?: string;
  stage?: FieldStage;
  notes: string;
  health_score?: number;
  created_at: string;
}

export interface DashboardStats {
  total_fields: number;
  status_breakdown: { active: number; at_risk: number; completed: number };
  stage_breakdown: { planted: number; growing: number; ready: number; harvested: number };
  recent_updates: FieldUpdate[];
  at_risk_fields: Field[];
}

export interface Token {
  access_token: string;
  token_type: string;
  user: User;
}
