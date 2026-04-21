from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os
from pathlib import Path
from dotenv import load_dotenv

# Always load .env from the same directory as this file,
# regardless of where uvicorn is launched from.
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path)

MONGO_URL    = os.getenv("MONGO_URL")
DB_NAME      = os.getenv("DB_NAME",   "smartseason")
SECRET_KEY   = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM    = os.getenv("ALGORITHM",  "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

EMAIL_API_URL    = os.getenv("EMAIL_API_URL",    "")
EMAIL_API_SECRET = os.getenv("EMAIL_API_SECRET", "")
FRONTEND_URL     = os.getenv("FRONTEND_URL",  "http://localhost:5173")
ADMIN_URL        = os.getenv("ADMIN_URL", "http://localhost:5174")

if not MONGO_URL:
    raise RuntimeError(
        f"MONGO_URL is not set. Add it to {_env_path}"
    )

client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

users_col         = db["users"]
fields_col        = db["fields"]
updates_col       = db["updates"]
notifications_col = db["notifications"]
tokens_col        = db["tokens"]


async def init_indexes():
    await users_col.create_index([("email", ASCENDING)], unique=True)
    await fields_col.create_index([("assigned_agent_id", ASCENDING)])
    await updates_col.create_index([("field_id", ASCENDING)])
    await updates_col.create_index([("created_at", ASCENDING)])
    await notifications_col.create_index([("user_id", ASCENDING)])
    await tokens_col.create_index([("token", ASCENDING)], unique=True)
    await tokens_col.create_index([("expires_at", ASCENDING)], expireAfterSeconds=0)
