from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from typing import Optional
from pydantic import BaseModel, Field
from database import updates_col, fields_col, users_col, notifications_col
from models import UpdateCreate, UpdateOut, FieldStage
from auth_utils import get_current_user
from helpers import nairobi_now, push_notification

router = APIRouter()


class UpdateEdit(BaseModel):
    notes:        Optional[str]        = None
    stage:        Optional[FieldStage] = None
    health_score: Optional[int]        = Field(None, ge=1, le=10)


@router.post("/", response_model=UpdateOut)
async def create_update(data: UpdateCreate, user=Depends(get_current_user)):
    try: f = await fields_col.find_one({"_id": ObjectId(data.field_id)})
    except Exception: raise HTTPException(404, "Field not found")
    if not f: raise HTTPException(404, "Field not found")
    if user["role"] == "agent" and f.get("assigned_agent_id") != str(user["_id"]):
        raise HTTPException(403, "Not assigned to this field")

    now = nairobi_now()
    doc = {
        "field_id": data.field_id, "agent_id": str(user["_id"]),
        "stage": data.stage.value if data.stage else None,
        "notes": data.notes, "health_score": data.health_score, "created_at": now,
    }
    result = await updates_col.insert_one(doc)

    if data.stage:
        await fields_col.update_one({"_id": ObjectId(data.field_id)},
            {"$set": {"stage": data.stage.value, "updated_at": now}})

    if data.health_score and data.health_score <= 4:
        async for admin in users_col.find({"role": "admin"}):
            await push_notification(notifications_col, str(admin["_id"]),
                f"⚠️ Low health on {f['name']}",
                f"{user['name']} reported {data.health_score}/10 health score.", "warning")

    return UpdateOut(id=str(result.inserted_id), field_id=data.field_id, field_name=f["name"],
        agent_id=str(user["_id"]), agent_name=user["name"], stage=data.stage,
        notes=data.notes, health_score=data.health_score, created_at=now)


@router.patch("/{update_id}", response_model=UpdateOut)
async def edit_update(update_id: str, data: UpdateEdit, user=Depends(get_current_user)):
    try: u = await updates_col.find_one({"_id": ObjectId(update_id)})
    except Exception: raise HTTPException(404, "Update not found")
    if not u: raise HTTPException(404, "Update not found")

    # Only the agent who created it (or an admin) can edit
    if user["role"] == "agent" and u.get("agent_id") != str(user["_id"]):
        raise HTTPException(403, "You can only edit your own updates")

    changes = {}
    if data.notes        is not None: changes["notes"]        = data.notes
    if data.health_score is not None: changes["health_score"] = data.health_score
    if data.stage        is not None: changes["stage"]        = data.stage.value

    if changes:
        await updates_col.update_one({"_id": ObjectId(update_id)}, {"$set": changes})

    # If stage changed, also update the field's current stage
    if data.stage:
        await fields_col.update_one({"_id": ObjectId(u["field_id"])},
            {"$set": {"stage": data.stage.value, "updated_at": nairobi_now()}})

    u = await updates_col.find_one({"_id": ObjectId(update_id)})
    f = await fields_col.find_one({"_id": ObjectId(u["field_id"])})
    ag = await users_col.find_one({"_id": ObjectId(u["agent_id"])}) if u.get("agent_id") else None

    return UpdateOut(id=str(u["_id"]), field_id=u["field_id"],
        field_name=f["name"] if f else None,
        agent_id=u["agent_id"], agent_name=ag["name"] if ag else None,
        stage=u.get("stage"), notes=u["notes"],
        health_score=u.get("health_score"), created_at=u["created_at"])


@router.delete("/{update_id}")
async def delete_update(update_id: str, user=Depends(get_current_user)):
    try: u = await updates_col.find_one({"_id": ObjectId(update_id)})
    except Exception: raise HTTPException(404, "Update not found")
    if not u: raise HTTPException(404, "Update not found")

    if user["role"] == "agent" and u.get("agent_id") != str(user["_id"]):
        raise HTTPException(403, "You can only delete your own updates")

    await updates_col.delete_one({"_id": ObjectId(update_id)})
    return {"message": "Deleted"}


@router.get("/field/{field_id}", response_model=list[UpdateOut])
async def get_updates(field_id: str, user=Depends(get_current_user)):
    try: f = await fields_col.find_one({"_id": ObjectId(field_id)})
    except Exception: raise HTTPException(404, "Field not found")
    if not f: raise HTTPException(404, "Field not found")
    if user["role"] == "agent" and f.get("assigned_agent_id") != str(user["_id"]):
        raise HTTPException(403, "Access denied")

    result = []
    async for u in updates_col.find({"field_id": field_id}).sort("created_at", -1):
        ag = await users_col.find_one({"_id": ObjectId(u["agent_id"])}) if u.get("agent_id") else None
        result.append(UpdateOut(
            id=str(u["_id"]), field_id=u["field_id"], field_name=f["name"],
            agent_id=u["agent_id"], agent_name=ag["name"] if ag else None,
            stage=u.get("stage"), notes=u["notes"],
            health_score=u.get("health_score"), created_at=u["created_at"]))
    return result
