from fastapi import Depends, status
from fastapi import Depends, status, Request, HTTPException
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security.oauth2 import OAuth2
from fastapi.security.utils import get_authorization_scheme_param
from jose import jwt, JWTError
from pydantic import ValidationError
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.config import settings
from app.core.exceptions import CustomException
from app.schemas.user import TokenPayload
from app.models.user import UserModel
from app.db.mongodb import get_database

class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(self, tokenUrl: str):
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": {}})
        super().__init__(flows=flows)

    async def __call__(self, request: Request) -> str | None:
        # 1. Try auth header extraction (useful for swagger/API clients)
        authorization = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if authorization and scheme.lower() == "bearer":
            return param

        # 2. Try cookie extraction (primary for frontend React layer)
        cookie_token = request.cookies.get("access_token")
        if cookie_token:
            return cookie_token

        raise CustomException("Not authenticated", status_code=status.HTTP_401_UNAUTHORIZED)

reusable_oauth2 = OAuth2PasswordBearerWithCookie(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get the MongoDB database instance."""
    return get_database()

async def get_current_user(
    db: AsyncIOMotorDatabase = Depends(get_db),
    token: str = Depends(reusable_oauth2)
) -> UserModel:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        # We only accept access tokens here
        if token_data.type != "access":
            raise CustomException(
                "Invalid token type. Expected access token.",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
            
    except (JWTError, ValidationError):
        raise CustomException(
            "Could not validate credentials",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    try:
        user_id = ObjectId(token_data.sub)
    except:
        raise CustomException(
            "Invalid user ID in token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    user_doc = await db["users"].find_one({"_id": user_id})
    if not user_doc:
        raise CustomException(
            "User not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
        
    user = UserModel(**user_doc)
    if not user.is_active:
        raise CustomException(
            "Inactive user",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    return user

async def get_current_active_superuser(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    if not current_user.is_superuser:
        raise CustomException(
            "The user doesn't have enough privileges",
            status_code=status.HTTP_403_FORBIDDEN
        )
    return current_user
