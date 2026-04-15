from typing import Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.config import settings

class SettingsService:
    async def get_setting(self, db: AsyncIOMotorDatabase, key: str, default: Any = None) -> Any:
        doc = await db["settings"].find_one({"key": key})
        if doc:
            return doc.get("value")
        # Fallback to config settings if exists
        if key == "notification_email":
            return settings.NOTIFICATION_EMAIL or default
        return default

    async def update_setting(self, db: AsyncIOMotorDatabase, key: str, value: Any) -> bool:
        await db["settings"].update_one(
            {"key": key},
            {"$set": {"value": value, "key": key}},
            upsert=True
        )
        return True

settings_svc = SettingsService()
