from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, fields, users, updates

app = FastAPI(title="SmartSeason API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(fields.router, prefix="/api/fields", tags=["fields"])
app.include_router(updates.router, prefix="/api/updates", tags=["updates"])

@app.get("/api/health")
async def health():
    return {"status": "ok"}
