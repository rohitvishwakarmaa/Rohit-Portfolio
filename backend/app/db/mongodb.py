import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db_instance = MongoDB()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    
    # Pre-flight check for placeholder password to prevent connection hangs/CORS errors
    if not settings.MONGODB_URI or "<db_password>" in settings.MONGODB_URI:
        logger.warning("⚠️ MONGODB_URI contains '<db_password>' placeholder. Skipping connection.")
        logger.info("👉 Please update MONGODB_URI in backend/.env with your actual password.")
        return

    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            tlsCAFile=certifi.where()
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        logger.info("Connected to MongoDB successfully!")
        
        # Ensure Indexes
        await create_indexes()
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def create_indexes():
    """Create necessary database indexes."""
    try:
        # User collection indexes
        await db_instance.db["users"].create_index("email", unique=True)
        await db_instance.db["users"].create_index("username", unique=True)
        
        # Ads / Videos collection indexes
        await db_instance.db["ads"].create_index("title")
        await db_instance.db["ads"].create_index("is_active")
        await db_instance.db["ads"].create_index([("created_at", -1)])
        
        # Refresh tokens
        await db_instance.db["refresh_tokens"].create_index("token", unique=True)
        await db_instance.db["refresh_tokens"].create_index("expires_at", expireAfterSeconds=0) # Automatically delete expired tokens from Database (TTL index)
        
        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

def get_database():
    return db_instance.db
