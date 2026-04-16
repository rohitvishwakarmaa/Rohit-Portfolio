import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    uri = "mongodb+srv://rohitvishwakarmaarv_db_user:Mongo420@cluster0.5h4riki.mongodb.net/?appName=Cluster0"
    client = AsyncIOMotorClient(uri)
    db = client["portfolio_db"]
    
    users = await db["users"].find().to_list(length=100)
    for u in users:
        print(f"ID: {u['_id']}")
        print(f"Username: {u.get('username')}")
        print(f"Email: {u.get('email')}")
        print("-" * 20)

if __name__ == "__main__":
    asyncio.run(main())
