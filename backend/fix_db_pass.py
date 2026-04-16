import asyncio
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.core.security import get_password_hash

async def main():
    uri = "mongodb+srv://rohitvishwakarmaarv_db_user:Mongo420@cluster0.5h4riki.mongodb.net/?appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client["portfolio_db"]
    
    new_hash = get_password_hash("admin123")
    print(f"Generated new hash: {new_hash}")
    
    result = await db["users"].update_many(
        {}, 
        {"$set": {"hashed_password": new_hash}}
    )
    print(f"Updated {result.modified_count} user(s).")

if __name__ == "__main__":
    asyncio.run(main())
