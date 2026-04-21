from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    agent = "agent"

class FieldStage(str, Enum):
    planted   = "planted"
    growing   = "growing"
    ready     = "ready"
    harvested = "harvested"

class FieldStatus(str, Enum):
    active    = "active"
    at_risk   = "at_risk"
    completed = "completed"

class NotifPref(str, Enum):
    inapp = "inapp"
    email = "email"
    both  = "both"


# ── Auth ──────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str; email: EmailStr; password: str
    role: UserRole = UserRole.agent

class UserLogin(BaseModel):
    email: EmailStr; password: str

class UserOut(BaseModel):
    id: str; name: str; email: str; role: UserRole
    email_verified: bool; avatar_initials: str
    notif_pref: NotifPref; phone: Optional[str]; bio: Optional[str]
    created_at: datetime

class ProfileUpdate(BaseModel):
    name:       Optional[str]       = None
    phone:      Optional[str]       = None
    bio:        Optional[str]       = None
    notif_pref: Optional[NotifPref] = None

class PasswordChange(BaseModel):
    current_password: str; new_password: str

class Token(BaseModel):
    access_token: str; token_type: str; user: UserOut

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str; new_password: str

class VerifyEmailRequest(BaseModel):
    token: str


# ── Fields ────────────────────────────────────────────────────────
class FieldCreate(BaseModel):
    name: str; crop_type: str; planting_date: datetime
    location: Optional[str] = None
    size_hectares: Optional[float] = None
    assigned_agent_id: Optional[str] = None
    notes: Optional[str] = None

class FieldUpdateSchema(BaseModel):
    name:              Optional[str]        = None
    crop_type:         Optional[str]        = None
    planting_date:     Optional[datetime]   = None
    location:          Optional[str]        = None
    size_hectares:     Optional[float]      = None
    assigned_agent_id: Optional[str]        = None
    stage:             Optional[FieldStage] = None
    notes:             Optional[str]        = None

class FieldOut(BaseModel):
    id: str; name: str; crop_type: str; planting_date: datetime
    stage: FieldStage; status: FieldStatus
    location: Optional[str]; size_hectares: Optional[float]; notes: Optional[str]
    assigned_agent_id: Optional[str]; assigned_agent_name: Optional[str]
    created_at: datetime; updated_at: datetime
    days_since_planted: int; last_update: Optional[datetime]


# ── Updates ───────────────────────────────────────────────────────
class UpdateCreate(BaseModel):
    field_id: str; stage: Optional[FieldStage] = None
    notes: str; health_score: Optional[int] = Field(None, ge=1, le=10)

class UpdateOut(BaseModel):
    id: str; field_id: str; field_name: Optional[str]
    agent_id: str; agent_name: Optional[str]
    stage: Optional[FieldStage]; notes: str
    health_score: Optional[int]; created_at: datetime


# ── Notifications ─────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: str; user_id: str; title: str; message: str
    type: str; read: bool; created_at: datetime


# ── Dashboard ─────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_fields: int; total_agents: Optional[int]
    status_breakdown: dict; stage_breakdown: dict
    recent_updates: List[UpdateOut]; at_risk_fields: List[FieldOut]
