from datetime import datetime, timedelta
from typing import Optional
import secrets, pytz

from jose import JWTError, jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId

from database import users_col, tokens_col, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

NAIROBI = pytz.timezone("Africa/Nairobi")

ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2, hash_len=32, salt_len=16)
bearer = HTTPBearer()


def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except (VerifyMismatchError, Exception):
        return False

def now() -> datetime:
    return datetime.now(NAIROBI)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = {**data, "exp": now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def create_otp(user_id: str, purpose: str, ttl_hours: int = 24) -> str:
    token = secrets.token_urlsafe(48)
    await tokens_col.insert_one({
        "token": token, "user_id": user_id,
        "purpose": purpose, "expires_at": now() + timedelta(hours=ttl_hours),
    })
    return token

async def consume_otp(token: str, purpose: str) -> Optional[str]:
    doc = await tokens_col.find_one({"token": token, "purpose": purpose})
    if not doc:
        return None
    exp = doc["expires_at"]
    if exp.tzinfo is None:
        exp = pytz.utc.localize(exp)
    if now() > exp.astimezone(NAIROBI):
        await tokens_col.delete_one({"_id": doc["_id"]})
        return None
    await tokens_col.delete_one({"_id": doc["_id"]})
    return doc["user_id"]

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        uid = payload.get("sub")
        if not uid:
            raise exc
    except JWTError:
        raise exc
    user = await users_col.find_one({"_id": ObjectId(uid)})
    if not user:
        raise exc
    return user

async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user
