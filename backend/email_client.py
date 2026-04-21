"""
Email client — POSTs to the separate Python email-api hosted on Vercel.
The backend never sends email directly; Render's email delivery is unreliable.
"""
import httpx
from database import EMAIL_API_URL, EMAIL_API_SECRET

_HEADERS = {"Content-Type": "application/json", "x-api-secret": EMAIL_API_SECRET}


async def _post(path: str, payload: dict) -> bool:
    if not EMAIL_API_URL:
        print(f"[email] EMAIL_API_URL not set — skipping {path}")
        return False
    try:
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.post(f"{EMAIL_API_URL}{path}", json=payload, headers=_HEADERS)
            return r.status_code == 200
    except Exception as e:
        print(f"[email] failed {path}: {e}")
        return False


async def send_welcome(to: str, name: str) -> bool:
    return await _post("/send/welcome", {"to": to, "name": name})

async def send_verify(to: str, name: str, verify_url: str) -> bool:
    return await _post("/send/verify", {"to": to, "name": name, "verify_url": verify_url})

async def send_reset(to: str, name: str, reset_url: str) -> bool:
    return await _post("/send/reset", {"to": to, "name": name, "reset_url": reset_url})

async def send_field_alert(to: str, name: str, field_name: str, message: str) -> bool:
    return await _post("/send/field-alert", {"to": to, "name": name, "field_name": field_name, "message": message})
