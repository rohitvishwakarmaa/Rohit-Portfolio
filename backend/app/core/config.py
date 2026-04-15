from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator, field_validator
from typing import Optional, List, Union
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Premium AI Portfolio API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development" # "development" or "production"
    
    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            # Strip potential surrounding quotes that can occur with python-dotenv/terminal shells
            v = v.strip().strip("'").strip('"')
            
            if not v.startswith("["):
                return [i.strip() for i in v.split(",")]
            elif v.startswith("["):
                return json.loads(v)
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    # Security
    SECRET_KEY: str = "REPLACE_WITH_A_SUPER_SECRET_KEY_IN_PRODUCTION" # Use `openssl rand -hex 32`
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017" # Replace with MongoDB Atlas URI in production
    DATABASE_NAME: str = "portfolio_db"

    # Cloudinary
    CLOUDINARY_URL: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # SMTP Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Rohit Portfolio"
    
    # Notifications
    NOTIFICATION_EMAIL: str = "" # Email where contact messages will be sent

    model_config = SettingsConfigDict(env_file=str(ENV_PATH), case_sensitive=True, extra="ignore")

    @model_validator(mode='after')
    def check_secret_key(self):
        if self.ENVIRONMENT == "production" and self.SECRET_KEY == "REPLACE_WITH_A_SUPER_SECRET_KEY_IN_PRODUCTION":
            raise ValueError("SECRET_KEY must be properly configured in production environment! Use `openssl rand -hex 32`")
        return self

settings = Settings()
