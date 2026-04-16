from fastapi import APIRouter, Depends, status, Request, Response, BackgroundTasks
import logging

logger = logging.getLogger(__name__)
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api import deps
from app.core import security
from app.services.auth_svc import auth_svc
from app.services.email_svc import email_svc
from app.core.exceptions import CustomException
from app.schemas.user import Token, UserResponse
from app.schemas.base import success_response
from app.models.user import UserModel
from app.core.config import settings
from app.core.limiter import limiter
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr

router = APIRouter()

class OTPVerify(BaseModel):
    username: str
    otp: str

class OTPResend(BaseModel):
    username: str

# ── Forgot Password Schemas ──────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordOTPVerify(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

@router.post("/login", response_model=None)
async def login_access_token(
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, injects standard JSONResponse with HttpOnly cookies."""
    logger.info(f"Login attempt for: {form_data.username}")
    user_doc = await db["users"].find_one({"username": form_data.username})
    if not user_doc:
        user_doc = await db["users"].find_one({"email": form_data.username})
        
    is_valid = False
    if user_doc and "hashed_password" in user_doc:
        try:
            stored_hash = user_doc["hashed_password"]
            is_valid = security.verify_password(form_data.password, stored_hash)
            logger.info(f"Password verification for '{form_data.username}': Result={is_valid}, PassLen={len(form_data.password)}, HashLen={len(stored_hash)}")
        except Exception as e:
            logger.error(f"Password verification failed for '{form_data.username}' with error: {str(e)}")
            is_valid = False

    if not user_doc:
        logger.warning(f"Login failed: User '{form_data.username}' not found in database.")
        raise CustomException("Incorrect email/username or password", status_code=status.HTTP_401_UNAUTHORIZED)
    
    if not is_valid:
        logger.warning(f"Login failed: Invalid password for user '{form_data.username}'.")
        raise CustomException("Incorrect email/username or password", status_code=status.HTTP_401_UNAUTHORIZED)
        
    user = UserModel(**user_doc)
    if not user.is_active:
        raise CustomException("Inactive user", status_code=status.HTTP_400_BAD_REQUEST)
        
    access_token = security.create_access_token(user.id)
    # Generate persistent refresh token via Stateful DB
    refresh_token = await auth_svc.create_refresh_token(db, str(user.id))

    # GENERATE OTP (Sync with DB)
    otp = await auth_svc.generate_and_store_otp(db, str(user.id))
    
    # SEND EMAIL (Don't let SMTP timeout crash the login flow)
    try:
        email_res = await email_svc.send_otp(user.email, otp)
        if email_res and email_res.get("status") == "error":
            logger.error(f"SMTP Error: {email_res.get('message')}")
    except Exception as e:
        logger.error(f"SMTP Critical Error: {str(e)}")
    
    return success_response(
        data={
            "status": "otp_required",
            "message": f"OTP sent to {user.email}",
            "email": user.email,
            "username": form_data.username
        }
    )

@router.post("/verify-otp")
async def verify_otp(
    payload: OTPVerify,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """Verifies OTP and returns full tokens."""
    user_doc = await db["users"].find_one({"username": payload.username})
    if not user_doc:
        user_doc = await db["users"].find_one({"email": payload.username})
    
    if not user_doc:
        raise CustomException("User not found", status_code=status.HTTP_404_NOT_FOUND)
        
    user = UserModel(**user_doc)
    is_valid = await auth_svc.verify_otp(db, str(user.id), payload.otp)
    
    if not is_valid:
        raise CustomException("Invalid or expired OTP", status_code=status.HTTP_401_UNAUTHORIZED)
        
    access_token = security.create_access_token(user.id)
    refresh_token = await auth_svc.create_refresh_token(db, str(user.id))
    
    user_data = UserResponse(**user.model_dump()).model_dump(mode="json")
    
    payload_response = JSONResponse(content=success_response(
        data={
            "message": "Login successful",
            "user": user_data,
            "token": "cookie-managed"
        }
    ))
    
    cookie_samesite = "none" if settings.ENVIRONMENT == "production" else "lax"
    cookie_secure = True if settings.ENVIRONMENT == "production" else False

    payload_response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    payload_response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    )
    
    return payload_response

@router.post("/resend-otp")
async def resend_otp(
    payload: OTPResend,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """Resends a fresh OTP to the user's email."""
    user_doc = await db["users"].find_one({"username": payload.username})
    if not user_doc:
        user_doc = await db["users"].find_one({"email": payload.username})
        
    if not user_doc:
        raise CustomException("User not found", status_code=status.HTTP_404_NOT_FOUND)
        
    user = UserModel(**user_doc)
    otp = await auth_svc.generate_and_store_otp(db, str(user.id))
    email_res = await email_svc.send_otp(user.email, otp)
    if email_res and email_res.get("status") == "error":
        raise CustomException(
            message=f"Failed to send OTP email: {email_res.get('message')}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return success_response(data={"message": f"OTP sent to {user.email}"})


@router.post("/refresh")
async def refresh_token(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """Get new tokens using HttpOnly refresh cookie rotation"""
    old_token = request.cookies.get("refresh_token")
    if not old_token:
        raise CustomException("No refresh token provided", status_code=status.HTTP_401_UNAUTHORIZED)

    try:
        new_refresh_token = await auth_svc.rotate_refresh_token(db, old_token)
        
        # We need the user ID. But our rotate returns token.
        # Let's verify by extracting from old token locally
        payload = jwt.decode(old_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        new_access_token = security.create_access_token(user_id)
        
        cookie_samesite = "none" if settings.ENVIRONMENT == "production" else "lax"
        cookie_secure = True if settings.ENVIRONMENT == "production" else False
        
        payload_response = JSONResponse(content=success_response({"message": "Token refreshed via rotation"}))
        payload_response.set_cookie("access_token", new_access_token, httponly=True, secure=cookie_secure, samesite=cookie_samesite)
        payload_response.set_cookie("refresh_token", new_refresh_token, httponly=True, secure=cookie_secure, samesite=cookie_samesite)
        return payload_response
    except Exception as e:
        raise CustomException(str(e), status_code=status.HTTP_401_UNAUTHORIZED)

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """Terminates session by setting DB is_revoked to True and erasing cookies"""
    token = request.cookies.get("refresh_token")
    if token:
        try:
            await auth_svc.revoke_refresh_token(db, token)
        except Exception:
            pass
            
    cookie_samesite = "none" if settings.ENVIRONMENT == "production" else "lax"
    cookie_secure = True if settings.ENVIRONMENT == "production" else False

    payload_response = JSONResponse(content=success_response({"message": "Logged out successfully"}))
    payload_response.delete_cookie("access_token", httponly=True, secure=cookie_secure, samesite=cookie_samesite)
    payload_response.delete_cookie("refresh_token", httponly=True, secure=cookie_secure, samesite=cookie_samesite)
    return payload_response

@router.get("/me")
async def read_current_user(
    current_user: UserModel = Depends(deps.get_current_user)
) -> Any:
    """
    Get current user.
    """
    # Exclude hashed_password and normalize to UserResponse schema
    user_data = UserResponse(**current_user.model_dump()).model_dump(mode="json")
    return success_response(user_data)


# ── Forgot Password Flow ─────────────────────────────────────────────────────

@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
) -> Any:
    """Step 1 – Send a password-reset OTP to the given email.
    Always returns 200 so we don't reveal whether the email exists.
    """
    user_doc = await db["users"].find_one({"email": payload.email})
    if user_doc:
        user = UserModel(**user_doc)
        otp = await auth_svc.generate_and_store_otp(db, str(user.id))
        try:
            await email_svc.send_password_reset_otp(user.email, otp)
        except Exception as e:
            logger.error(f"Forgot password SMTP failure: {str(e)}")

    return success_response(data={
        "message": "If that email is registered, a reset code has been sent."
    })


@router.post("/forgot-password/verify-otp")
async def forgot_password_verify_otp(
    payload: ForgotPasswordOTPVerify,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
) -> Any:
    """Step 2 – Verify the OTP; on success return a short-lived reset token."""
    user_doc = await db["users"].find_one({"email": payload.email})
    if not user_doc:
        raise CustomException("Invalid or expired code", status_code=status.HTTP_400_BAD_REQUEST)

    user = UserModel(**user_doc)
    is_valid = await auth_svc.verify_otp(db, str(user.id), payload.otp)
    if not is_valid:
        raise CustomException("Invalid or expired code", status_code=status.HTTP_400_BAD_REQUEST)

    # Issue a 15-minute single-use reset token (JWT)
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    reset_token = jwt.encode(
        {"sub": str(user.id), "exp": expire, "type": "password_reset"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

    # Persist token so it can be single-use invalidated
    await db["password_reset_tokens"].insert_one({
        "user_id": str(user.id),
        "token": reset_token,
        "expires_at": expire,
        "is_used": False,
        "created_at": datetime.now(timezone.utc),
    })

    return success_response(data={"reset_token": reset_token})


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
) -> Any:
    """Step 3 – Set a new password using the reset token from step 2."""
    if not payload.new_password or len(payload.new_password) < 8:
        raise CustomException("Password must be at least 8 characters", status_code=status.HTTP_400_BAD_REQUEST)

    try:
        token_data = jwt.decode(
            payload.reset_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise CustomException("Invalid or expired reset token", status_code=status.HTTP_400_BAD_REQUEST)

    if token_data.get("type") != "password_reset":
        raise CustomException("Invalid token type", status_code=status.HTTP_400_BAD_REQUEST)

    user_id = token_data.get("sub")

    # Atomic check and mark as used to prevent race conditions (double submission)
    # We use find_one_and_update to ensure that the token is only used ONCE.
    token_doc = await db["password_reset_tokens"].find_one_and_update(
        {
            "token": payload.reset_token,
            "is_used": False,
        },
        {"$set": {"is_used": True}},
        # return_document=False means return the document BEFORE update
    )

    if not token_doc:
        logger.warning(f"Reset attempt failed: Token not found or already used. Token prefix: {payload.reset_token[:10]}...")
        raise CustomException("Reset token already used or invalid", status_code=status.HTTP_400_BAD_REQUEST)

    # Double check expiry from DB just in case
    db_expires_at = token_doc.get("expires_at")
    if db_expires_at:
        if db_expires_at.tzinfo is None:
            db_expires_at = db_expires_at.replace(tzinfo=timezone.utc)
        if db_expires_at < datetime.now(timezone.utc):
            logger.warning(f"Reset attempt failed: Token expired in DB for user {user_id}")
            raise CustomException("Reset token expired", status_code=status.HTTP_400_BAD_REQUEST)

    # Update password in the users collection
    from bson import ObjectId
    hashed_password = security.get_password_hash(payload.new_password)
    
    update_result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "hashed_password": hashed_password,
            "updated_at": datetime.now(timezone.utc)
        }},
    )

    if update_result.matched_count == 0:
        logger.error(f"Reset attempt failed: User record {user_id} not found in database.")
        raise CustomException("Account not found", status_code=status.HTTP_404_NOT_FOUND)

    logger.info(f"Password reset successful for user {user_id}")
    return success_response(data={"message": "Password reset successfully. Please log in."})
