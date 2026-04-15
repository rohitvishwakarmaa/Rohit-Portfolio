from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Any
from app.core.config import settings

class CustomException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: Any = None):
        self.message = message
        self.status_code = status_code
        self.details = details

def setup_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(CustomException)
    async def custom_exception_handler(request: Request, exc: CustomException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "data": None,
                "meta": {},
                "error": {
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "data": None,
                "meta": {},
                "error": {
                    "message": "Validation Error",
                    "details": exc.errors()
                }
            }
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "data": None,
                "meta": {},
                "error": {
                    "message": "Internal Server Error",
                    "details": str(exc) if settings.ENVIRONMENT == "development" else "An unexpected error occurred."
                }
            }
        )
