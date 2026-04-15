from fastapi import APIRouter, Depends
from typing import Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.models.user import UserModel
from app.schemas.base import success_response
from app.services.cloudinary_svc import cloudinary_svc
from app.services.settings_svc import settings_svc
from pydantic import BaseModel, EmailStr
import psutil

router = APIRouter()

@router.get("/overview", response_model=None)
async def get_admin_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Fast overview metrics to display on the main dashboard.
    """
    total_ads = await db["ads"].count_documents({})
    active_ads = await db["ads"].count_documents({"is_active": True})
    
    total_contacts = await db["contacts"].count_documents({})
    unread_contacts = await db["contacts"].count_documents({"is_read": False})
    
    # System Info
    system_load = psutil.cpu_percent()
    mem = psutil.virtual_memory()

    # Cloudinary Cloud Status
    cloudinary_stats = cloudinary_svc.get_usage_stats()

    return success_response({
        "ads": {
            "total": total_ads,
            "active": active_ads,
            "inactive": total_ads - active_ads
        },
        "contacts": {
            "total": total_contacts,
            "unread": unread_contacts
        },
        "system": {
            "cpu_usage_percent": system_load,
            "memory_usage_percent": mem.percent
        },
        "cloudinary": cloudinary_stats
    })

@router.get("/storage", response_model=None)
async def get_cloudinary_usage(
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Get detailed Cloudinary storage and credits info.
    """
    stats = cloudinary_svc.get_usage_stats()
    return success_response(data=stats)

class NotificationEmailUpdate(BaseModel):
    email: EmailStr

@router.get("/settings/notification-email")
async def get_notification_email(
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    email = await settings_svc.get_setting(db, "notification_email")
    return success_response({"email": email})

@router.post("/settings/notification-email")
async def update_notification_email(
    payload: NotificationEmailUpdate,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    await settings_svc.update_setting(db, "notification_email", payload.email)
    return success_response({"message": "Notification email updated successfully"})
