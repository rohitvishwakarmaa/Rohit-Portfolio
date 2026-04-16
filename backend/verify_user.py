import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    uri = "mongodb+srv://rohitvishwakarmaarv_db_user:Mongo420@cluster0.5h4riki.mongodb.net/?appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client["portfolio_db"]
    
    user = await db["users"].find_one({"email": "rohitvishwakarmaarv@gmail.com"})
    if user:
        print(f"User: {user['username']}, Email: '{user['email']}', Hash: {user['hashed_password']}")
    else:
        print("User not found")

if __name__ == "__main__":
    asyncio.run(main())
