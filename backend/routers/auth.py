from fastapi import APIRouter, HTTPException, status, Depends
from database import users_collection
from models import UserCreate, UserLogin, Token, UserOut
from auth_utils import hash_password, verify_password, create_access_token, get_current_user
from bson import ObjectId

router = APIRouter()


def user_to_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user["role"],
    )


@router.post("/register", response_model=Token)
async def register(data: UserCreate):
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": data.role.value,
    }
    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})
    return Token(access_token=token, token_type="bearer", user=user_to_out(user_doc))


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    user = await users_collection.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return Token(access_token=token, token_type="bearer", user=user_to_out(user))


@router.get("/me", response_model=UserOut)
async def me(current_user=Depends(get_current_user)):
    return user_to_out(current_user)
