from fastapi import APIRouter, Depends, HTTPException
from database import fields_collection, updates_collection, users_collection
from models import (
    FieldCreate, FieldUpdate, FieldOut, FieldStage, DashboardStats,
    StatusBreakdown, StageBreakdown, UpdateOut
)
from auth_utils import get_current_user, require_admin
from status_logic import compute_field_status, days_since
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


async def enrich_field(f: dict) -> FieldOut:
    # Get latest update for this field
    last_upd = await updates_collection.find_one(
        {"field_id": str(f["_id"])},
        sort=[("created_at", -1)]
    )
    last_update_dt = last_upd["created_at"] if last_upd else None
    health_score = last_upd.get("health_score") if last_upd else None

    stage = FieldStage(f["stage"])
    planting_date = f["planting_date"]
    status = compute_field_status(stage, planting_date, last_update_dt, health_score)

    agent_name = None
    if f.get("assigned_agent_id"):
        try:
            agent = await users_collection.find_one({"_id": ObjectId(f["assigned_agent_id"])})
            if agent:
                agent_name = agent["name"]
        except Exception:
            pass

    return FieldOut(
        id=str(f["_id"]),
        name=f["name"],
        crop_type=f["crop_type"],
        planting_date=f["planting_date"],
        stage=stage,
        status=status,
        location=f.get("location"),
        size_hectares=f.get("size_hectares"),
        assigned_agent_id=f.get("assigned_agent_id"),
        assigned_agent_name=agent_name,
        created_at=f["created_at"],
        updated_at=f["updated_at"],
        days_since_planted=days_since(f["planting_date"]),
        last_update=last_update_dt,
    )


# ── CRUD ──────────────────────────────────────────────────────────────────────

@router.post("/", response_model=FieldOut)
async def create_field(data: FieldCreate, admin=Depends(require_admin)):
    now = datetime.now(timezone.utc)
    doc = {
        **data.model_dump(),
        "stage": FieldStage.planted.value,
        "created_at": now,
        "updated_at": now,
    }
    if doc.get("planting_date") and doc["planting_date"].tzinfo is None:
        doc["planting_date"] = doc["planting_date"].replace(tzinfo=timezone.utc)
    result = await fields_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return await enrich_field(doc)


@router.get("/", response_model=list[FieldOut])
async def list_fields(current_user=Depends(get_current_user)):
    query = {}
    if current_user["role"] == "agent":
        query["assigned_agent_id"] = str(current_user["_id"])

    result = []
    async for f in fields_collection.find(query).sort("created_at", -1):
        result.append(await enrich_field(f))
    return result


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(current_user=Depends(get_current_user)):
    query = {}
    if current_user["role"] == "agent":
        query["assigned_agent_id"] = str(current_user["_id"])

    all_fields = []
    async for f in fields_collection.find(query):
        all_fields.append(await enrich_field(f))

    status_counts = {"active": 0, "at_risk": 0, "completed": 0}
    stage_counts = {"planted": 0, "growing": 0, "ready": 0, "harvested": 0}
    at_risk_fields = []

    for f in all_fields:
        status_counts[f.status.value] += 1
        stage_counts[f.stage.value] += 1
        if f.status.value == "at_risk":
            at_risk_fields.append(f)

    # Recent updates
    update_query = {}
    if current_user["role"] == "agent":
        update_query["agent_id"] = str(current_user["_id"])

    recent_updates = []
    async for u in updates_collection.find(update_query).sort("created_at", -1).limit(10):
        agent = await users_collection.find_one({"_id": ObjectId(u["agent_id"])}) if u.get("agent_id") else None
        field = await fields_collection.find_one({"_id": ObjectId(u["field_id"])}) if u.get("field_id") else None
        recent_updates.append(UpdateOut(
            id=str(u["_id"]),
            field_id=u["field_id"],
            field_name=field["name"] if field else None,
            agent_id=u["agent_id"],
            agent_name=agent["name"] if agent else None,
            stage=u.get("stage"),
            notes=u["notes"],
            health_score=u.get("health_score"),
            created_at=u["created_at"],
        ))

    return DashboardStats(
        total_fields=len(all_fields),
        status_breakdown=StatusBreakdown(**status_counts),
        stage_breakdown=StageBreakdown(**stage_counts),
        recent_updates=recent_updates,
        at_risk_fields=at_risk_fields[:5],
    )


@router.get("/{field_id}", response_model=FieldOut)
async def get_field(field_id: str, current_user=Depends(get_current_user)):
    try:
        f = await fields_collection.find_one({"_id": ObjectId(field_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Field not found")
    if not f:
        raise HTTPException(status_code=404, detail="Field not found")
    if current_user["role"] == "agent" and f.get("assigned_agent_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")
    return await enrich_field(f)


@router.patch("/{field_id}", response_model=FieldOut)
async def update_field(field_id: str, data: FieldUpdate, admin=Depends(require_admin)):
    try:
        f = await fields_collection.find_one({"_id": ObjectId(field_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Field not found")
    if not f:
        raise HTTPException(status_code=404, detail="Field not found")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc)
    if "stage" in updates:
        updates["stage"] = updates["stage"].value

    await fields_collection.update_one({"_id": ObjectId(field_id)}, {"$set": updates})
    f = await fields_collection.find_one({"_id": ObjectId(field_id)})
    return await enrich_field(f)


@router.delete("/{field_id}")
async def delete_field(field_id: str, admin=Depends(require_admin)):
    try:
        result = await fields_collection.delete_one({"_id": ObjectId(field_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Field not found")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Field not found")
    return {"message": "Field deleted"}
