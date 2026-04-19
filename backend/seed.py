"""
seed.py — Populate SmartSeason with demo data.
Run after starting MongoDB: python seed.py
"""
import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from bson import ObjectId

MONGO_URL = "mongodb://localhost:27017"
DB_NAME   = "smartseason"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Wipe
    await db.users.delete_many({})
    await db.fields.delete_many({})
    await db.updates.delete_many({})

    now = datetime.now(timezone.utc)

    # ── Users ──────────────────────────────────────────────────────
    admin_id   = ObjectId()
    agent1_id  = ObjectId()
    agent2_id  = ObjectId()

    await db.users.insert_many([
        {"_id": admin_id,  "name": "Alice Coordinator", "email": "admin@farm.com",  "password": pwd_context.hash("password"), "role": "admin"},
        {"_id": agent1_id, "name": "Bob Field Agent",   "email": "bob@farm.com",    "password": pwd_context.hash("password"), "role": "agent"},
        {"_id": agent2_id, "name": "Carol Grower",      "email": "carol@farm.com",  "password": pwd_context.hash("password"), "role": "agent"},
    ])

    # ── Fields ─────────────────────────────────────────────────────
    fields_data = [
        {"name": "North Block A",  "crop_type": "Maize",   "planting_date": now - timedelta(days=45), "stage": "growing",   "agent": agent1_id},
        {"name": "South Ridge",    "crop_type": "Wheat",   "planting_date": now - timedelta(days=70), "stage": "ready",     "agent": agent1_id},
        {"name": "East Pasture",   "crop_type": "Soybean", "planting_date": now - timedelta(days=20), "stage": "planted",   "agent": agent2_id},
        {"name": "West Block",     "crop_type": "Maize",   "planting_date": now - timedelta(days=90), "stage": "harvested", "agent": agent2_id},
        {"name": "Valley Plot",    "crop_type": "Barley",  "planting_date": now - timedelta(days=55), "stage": "growing",   "agent": agent1_id},
        {"name": "Hilltop Field",  "crop_type": "Cotton",  "planting_date": now - timedelta(days=30), "stage": "planted",   "agent": None},
    ]

    field_ids = []
    for f in fields_data:
        fid = ObjectId()
        field_ids.append(fid)
        await db.fields.insert_one({
            "_id": fid,
            "name": f["name"],
            "crop_type": f["crop_type"],
            "planting_date": f["planting_date"],
            "stage": f["stage"],
            "location": f"GPS: {round(-1.28 + (len(f['name'])*0.01), 4)}, {round(36.81 + (len(f['name'])*0.01), 4)}",
            "size_hectares": round(1.5 + len(f["name"]) * 0.2, 1),
            "assigned_agent_id": str(f["agent"]) if f["agent"] else None,
            "created_at": now - timedelta(days=100),
            "updated_at": now - timedelta(days=2),
        })

    # ── Updates ────────────────────────────────────────────────────
    updates_data = [
        (field_ids[0], agent1_id, "growing",   "Plants are at knee height, looking healthy. No pest signs.", 8,  5),
        (field_ids[0], agent1_id, None,        "Irrigation adjusted for dry spell.", 7, 2),
        (field_ids[1], agent1_id, "ready",     "Grain heads fully formed, ready for harvest soon.", 9, 4),
        (field_ids[1], agent1_id, None,        "Spotted minor fungal patches, applying fungicide.", 5, 8),
        (field_ids[2], agent2_id, "planted",   "Seeds sown evenly across the plot. Soil moisture good.", 7, 18),
        (field_ids[3], agent2_id, "harvested", "Harvest complete. Yield was 4.2 tonnes/ha.", 10, 10),
        (field_ids[4], agent1_id, None,        "Barley growing well but noticed aphids in southeast corner.", 4, 3),
    ]

    for (fid, aid, stage, notes, score, days_ago) in updates_data:
        await db.updates.insert_one({
            "field_id": str(fid),
            "agent_id": str(aid),
            "stage": stage,
            "notes": notes,
            "health_score": score,
            "created_at": now - timedelta(days=days_ago),
        })

    print("✅ Seed complete!")
    print("   Admin:  admin@farm.com  / password")
    print("   Agent1: bob@farm.com    / password")
    print("   Agent2: carol@farm.com  / password")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
