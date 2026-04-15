import asyncio
import argparse
import sys
import os

# Add the project directory to the sys.path so we can import 'app' modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import UserModel
from app.schemas.user import UserCreate
from pydantic import ValidationError

async def create_admin(username: str = None, email: str = None, password: str = None):
    print("🚀 Initializing Admin Creation Process...")
    
    # Interactive Prompts if args aren't provided
    if not username:
        username = input("Enter Admin Username: ")
    if not email:
        email = input("Enter Admin Email: ")
    if not password:
        import getpass
        password = getpass.getpass("Enter Admin Password: ")
        
    try:
        # Step 1: Validate input securely against the strict Create schema
        create_payload = UserCreate(
            username=username,
            email=email,
            password=password
        )
        
        # Step 2: Once validated, build the backend insert payload natively
        user_data = {
            "username": create_payload.username,
            "email": create_payload.email,
            "hashed_password": get_password_hash(create_payload.password),
            "is_active": True,
            "is_superuser": True
        }
        user = UserModel(**user_data)
    except ValidationError as e:
        print(f"\n❌ Input Validation Error. Please review security requirements:\n{e}")
        return

    print("🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]
    
    # Check if user already exists
    existing_user = await db["users"].find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        print("❌ Error: A user with this username or email already exists.")
        client.close()
        return

    # Insert Superuser
    print("📝 Inserting Admin user into Database...")
    result = await db["users"].insert_one(user.model_dump(by_alias=True, exclude={"id"}))
    
    if result.inserted_id:
        print(f"✅ Success! Admin created with ID: {result.inserted_id}")
    else:
        print("❌ Failed to create admin user.")
        
    print("🔌 Closing MongoDB connection...")
    client.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create the initial admin user.")
    parser.add_argument("--username", help="The admin's username", type=str)
    parser.add_argument("--email", help="The admin's email address", type=str)
    parser.add_argument("--password", help="The admin's password", type=str)
    
    args = parser.parse_args()
    
    asyncio.run(create_admin(username=args.username, email=args.email, password=args.password))
