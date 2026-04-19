from fastapi import APIRouter, Depends
from database import users_collection
from models import UserOut
from auth_utils import require_admin

router = APIRouter()


@router.get("/agents", response_model=list[UserOut])
async def list_agents(admin=Depends(require_admin)):
    agents = []
    async for user in users_collection.find({"role": "agent"}):
        agents.append(UserOut(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
        ))
    return agents


@router.get("/", response_model=list[UserOut])
async def list_all_users(admin=Depends(require_admin)):
    users = []
    async for user in users_collection.find():
        users.append(UserOut(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            role=user["role"],
        ))
    return users
