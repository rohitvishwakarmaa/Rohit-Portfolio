from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.user import PyObjectId

class AdBase(BaseModel):
    title: str = Field(..., max_length=150, description="The title of the ad video")
    description: Optional[str] = Field(None, max_length=1000)
    cloudinary_public_id: Optional[str] = Field(None, description="The Cloudinary public ID for the video source")
    source_type: str = Field("cloudinary", description="'cloudinary' or 'youtube'")
    youtube_id: Optional[str] = Field(None, description="The YouTube video ID")
    thumbnail_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: str = Field(..., description="The category of the AI ad")
    client_name: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True

class AdCreate(AdBase):
    pass

class AdUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    cloudinary_public_id: Optional[str] = None
    source_type: Optional[str] = None
    youtube_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    client_name: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class AdInDBBase(AdBase):
    id: PyObjectId

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {PyObjectId: str}

class AdResponse(AdInDBBase):
    """
    Standard Response format for an Ad inside DB.
    Includes the dynamically generated HLS streaming URL.
    """
    video_url: str = Field(..., description="The signed Cloudinary URL or YouTube embed URL")
    source_type: str
    youtube_id: Optional[str] = None
    thumbnail: Optional[str] = Field(None, description="Mapped from thumbnail_url")
    created_at: datetime
    updated_at: datetime
