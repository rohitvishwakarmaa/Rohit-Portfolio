from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import random
import string

from app.core.config import settings
from app.core.security import create_refresh_token as generate_jwt_refresh_token
from app.services.email_svc import email_svc

class AuthService:
    
    @staticmethod
    async def create_refresh_token(db: AsyncIOMotorDatabase, admin_id: str) -> str:
        """Generates a JWT Refresh Token and stores it persistently."""
        # Generate the raw JWT
        token = generate_jwt_refresh_token(
            subject=admin_id,
            expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        # Calculate expiry explicitly for DB reference check
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        # Insert stateful tracking record
        await db["refresh_tokens"].insert_one({
            "token": token,
            "admin_id": admin_id,
            "expires_at": expires_at,
            "is_revoked": False,
            "created_at": datetime.now(timezone.utc)
        })

        return token

    @staticmethod
    async def rotate_refresh_token(db: AsyncIOMotorDatabase, old_token: str) -> str:
        """Verifies old token, revokes it, and generates a new one."""
        token_data = await db["refresh_tokens"].find_one({"token": old_token})

        if not token_data or token_data.get("is_revoked"):
            raise Exception("Invalid refresh token")

        # Make sure token_data["expires_at"] has timezone info if needed, but simple comparison works safely
        if token_data["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise Exception("Refresh token expired")

        # Revoke the old token immediately
        await db["refresh_tokens"].update_one(
            {"token": old_token},
            {"$set": {"is_revoked": True}}
        )

        # Create new token for identical admin account
        new_token = await AuthService.create_refresh_token(db, token_data["admin_id"])

        return new_token

    @staticmethod
    async def revoke_refresh_token(db: AsyncIOMotorDatabase, token: str) -> None:
        """Forces a single token out of lifecycle."""
        await db["refresh_tokens"].update_one(
            {"token": token},
            {"$set": {"is_revoked": True}}
        )

    @staticmethod
    async def generate_and_store_otp(db: AsyncIOMotorDatabase, user_id: str) -> str:
        """Generates a 6-digit OTP and stores it in DB."""
        otp = "".join(random.choices(string.digits, k=6))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        
        # Store in DB
        await db["otps"].update_one(
            {"user_id": user_id},
            {"$set": {
                "otp": otp,
                "expires_at": expires_at,
                "created_at": datetime.now(timezone.utc)
            }},
            upsert=True
        )
        
        return otp

    @staticmethod
    async def verify_otp(db: AsyncIOMotorDatabase, user_id: str, otp: str) -> bool:
        """Verifies the OTP session."""
        doc = await db["otps"].find_one({"user_id": user_id, "otp": otp})
        if not doc:
            return False
            
        if doc["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            return False
            
        # Delete OTP after successful use
        await db["otps"].delete_one({"_id": doc["_id"]})
        return True

auth_svc = AuthService()
