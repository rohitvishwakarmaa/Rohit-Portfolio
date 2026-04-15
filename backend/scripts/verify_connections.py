import sys
import os
import asyncio

# Add the project directory to the sys.path so we can import 'app' modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
import cloudinary
import cloudinary.api
from app.core.config import settings

async def test_mongodb():
    print("\n[DEBUG] Testing MongoDB Connection...")
    uri = settings.MONGODB_URI
    db_name = settings.DATABASE_NAME
    
    if not uri or "<db_password>" in uri:
        print("[ERROR] MongoDB URI is missing or contains the <db_password> placeholder.")
        print(f"Current URI: {uri}")
        return False
        
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        # The 'admin' database is always there, we just ping it
        await client.admin.command('ping')
        print(f"[SUCCESS] MongoDB Connected successfully to database: {db_name}")
        client.close()
        return True
    except Exception as e:
        print(f"[ERROR] MongoDB Connection Failed: {e}")
        return False

def test_cloudinary():
    print("\n[DEBUG] Testing Cloudinary Connection...")
    url = settings.CLOUDINARY_URL
    
    if not url or "<your_api_key>" in url:
        print("[ERROR] Cloudinary URL is missing or contains placeholders.")
        return False
        
    try:
        # Explicitly configure using the URL from settings
        cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
        
        config = cloudinary.config()
        if not config.cloud_name:
            print("[ERROR] Cloudinary configuration not found (check CLOUDINARY_URL).")
            return False
            
        # Try a simple API call to verify credentials
        result = cloudinary.api.root_folders()
        print(f"[SUCCESS] Cloudinary Connected successfully as: {config.cloud_name}")
        return True
    except Exception as e:
        print(f"[ERROR] Cloudinary Connection Failed: {e}")
        return False

async def main():
    print("Starting Connection Verification...")
    
    db_ok = await test_mongodb()
    cloud_ok = test_cloudinary()
    
    print("\n--- Summary ---")
    print(f"MongoDB:    {'OK' if db_ok else 'FAILED'}")
    print(f"Cloudinary: {'OK' if cloud_ok else 'FAILED'}")
    
    if not db_ok or not cloud_ok:
        print("\nTip: Make sure your .env file is correctly filled out.")
        if not db_ok:
            print("   - Replace <db_password> in MONGODB_URI with your actual password.")
        if not cloud_ok:
            print("   - Ensure CLOUDINARY_URL is correct in .env.")

if __name__ == "__main__":
    asyncio.run(main())
