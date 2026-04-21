import pytz
from datetime import datetime
from models import UserOut, NotifPref

NAIROBI = pytz.timezone("Africa/Nairobi")

def nairobi_now() -> datetime:
    return datetime.now(NAIROBI)

def user_to_out(u: dict) -> UserOut:
    name = u.get("name", "?")
    initials = "".join(p[0].upper() for p in name.split()[:2])
    return UserOut(
        id=str(u["_id"]), name=name, email=u["email"], role=u["role"],
        email_verified=u.get("email_verified", False),
        avatar_initials=initials,
        notif_pref=u.get("notif_pref", NotifPref.both),
        phone=u.get("phone"), bio=u.get("bio"),
        created_at=u.get("created_at", nairobi_now()),
    )

async def push_notification(db_notifications, user_id: str, title: str, message: str, type: str = "info"):
    await db_notifications.insert_one({
        "user_id": user_id, "title": title, "message": message,
        "type": type, "read": False, "created_at": nairobi_now(),
    })
