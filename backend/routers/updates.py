from fastapi import APIRouter, Depends, HTTPException
from database import updates_collection, fields_collection, users_collection
from models import UpdateCreate, UpdateOut, FieldStage
from auth_utils import get_current_user
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


@router.post("/", response_model=UpdateOut)
async def create_update(data: UpdateCreate, current_user=Depends(get_current_user)):
    # Verify the field exists and agent has access
    try:
        f = await fields_collection.find_one({"_id": ObjectId(data.field_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Field not found")
    if not f:
        raise HTTPException(status_code=404, detail="Field not found")

    if current_user["role"] == "agent":
        if f.get("assigned_agent_id") != str(current_user["_id"]):
            raise HTTPException(status_code=403, detail="Not assigned to this field")

    now = datetime.now(timezone.utc)
    doc = {
        "field_id": data.field_id,
        "agent_id": str(current_user["_id"]),
        "stage": data.stage.value if data.stage else None,
        "notes": data.notes,
        "health_score": data.health_score,
        "created_at": now,
    }
    result = await updates_collection.insert_one(doc)

    # If stage changed, update the field
    if data.stage:
        await fields_collection.update_one(
            {"_id": ObjectId(data.field_id)},
            {"$set": {"stage": data.stage.value, "updated_at": now}}
        )

    agent = current_user
    return UpdateOut(
        id=str(result.inserted_id),
        field_id=data.field_id,
        field_name=f["name"],
        agent_id=str(current_user["_id"]),
        agent_name=agent["name"],
        stage=data.stage,
        notes=data.notes,
        health_score=data.health_score,
        created_at=now,
    )


@router.get("/field/{field_id}", response_model=list[UpdateOut])
async def get_field_updates(field_id: str, current_user=Depends(get_current_user)):
    try:
        f = await fields_collection.find_one({"_id": ObjectId(field_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Field not found")
    if not f:
        raise HTTPException(status_code=404, detail="Field not found")

    if current_user["role"] == "agent" and f.get("assigned_agent_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Access denied")

    result = []
    async for u in updates_collection.find({"field_id": field_id}).sort("created_at", -1):
        agent = await users_collection.find_one({"_id": ObjectId(u["agent_id"])}) if u.get("agent_id") else None
        result.append(UpdateOut(
            id=str(u["_id"]),
            field_id=u["field_id"],
            field_name=f["name"],
            agent_id=u["agent_id"],
            agent_name=agent["name"] if agent else None,
            stage=u.get("stage"),
            notes=u["notes"],
            health_score=u.get("health_score"),
            created_at=u["created_at"],
        ))
    return result
