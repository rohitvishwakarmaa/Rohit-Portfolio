from fastapi import APIRouter, Depends, status, Query
from typing import Any
import re
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.schemas.ad import AdCreate, AdUpdate, AdResponse
from app.models.user import UserModel
from app.services.ad_svc import ad_svc
from app.services.cloudinary_svc import cloudinary_svc
from app.core.exceptions import CustomException
from app.schemas.base import success_response

router = APIRouter()

def extract_youtube_id(url: str) -> str:
    """
    Extracts the 11-character YouTube video ID from various URL formats.
    Returns the original string if no match is found (assuming it might already be an ID).
    """
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else url

def model_to_response(ad) -> dict:
    data = ad.model_dump()
    
    if data.get("source_type") == "youtube" and data.get("youtube_id"):
        # Use no-cookie for better privacy/speed and modestbranding for cleaner UI
        data["video_url"] = f"https://www.youtube-nocookie.com/embed/{data['youtube_id']}?modestbranding=1&rel=0&iv_load_policy=3&playsinline=1"
    elif data.get("cloudinary_public_id"):
        data["video_url"] = cloudinary_svc.get_signed_url(data["cloudinary_public_id"])
    else:
        data["video_url"] = ""
        
    data["thumbnail"] = ad.thumbnail_url
    return data

@router.get("", response_model=None)
async def list_ads(
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category: str = Query(None, description="Filter by category exact match"),
    search: str = Query(None, description="Search term for title or description regex match")
) -> Any:
    """
    Public Endpoint: Get a list of active ads with signed video URLs.
    """
    ads, total = await ad_svc.get_ads(db, skip=skip, limit=limit, include_inactive=False, category=category, search=search)
    
    # Process dynamically generated URLs
    processed_ads = [model_to_response(ad) for ad in ads]
    
    return success_response(
        data=processed_ads,
        meta={"total": total, "skip": skip, "limit": limit}
    )

@router.get("/{ad_id}", response_model=None)
async def get_ad(
    ad_id: str,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Public Endpoint: Get a single active ad by ID with signed video URLs.
    """
    ad = await ad_svc.get_ad_by_id(db, ad_id)
    if not ad or not ad.is_active:
        raise CustomException(
            "Ad not found", status_code=status.HTTP_404_NOT_FOUND
        )
    
    return success_response(data=model_to_response(ad))

@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def create_ad(
    ad_in: AdCreate,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Create a new Ad.
    """
    if ad_in.source_type == "youtube" and ad_in.youtube_id:
        ad_in.youtube_id = extract_youtube_id(ad_in.youtube_id)
        
    ad = await ad_svc.create_ad(db, ad_in)
    return success_response(model_to_response(ad))

@router.put("/{ad_id}", response_model=None)
async def update_ad(
    ad_id: str,
    ad_in: AdUpdate,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Update an Ad.
    """
    if ad_in.youtube_id:
        ad_in.youtube_id = extract_youtube_id(ad_in.youtube_id)
        
    ad = await ad_svc.update_ad(db, ad_id, ad_in)
    if not ad:
        raise CustomException(
            "Ad not found", status_code=status.HTTP_404_NOT_FOUND
        )
    return success_response(model_to_response(ad))

@router.delete("/{ad_id}", response_model=None)
async def delete_ad(
    ad_id: str,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Delete an Ad.
    """
    success = await ad_svc.delete_ad(db, ad_id)
    if not success:
        raise CustomException("Ad not found or could not be deleted", status_code=status.HTTP_404_NOT_FOUND)
    return success_response({"deleted": True})
