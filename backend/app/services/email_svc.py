import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:

    async def _send_email(
        self,
        recipient: str,
        subject: str,
        body: str,
        html: bool = False
    ):
        # 🔴 अगर credentials missing हैं → debug mode
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured. Skipping email send.")

            print("\n" + "=" * 50)
            print(f"DEBUG EMAIL (NOT SENT)")
            print(f"TO: {recipient}")
            print(f"SUBJECT: {subject}")
            print(f"MESSAGE: {body}")
            print("=" * 50 + "\n")

            return {
                "status": "debug",
                "message": "SMTP not configured"
            }

        # ✅ Email message बनाना
        message = MIMEMultipart()
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = recipient
        message["Subject"] = subject

        if html:
            message.attach(MIMEText(body, "html"))
        else:
            message.attach(MIMEText(body, "plain"))

        try:
            # ✅ SMTP send
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                use_tls=settings.SMTP_PORT == 465,
                start_tls=settings.SMTP_PORT == 587,
                timeout=10
            )

            logger.info(f"Email sent successfully to {recipient}")

            return {
                "status": "success",
                "message": f"Email sent to {recipient}"
            }

        except aiosmtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP AUTH ERROR: {e}")
            return {
                "status": "error",
                "type": "auth",
                "message": "SMTP authentication failed (check email/password)"
            }

        except aiosmtplib.SMTPException as e:
            logger.error(f"SMTP ERROR: {e}")
            return {
                "status": "error",
                "type": "smtp",
                "message": str(e)
            }

        except Exception as e:
            logger.error(f"GENERAL ERROR: {e}")
            return {
                "status": "error",
                "type": "unknown",
                "message": str(e)
            }

    # ✅ OTP email
    async def send_otp(self, recipient: str, otp: str):
        subject = f"{otp} is your verification code"
        body = f"Your OTP for login is: {otp}. It will expire in 5 minutes."

        return await self._send_email(recipient, subject, body)

    # ✅ Password reset OTP email
    async def send_password_reset_otp(self, recipient: str, otp: str):
        subject = f"{otp} – Password Reset Code"
        body = (
            f"You requested a password reset for your Admin account.\n\n"
            f"Your reset code is: {otp}\n\n"
            f"This code expires in 5 minutes. If you did not request this, ignore this email."
        )
        return await self._send_email(recipient, subject, body)

    # ✅ Contact form email
    async def send_contact_notification(self, recipient: str, contact_data: dict):
        subject = f"New Message from {contact_data.get('name')}"

        body = f"""
You have a new message from your portfolio:

Name: {contact_data.get('name')}
Email: {contact_data.get('email')}
Message: {contact_data.get('message')}

Date: {contact_data.get('created_at')}
"""

        return await self._send_email(recipient, subject, body)


# ✅ Singleton instance
email_svc = EmailService()