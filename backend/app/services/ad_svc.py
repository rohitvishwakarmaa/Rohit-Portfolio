from typing import List, Optional, Tuple
from bson import ObjectId
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.ad import AdModel
from app.schemas.ad import AdCreate, AdUpdate
from app.services.cloudinary_svc import cloudinary_svc

class AdService:
    @staticmethod
    async def get_ad_by_id(db: AsyncIOMotorDatabase, ad_id: str) -> Optional[AdModel]:
        try:
            document = await db["ads"].find_one({"_id": ObjectId(ad_id)})
            if document:
                return AdModel(**document)
        except Exception:
            pass
        return None

    @staticmethod
    async def get_ads(
        db: AsyncIOMotorDatabase, 
        skip: int = 0, 
        limit: int = 10, 
        include_inactive: bool = False,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[AdModel], int]:
        query = {}
        if not include_inactive:
            query["is_active"] = True
            
        if category and category != 'All':
            query["category"] = category
            
        if search:
            import re
            regex_query = {"$regex": re.compile(search, re.IGNORECASE)}
            query["$or"] = [
                {"title": regex_query},
                {"description": regex_query}
            ]
            
        cursor = db["ads"].find(query).sort(
            [("is_featured", -1), ("created_at", -1)]
        ).skip(skip).limit(limit)
        documents = await cursor.to_list(length=limit)
        total_count = await db["ads"].count_documents(query)
        
        return [AdModel(**doc) for doc in documents], total_count

    @staticmethod
    async def create_ad(db: AsyncIOMotorDatabase, ad_in: AdCreate) -> AdModel:
        payload = ad_in.model_dump()
        # Normalize optional fields from admin forms.
        if payload.get("tags") is None:
            payload["tags"] = []
        if isinstance(payload.get("client_name"), str) and not payload["client_name"].strip():
            payload["client_name"] = None

        ad_obj = AdModel(**payload)
        result = await db["ads"].insert_one(ad_obj.model_dump(by_alias=True, exclude={"id"}))
        ad_obj.id = result.inserted_id
        return ad_obj

    @staticmethod
    async def update_ad(db: AsyncIOMotorDatabase, ad_id: str, ad_in: AdUpdate) -> Optional[AdModel]:
        update_data = ad_in.model_dump(exclude_unset=True)
        if "tags" in update_data and update_data["tags"] is None:
            update_data["tags"] = []
        if "client_name" in update_data and isinstance(update_data["client_name"], str) and not update_data["client_name"].strip():
            update_data["client_name"] = None
        if not update_data:
            return await AdService.get_ad_by_id(db, ad_id)
            
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        try:
            result = await db["ads"].update_one(
                {"_id": ObjectId(ad_id)},
                {"$set": update_data}
            )
            if result.modified_count == 1:
                return await AdService.get_ad_by_id(db, ad_id)
        except Exception:
            pass
        return None
        
    @staticmethod
    async def delete_ad(db: AsyncIOMotorDatabase, ad_id: str) -> bool:
        try:
            # First find the ad to get the Cloudinary Public ID
            ad = await AdService.get_ad_by_id(db, ad_id)
            if not ad:
                return False
                
            # Delete from Cloudinary
            if ad.cloudinary_public_id:
                # We do this before DB deletion to ensure we have the ID, 
                # but if Cloudinary fails, we might still want to delete DB record.
                # However, for cost/management, Cloudinary cleanup is better.
                cloudinary_svc.delete_resource(ad.cloudinary_public_id, resource_type="video")
            
            # Delete from DB
            result = await db["ads"].delete_one({"_id": ObjectId(ad_id)})
            return result.deleted_count > 0
        except Exception:
            return False

ad_svc = AdService()
