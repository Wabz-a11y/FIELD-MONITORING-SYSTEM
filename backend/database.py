from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smartseason")
SECRET_KEY = os.getenv("SECRET_KEY", "smartseason-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

users_collection = db["users"]
fields_collection = db["fields"]
updates_collection = db["updates"]

async def init_indexes():
    await users_collection.create_index([("email", ASCENDING)], unique=True)
    await fields_collection.create_index([("assigned_agent_id", ASCENDING)])
    await updates_collection.create_index([("field_id", ASCENDING)])
    await updates_collection.create_index([("created_at", ASCENDING)])
