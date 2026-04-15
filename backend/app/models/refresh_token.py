from datetime import datetime, timezone
from pydantic import BaseModel, Field

class RefreshTokenModel(BaseModel):
    token: str
    admin_id: str
    expires_at: datetime
    is_revoked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
