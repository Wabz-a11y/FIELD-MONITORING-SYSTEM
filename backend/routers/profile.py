from fastapi import APIRouter, Depends, HTTPException
from database import users_col
from models import ProfileUpdate, PasswordChange
from auth_utils import get_current_user, hash_password, verify_password
from helpers import user_to_out, nairobi_now

router = APIRouter()


@router.get("/")
async def get_profile(user=Depends(get_current_user)):
    return user_to_out(user)


@router.patch("/")
async def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    updates["updated_at"] = nairobi_now()
    await users_col.update_one({"_id": user["_id"]}, {"$set": updates})
    return user_to_out(await users_col.find_one({"_id": user["_id"]}))


@router.post("/change-password")
async def change_password(data: PasswordChange, user=Depends(get_current_user)):
    if not verify_password(data.current_password, user["password"]):
        raise HTTPException(400, "Current password is incorrect")
    await users_col.update_one({"_id": user["_id"]}, {"$set": {"password": hash_password(data.new_password)}})
    return {"message": "Password changed"}


@router.delete("/account")
async def delete_account(user=Depends(get_current_user)):
    await users_col.delete_one({"_id": user["_id"]})
    return {"message": "Account deleted"}
