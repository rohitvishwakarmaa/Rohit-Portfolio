from pydantic import BaseModel, EmailStr, field_validator
import re
from typing import Optional
from app.models.user import PyObjectId

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    type: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("Password must contain at least one special character (@, $, !, %, *, ?, &)")
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: PyObjectId

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {PyObjectId: str}

# Public Facing Response
class UserResponse(UserInDBBase):
    pass
