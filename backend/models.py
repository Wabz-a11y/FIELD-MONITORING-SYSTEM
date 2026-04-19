from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    admin = "admin"
    agent = "agent"


class FieldStage(str, Enum):
    planted = "planted"
    growing = "growing"
    ready = "ready"
    harvested = "harvested"


class FieldStatus(str, Enum):
    active = "active"
    at_risk = "at_risk"
    completed = "completed"


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.agent


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ── Fields ────────────────────────────────────────────────────────────────────

class FieldCreate(BaseModel):
    name: str
    crop_type: str
    planting_date: datetime
    location: Optional[str] = None
    size_hectares: Optional[float] = None
    assigned_agent_id: Optional[str] = None


class FieldUpdate(BaseModel):
    name: Optional[str] = None
    crop_type: Optional[str] = None
    planting_date: Optional[datetime] = None
    location: Optional[str] = None
    size_hectares: Optional[float] = None
    assigned_agent_id: Optional[str] = None
    stage: Optional[FieldStage] = None


class FieldOut(BaseModel):
    id: str
    name: str
    crop_type: str
    planting_date: datetime
    stage: FieldStage
    status: FieldStatus
    location: Optional[str]
    size_hectares: Optional[float]
    assigned_agent_id: Optional[str]
    assigned_agent_name: Optional[str]
    created_at: datetime
    updated_at: datetime
    days_since_planted: int
    last_update: Optional[datetime]


# ── Updates ───────────────────────────────────────────────────────────────────

class UpdateCreate(BaseModel):
    field_id: str
    stage: Optional[FieldStage] = None
    notes: str
    health_score: Optional[int] = Field(None, ge=1, le=10)  # 1-10


class UpdateOut(BaseModel):
    id: str
    field_id: str
    field_name: Optional[str]
    agent_id: str
    agent_name: Optional[str]
    stage: Optional[FieldStage]
    notes: str
    health_score: Optional[int]
    created_at: datetime


# ── Dashboard ─────────────────────────────────────────────────────────────────

class StatusBreakdown(BaseModel):
    active: int
    at_risk: int
    completed: int


class StageBreakdown(BaseModel):
    planted: int
    growing: int
    ready: int
    harvested: int


class DashboardStats(BaseModel):
    total_fields: int
    status_breakdown: StatusBreakdown
    stage_breakdown: StageBreakdown
    recent_updates: List[UpdateOut]
    at_risk_fields: List[FieldOut]
