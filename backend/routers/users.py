from fastapi import APIRouter, Depends
from database import users_col
from auth_utils import require_admin
from helpers import user_to_out

router = APIRouter()

@router.get("/agents")
async def list_agents(admin=Depends(require_admin)):
    return [user_to_out(u) async for u in users_col.find({"role": "agent"})]

@router.get("/")
async def list_all(admin=Depends(require_admin)):
    return [user_to_out(u) async for u in users_col.find()]
