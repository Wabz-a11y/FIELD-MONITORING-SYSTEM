from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from database import init_indexes
from routers import auth, profile, users, fields, updates, notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_indexes()
    yield

app = FastAPI(title="SmartSeason API", version="2.0.0", lifespan=lifespan)

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    os.getenv("ADMIN_URL",    "http://localhost:5174"),
    "http://localhost:5173", "http://localhost:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,          prefix="/api/auth",          tags=["auth"])
app.include_router(profile.router,       prefix="/api/profile",       tags=["profile"])
app.include_router(users.router,         prefix="/api/users",         tags=["users"])
app.include_router(fields.router,        prefix="/api/fields",        tags=["fields"])
app.include_router(updates.router,       prefix="/api/updates",       tags=["updates"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

@app.get("/api/health")
async def health():
    return {"status": "ok"}
