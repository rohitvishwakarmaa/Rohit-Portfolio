from fastapi import APIRouter, Depends, status, Query
from typing import Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api import deps
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.contact_svc import contact_svc
from app.models.user import UserModel
from app.schemas.base import success_response

router = APIRouter()

@router.post("", response_model=None, status_code=status.HTTP_201_CREATED)
async def submit_contact(
    contact_in: ContactCreate,
    db: AsyncIOMotorDatabase = Depends(deps.get_db)
) -> Any:
    """
    Public Endpoint: Submit a contact message.
    """
    contact = await contact_svc.create_contact(db, contact_in)
    return success_response(data=contact.model_dump(by_alias=True), message="Message sent successfully")

@router.get("", response_model=None)
async def list_contacts(
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: List contact messages.
    """
    contacts, total = await contact_svc.get_contacts(db, skip=skip, limit=limit)
    return success_response(
        data=[c.model_dump(by_alias=True) for c in contacts],
        meta={"total": total, "skip": skip, "limit": limit}
    )

@router.patch("/{contact_id}/read", response_model=None)
async def mark_read(
    contact_id: str,
    db: AsyncIOMotorDatabase = Depends(deps.get_db),
    current_user: UserModel = Depends(deps.get_current_active_superuser)
) -> Any:
    """
    Admin Only: Mark a message as read.
    """
    success = await contact_svc.mark_as_read(db, contact_id)
    return success_response({"success": success})
