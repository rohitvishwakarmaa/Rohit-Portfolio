import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.services.email_svc import email_svc

async def main():
    res = await email_svc.send_password_reset_otp("rohitvishwakarmaarv@gmail.com", "123456")
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
