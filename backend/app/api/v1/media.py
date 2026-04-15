from fastapi import APIRouter, Depends, UploadFile, File, status, BackgroundTasks
from typing import Any
import tempfile
import os
from pathlib import Path

from app.api import deps
from app.models.user import UserModel
from app.services.cloudinary_svc import cloudinary_svc
from app.core.exceptions import CustomException
from app.schemas.base import success_response

router = APIRouter()

ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"]
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB Limit
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB Limit

@router.post("/upload/video", response_model=None)
async def upload_media_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    # current_user: UserModel = Depends(deps.get_current_active_superuser) # TEMP DISABLED FOR DEBUG
) -> Any:
    """
    Upload a video file to Cloudinary and return the public_id and details.
    """
    print(f"--- UPLOAD START (AUTH DISABLED): {file.filename} ---")
    print(f"STEP 1: SKIPPED AUTH CHECK for debugging.")

    
    if not file.content_type.startswith("video/") and file.content_type not in ALLOWED_VIDEO_TYPES:
        print(f"ERROR: Invalid content type {file.content_type}")
        raise CustomException(
            f"File type {file.content_type} not supported. Use MP4, MOV or WebM.",
            status_code=status.HTTP_400_BAD_REQUEST
        )
        
    # Create a safe temporary file
    suffix = Path(file.filename).suffix if file.filename else ".tmp"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name
    
    try:
        print(f"STEP 2: Saving stream to {temp_path}...")
        with temp_file:
            import shutil
            # This is the heavy lifting step
            shutil.copyfileobj(file.file, temp_file)
            
        file_size = os.path.getsize(temp_path)
        print(f"STEP 3: File saved to disk. Size: {file_size / (1024*1024):.2f} MB")
        
        if file_size > MAX_VIDEO_SIZE:
             print(f"ERROR: File too large ({file_size} bytes)")
             raise CustomException(
                f"File too large. Maximum size is {int(MAX_VIDEO_SIZE / (1024*1024))}MB",
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            )

        if file_size == 0:
            print("ERROR: Empty file")
            raise CustomException("File is empty", status_code=status.HTTP_400_BAD_REQUEST)

        print(f"STEP 4: Starting Cloudinary transfer (Background Worker)...")
        try:
            import anyio
            # Use run_sync to prevent blocking the main event loop
            upload_result = await anyio.to_thread.run_sync(
                cloudinary_svc.upload_video, 
                temp_path, 
                "portfolio/ads"
            )
            print(f"STEP 5: Cloudinary transfer COMPLETE. Public ID: {upload_result.get('public_id')}")
        except Exception as e:
            print(f"ERROR Step 4 Failed: {e}")
            raise CustomException(
                f"Cloudinary Upload Failed: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        print(f"STEP 6: Returning success response. Bytes: {file_size}")
        return success_response({
            "public_id": upload_result.get("public_id"),
            "format": upload_result.get("format"),
            "original_filename": file.filename,
            "bytes": file_size
        })
    finally:
        print(f"--- UPLOAD FINISH: Cleaning up {temp_path} ---")
        background_tasks.add_task(os.remove, temp_path)


@router.post("/upload/image", response_model=None)
async def upload_media_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Upload a thumbnail image to Cloudinary.
    Returns secure URL + public_id for saving against an Ad.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise CustomException(
            f"Unsupported image type. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # Create a safe temporary file
    suffix = Path(file.filename).suffix if file.filename else ".tmp"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name
    
    try:
        print(f"DEBUG: Saving uploaded image to {temp_path}...")
        with temp_file:
            import shutil
            shutil.copyfileobj(file.file, temp_file)
            
        file_size = os.path.getsize(temp_path)
        print(f"DEBUG: Image saved. Size: {file_size} bytes.")

        if file_size > MAX_IMAGE_SIZE:
            raise CustomException(
                f"Image too large. Maximum size is {int(MAX_IMAGE_SIZE / (1024*1024))}MB",
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
            )

        if file_size == 0:
            raise CustomException("Image file is empty", status_code=status.HTTP_400_BAD_REQUEST)

        print("DEBUG: Uploading image via worker thread...")
        try:
            import anyio
            upload_result = await anyio.to_thread.run_sync(
                cloudinary_svc.upload_image,
                temp_path,
                "portfolio/thumbnails"
            )
            print("DEBUG: Cloudinary image upload successful.")
        except Exception as e:
            print(f"DEBUG: Cloudinary image upload failed: {e}")
            raise CustomException(
                f"Cloudinary Image Upload Failed: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

            
        return success_response({
            "public_id": upload_result.get("public_id"),
            "secure_url": upload_result.get("secure_url"),
            "format": upload_result.get("format"),
            "original_filename": file.filename,
            "bytes": file_size
        })


    finally:
        background_tasks.add_task(os.remove, temp_path)
