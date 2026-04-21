from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
import pytz

from database import fields_col, updates_col, users_col, notifications_col
from models import FieldCreate, FieldUpdateSchema, FieldOut, FieldStage, DashboardStats, UpdateOut
from auth_utils import get_current_user, require_admin
from status_logic import compute_status, days_since
from helpers import nairobi_now, push_notification

router = APIRouter()


async def enrich(f: dict) -> FieldOut:
    last = await updates_col.find_one({"field_id": str(f["_id"])}, sort=[("created_at", -1)])
    health = last.get("health_score") if last else None
    last_dt = last["created_at"] if last else None
    stage = FieldStage(f["stage"])
    agent_name = None
    if f.get("assigned_agent_id"):
        try:
            ag = await users_col.find_one({"_id": ObjectId(f["assigned_agent_id"])})
            if ag: agent_name = ag["name"]
        except Exception: pass
    return FieldOut(
        id=str(f["_id"]), name=f["name"], crop_type=f["crop_type"],
        planting_date=f["planting_date"], stage=stage,
        status=compute_status(stage, f["planting_date"], last_dt, health),
        location=f.get("location"), size_hectares=f.get("size_hectares"),
        notes=f.get("notes"), assigned_agent_id=f.get("assigned_agent_id"),
        assigned_agent_name=agent_name,
        created_at=f["created_at"], updated_at=f["updated_at"],
        days_since_planted=days_since(f["planting_date"]), last_update=last_dt,
    )


@router.post("/", response_model=FieldOut)
async def create_field(data: FieldCreate, admin=Depends(require_admin)):
    now = nairobi_now()
    pd = data.planting_date
    if pd.tzinfo is None:
        pd = pytz.utc.localize(pd)
    doc = {**data.model_dump(), "planting_date": pd, "stage": "planted", "created_at": now, "updated_at": now}
    result = await fields_col.insert_one(doc); doc["_id"] = result.inserted_id
    if data.assigned_agent_id:
        await push_notification(notifications_col, data.assigned_agent_id,
            f"New field assigned: {data.name}", f"You have been assigned {data.name} ({data.crop_type}).", "info")
    return await enrich(doc)


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(user=Depends(get_current_user)):
    q = {} if user["role"] == "admin" else {"assigned_agent_id": str(user["_id"])}
    all_fields = [await enrich(f) async for f in fields_col.find(q)]
    sc = {"active": 0, "at_risk": 0, "completed": 0}
    tc = {"planted": 0, "growing": 0, "ready": 0, "harvested": 0}
    at_risk = []
    for f in all_fields:
        sc[f.status.value] += 1; tc[f.stage.value] += 1
        if f.status.value == "at_risk": at_risk.append(f)
    uq = {} if user["role"] == "admin" else {"agent_id": str(user["_id"])}
    recent = []
    async for u in updates_col.find(uq).sort("created_at", -1).limit(10):
        ag = await users_col.find_one({"_id": ObjectId(u["agent_id"])}) if u.get("agent_id") else None
        fi = await fields_col.find_one({"_id": ObjectId(u["field_id"])}) if u.get("field_id") else None
        recent.append(UpdateOut(id=str(u["_id"]), field_id=u["field_id"], field_name=fi["name"] if fi else None,
            agent_id=u["agent_id"], agent_name=ag["name"] if ag else None,
            stage=u.get("stage"), notes=u["notes"], health_score=u.get("health_score"), created_at=u["created_at"]))
    return DashboardStats(
        total_fields=len(all_fields),
        total_agents=await users_col.count_documents({"role": "agent"}) if user["role"] == "admin" else None,
        status_breakdown=sc, stage_breakdown=tc, recent_updates=recent, at_risk_fields=at_risk[:5],
    )


@router.get("/", response_model=list[FieldOut])
async def list_fields(user=Depends(get_current_user)):
    q = {} if user["role"] == "admin" else {"assigned_agent_id": str(user["_id"])}
    return [await enrich(f) async for f in fields_col.find(q).sort("created_at", -1)]


@router.get("/{field_id}", response_model=FieldOut)
async def get_field(field_id: str, user=Depends(get_current_user)):
    try: f = await fields_col.find_one({"_id": ObjectId(field_id)})
    except Exception: raise HTTPException(404, "Field not found")
    if not f: raise HTTPException(404, "Field not found")
    if user["role"] == "agent" and f.get("assigned_agent_id") != str(user["_id"]):
        raise HTTPException(403, "Access denied")
    return await enrich(f)


@router.patch("/{field_id}", response_model=FieldOut)
async def update_field(field_id: str, data: FieldUpdateSchema, admin=Depends(require_admin)):
    try: f = await fields_col.find_one({"_id": ObjectId(field_id)})
    except Exception: raise HTTPException(404, "Field not found")
    if not f: raise HTTPException(404, "Field not found")
    upd = {k: v for k, v in data.model_dump().items() if v is not None}
    if "stage" in upd: upd["stage"] = upd["stage"].value
    upd["updated_at"] = nairobi_now()
    await fields_col.update_one({"_id": ObjectId(field_id)}, {"$set": upd})
    return await enrich(await fields_col.find_one({"_id": ObjectId(field_id)}))


@router.delete("/{field_id}")
async def delete_field(field_id: str, admin=Depends(require_admin)):
    try: r = await fields_col.delete_one({"_id": ObjectId(field_id)})
    except Exception: raise HTTPException(404, "Field not found")
    if r.deleted_count == 0: raise HTTPException(404, "Field not found")
    return {"message": "Deleted"}
