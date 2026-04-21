export type UserRole   = 'admin' | 'agent'
export type FieldStage = 'planted' | 'growing' | 'ready' | 'harvested'
export type FieldStatus = 'active' | 'at_risk' | 'completed'
export type NotifPref  = 'inapp' | 'email' | 'both'
export type Theme      = 'light' | 'dark' | 'system'

export interface User {
  id: string; name: string; email: string; role: UserRole
  email_verified: boolean; avatar_initials: string
  notif_pref: NotifPref; phone?: string; bio?: string; created_at: string
}
export interface Field {
  id: string; name: string; crop_type: string; planting_date: string
  stage: FieldStage; status: FieldStatus
  location?: string; size_hectares?: number; notes?: string
  assigned_agent_id?: string; assigned_agent_name?: string
  created_at: string; updated_at: string
  days_since_planted: number; last_update?: string
}
export interface FieldUpdate {
  id: string; field_id: string; field_name?: string
  agent_id: string; agent_name?: string
  stage?: FieldStage; notes: string; health_score?: number; created_at: string
}
export interface Notification {
  id: string; user_id: string; title: string; message: string
  type: 'info' | 'warning' | 'success' | 'error'; read: boolean; created_at: string
}
export interface DashboardStats {
  total_fields: number; total_agents?: number
  status_breakdown: Record<string, number>
  stage_breakdown:  Record<string, number>
  recent_updates: FieldUpdate[]; at_risk_fields: Field[]
}
export interface Token { access_token: string; token_type: string; user: User }
