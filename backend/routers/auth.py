from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from database import users_col, FRONTEND_URL, ADMIN_URL
from models import UserCreate, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
from auth_utils import hash_password, verify_password, create_access_token, create_otp, consume_otp, get_current_user
from helpers import user_to_out, nairobi_now, push_notification
from database import notifications_col
from email_client import send_welcome, send_verify, send_reset

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(data: UserCreate):
    if await users_col.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")
    now = nairobi_now()
    doc = {
        "name": data.name, "email": data.email, "password": hash_password(data.password),
        "role": data.role.value, "email_verified": False, "notif_pref": "both",
        "phone": None, "bio": None, "created_at": now, "updated_at": now,
    }
    result = await users_col.insert_one(doc)
    uid = str(result.inserted_id); doc["_id"] = result.inserted_id

    base = ADMIN_URL if data.role.value == "admin" else FRONTEND_URL
    verify_token = await create_otp(uid, "email_verify", ttl_hours=48)
    await send_verify(data.email, data.name, f"{base}/verify-email?token={verify_token}")
    await send_welcome(data.email, data.name)
    await push_notification(notifications_col, uid, "Welcome to SmartSeason 🌱",
        "Your account is active. Please verify your email.", "success")

    return Token(access_token=create_access_token({"sub": uid}), token_type="bearer", user=user_to_out(doc))


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    user = await users_col.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")
    return Token(access_token=create_access_token({"sub": str(user["_id"])}), token_type="bearer", user=user_to_out(user))


@router.post("/verify-email")
async def verify_email(data: VerifyEmailRequest):
    uid = await consume_otp(data.token, "email_verify")
    if not uid:
        raise HTTPException(400, "Invalid or expired verification token")
    await users_col.update_one({"_id": ObjectId(uid)}, {"$set": {"email_verified": True}})
    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(user=Depends(get_current_user)):
    if user.get("email_verified"):
        raise HTTPException(400, "Email already verified")
    uid = str(user["_id"])
    token = await create_otp(uid, "email_verify", ttl_hours=48)
    base = ADMIN_URL if user["role"] == "admin" else FRONTEND_URL
    await send_verify(user["email"], user["name"], f"{base}/verify-email?token={token}")
    return {"message": "Verification email sent"}


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await users_col.find_one({"email": data.email})
    if user:
        uid = str(user["_id"])
        token = await create_otp(uid, "password_reset", ttl_hours=2)
        base = ADMIN_URL if user["role"] == "admin" else FRONTEND_URL
        await send_reset(user["email"], user["name"], f"{base}/reset-password?token={token}")
    return {"message": "If that email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    uid = await consume_otp(data.token, "password_reset")
    if not uid:
        raise HTTPException(400, "Invalid or expired reset token")
    await users_col.update_one({"_id": ObjectId(uid)}, {"$set": {"password": hash_password(data.new_password)}})
    await push_notification(notifications_col, uid, "Password changed", "Your password was reset successfully.", "info")
    return {"message": "Password reset successfully"}


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return user_to_out(user)
