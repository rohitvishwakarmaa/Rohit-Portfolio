from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=2000)

class ContactResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
