from typing import List, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.contact import ContactModel
from app.schemas.contact import ContactCreate
from app.services.email_svc import email_svc
from app.services.settings_svc import settings_svc
from bson import ObjectId

class ContactService:
    async def create_contact(self, db: AsyncIOMotorDatabase, contact_in: ContactCreate) -> ContactModel:
        contact_obj = ContactModel(**contact_in.model_dump())
        result = await db["contacts"].insert_one(contact_obj.model_dump(by_alias=True, exclude={"id"}))
        contact_obj.id = result.inserted_id
        
        # Send Notification Email
        notify_email = await settings_svc.get_setting(db, "notification_email")
        if notify_email:
            await email_svc.send_contact_notification(notify_email, contact_obj.model_dump(mode="json"))
            
        return contact_obj

    async def get_contacts(
        self, db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 20
    ) -> Tuple[List[ContactModel], int]:
        total = await db["contacts"].count_documents({})
        cursor = db["contacts"].find().sort("created_at", -1).skip(skip).limit(limit)
        contacts = [ContactModel(**doc) async for doc in cursor]
        return contacts, total

    async def mark_as_read(self, db: AsyncIOMotorDatabase, contact_id: str) -> bool:
        result = await db["contacts"].update_one(
            {"_id": ObjectId(contact_id)}, {"$set": {"is_read": True}}
        )
        return result.modified_count > 0

contact_svc = ContactService()
