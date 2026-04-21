from fastapi import APIRouter, Depends
from bson import ObjectId
from database import notifications_col
from models import NotificationOut
from auth_utils import get_current_user

router = APIRouter()


@router.get("/", response_model=list[NotificationOut])
async def get_all(user=Depends(get_current_user)):
    uid = str(user["_id"])
    return [NotificationOut(id=str(n["_id"]), user_id=n["user_id"], title=n["title"],
        message=n["message"], type=n.get("type", "info"), read=n.get("read", False),
        created_at=n["created_at"])
        async for n in notifications_col.find({"user_id": uid}).sort("created_at", -1).limit(50)]


@router.get("/unread-count")
async def unread_count(user=Depends(get_current_user)):
    count = await notifications_col.count_documents({"user_id": str(user["_id"]), "read": False})
    return {"count": count}


@router.patch("/{nid}/read")
async def mark_read(nid: str, user=Depends(get_current_user)):
    await notifications_col.update_one({"_id": ObjectId(nid), "user_id": str(user["_id"])}, {"$set": {"read": True}})
    return {"ok": True}


@router.patch("/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    await notifications_col.update_many({"user_id": str(user["_id"])}, {"$set": {"read": True}})
    return {"ok": True}
