"""
SmartSeason Email API
=====================
Standalone FastAPI app deployed on Vercel via Mangum (ASGI adapter).
The backend calls this service to send all transactional emails via Resend.
Protected by a shared API secret header.
"""
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from mangum import Mangum
from dotenv import load_dotenv
import resend
import os

from templates import welcome_html, verify_html, reset_html, field_alert_html

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL  = os.getenv("FROM_EMAIL",  "noreply@smartseason.app")
FROM_NAME   = os.getenv("FROM_NAME",   "SmartSeason")
API_SECRET  = os.getenv("API_SECRET",  "")

app = FastAPI(title="SmartSeason Email API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# ── Auth dependency ───────────────────────────────────────────────
def verify_secret(x_api_secret: str = Header(...)):
    if not API_SECRET or x_api_secret != API_SECRET:
        raise HTTPException(401, "Unauthorized")
    return True


# ── Request schemas ───────────────────────────────────────────────
class WelcomePayload(BaseModel):
    to: EmailStr
    name: str

class VerifyPayload(BaseModel):
    to: EmailStr
    name: str
    verify_url: str

class ResetPayload(BaseModel):
    to: EmailStr
    name: str
    reset_url: str

class AlertPayload(BaseModel):
    to: EmailStr
    name: str
    field_name: str
    message: str


# ── Helper ────────────────────────────────────────────────────────
def _send(to: str, subject: str, html: str) -> dict:
    params: resend.Emails.SendParams = {
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to],
        "subject": subject,
        "html": html,
    }
    resend.Emails.send(params)
    return {"ok": True}


# ── Endpoints ─────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "SmartSeason Email API"}


@app.post("/send/welcome")
async def send_welcome(payload: WelcomePayload, _=Depends(verify_secret)):
    return _send(payload.to, f"Welcome to SmartSeason, {payload.name}!", welcome_html(payload.name))


@app.post("/send/verify")
async def send_verify(payload: VerifyPayload, _=Depends(verify_secret)):
    return _send(payload.to, "Verify your SmartSeason email", verify_html(payload.name, payload.verify_url))


@app.post("/send/reset")
async def send_reset(payload: ResetPayload, _=Depends(verify_secret)):
    return _send(payload.to, "Reset your SmartSeason password", reset_html(payload.name, payload.reset_url))


@app.post("/send/field-alert")
async def send_alert(payload: AlertPayload, _=Depends(verify_secret)):
    return _send(payload.to, f"Field Alert: {payload.field_name}",
                 field_alert_html(payload.name, payload.field_name, payload.message))


# ── Vercel ASGI handler ───────────────────────────────────────────
handler = Mangum(app, lifespan="off")
