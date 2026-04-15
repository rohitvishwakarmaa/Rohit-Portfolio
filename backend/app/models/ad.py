from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class AdModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str = Field(..., max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    cloudinary_public_id: Optional[str] = None
    source_type: str = Field(default="cloudinary") # 'cloudinary' | 'youtube'
    youtube_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: str
    client_name: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
