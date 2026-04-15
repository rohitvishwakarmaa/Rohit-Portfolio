from fastapi import APIRouter
from app.api.v1 import auth, ads, media, admin, contacts

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(ads.router, prefix="/ads", tags=["Ad Portfolio"])
api_router.include_router(media.router, prefix="/media", tags=["Media Upload"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Dashboard"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["Contact Messages"])
