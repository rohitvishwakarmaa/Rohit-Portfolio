import time
import cloudinary
import cloudinary.utils
import cloudinary.api
import cloudinary.uploader
from app.core.config import settings

# Initialize Cloudinary Configuration
def _configure_cloudinary():
    if settings.CLOUDINARY_URL:
        # Robust parsing to ensure api_key and cloud_name are correctly extracted
        # Some versions of the library or environment loaders can be finicky with CLOUDINARY_URL
        try:
            import re
            match = re.match(r"cloudinary://([^:]+):([^@]+)@(.+)", settings.CLOUDINARY_URL)
            if match:
                api_key, api_secret, cloud_name = match.groups()
                cloudinary.config(
                    cloud_name=cloud_name,
                    api_key=api_key,
                    api_secret=api_secret,
                    secure=True
                )
            else:
                # Fallback to library's own parser if regex fails for some reason
                cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL, secure=True)
        except Exception:
            cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL, secure=True)
    elif settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )

_configure_cloudinary()

class CloudinaryService:
    @staticmethod
    def get_signed_url(public_id: str, resource_type: str = "video", expires_in_seconds: int = 3600) -> str:
        """
        Generate a signed URL for video delivery. 
        Returns an auto-formatted high-quality URL (MP4/WebM based on browser)
        which is natively supported by the <video> tag.
        """
        if not settings.CLOUDINARY_URL and (not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY):
            return f"https://example.com/mock_video.mp4"

        try:
            timestamp = int(time.time())
            expires_at = timestamp + expires_in_seconds
            
            # Use 'f_auto' and 'q_auto' for the best multi-browser compatibility and quality.
            # This will return a URL that browsers can play natively.
            url = cloudinary.utils.cloudinary_url(
                public_id,
                resource_type=resource_type,
                type="upload", 
                sign_url=True,
                expires_at=expires_at,
                format="mp4", # Enforce MP4 for maximum compatibility with simple <video> tags
                transformation=[
                    {"quality": "auto:best", "fetch_format": "auto"}
                ]
            )[0]
            return url
        except Exception:
            return f"https://res.cloudinary.com/demo/video/upload/{public_id}.mp4"

    @staticmethod
    def get_usage_stats() -> dict:
        """
        Fetch account usage statistics from Cloudinary (storage and credits).
        """
        try:
            # Requires Admin API permissions
            usage = cloudinary.api.usage()
            return {
                "plan": usage.get("plan"),
                "storage": {
                    "used": usage.get("storage", {}).get("usage"),
                    "limit": usage.get("storage", {}).get("limit"),
                    "used_percent": usage.get("storage", {}).get("used_percent")
                },
                "credits": {
                    "used": usage.get("credits", {}).get("usage"),
                    "limit": usage.get("credits", {}).get("limit"),
                    "used_percent": usage.get("credits", {}).get("used_percent")
                },
                "last_updated": usage.get("last_updated")
            }
        except Exception as e:
            return {"error": str(e)}
            
    @staticmethod
    def upload_video(file_path_or_buffer, public_id_prefix: str = "portfolio") -> dict:
        """
        Uploads a video to Cloudinary using chunked upload for larger files.
        Enables eager transformations to pre-generate high quality versions.
        """
        if not settings.CLOUDINARY_URL and (not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY):
            return {
                "public_id": "mock_id_dev_mode", 
                "secure_url": "https://example.com/mock.mp4",
                "format": "mp4"
            }
            
        try:
            # We use upload_large for files > 100MB, but it's safe for smaller ones too.
            # eager transformation helps pre-generate the HD version so it's ready for high-quality playback.
            result = cloudinary.uploader.upload_large(
                file_path_or_buffer,
                resource_type="video",
                folder=public_id_prefix,
                chunk_size=20000000, # Increased to 20MB Chunks for better performance on large files
                eager=[
                    {"streaming_profile": "hd", "format": "m3u8"}
                ],
                eager_async=True
            )
            return result
        except Exception as e:
            raise RuntimeError(f"Cloudinary upload failed: {e}")

    @staticmethod
    def upload_image(file_path_or_buffer, public_id_prefix: str = "portfolio/thumbnails") -> dict:
        """
        Uploads an image (thumbnail) to Cloudinary.
        """
        if not settings.CLOUDINARY_URL and (not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY):
            return {
                "public_id": "mock_thumbnail_dev_mode",
                "secure_url": "https://example.com/mock-thumbnail.jpg",
                "format": "jpg"
            }

        try:
            result = cloudinary.uploader.upload(
                file_path_or_buffer,
                resource_type="image",
                folder=public_id_prefix,
                quality="auto:best"
            )
            return result
        except Exception as e:
            raise RuntimeError(f"Cloudinary image upload failed: {e}")

    @staticmethod
    def delete_resource(public_id: str, resource_type: str = "video") -> dict:
        """
        Delete a resource from Cloudinary by its public ID.
        """
        if not settings.CLOUDINARY_URL and (not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY):
            return {"result": "ok", "mock": True}
            
        try:
            # We specifically use destroy which is the uploader method for single resource deletion
            result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
            return result
        except Exception as e:
            print(f"Cloudinary delete failed for {public_id}: {e}")
            return {"result": "error", "message": str(e)}

cloudinary_svc = CloudinaryService()
