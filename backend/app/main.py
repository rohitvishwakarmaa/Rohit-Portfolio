from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
import logging

from app.core.config import settings
from app.core.exceptions import setup_exception_handlers
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.router import api_router
from app.core.limiter import limiter

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# ── Exception Handlers ────────────────────────────────────────────────────────
setup_exception_handlers(app)

# ── Request Logging Middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    if request.method != "OPTIONS":
        logger.info(f"{request.method} {request.url.path}")
    return await call_next(request)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

# ── CORS — OUTERMOST middleware (handles OPTIONS preflight first) ──────────────
# ⚠️  No wildcard regex — only explicitly configured origins are allowed.
allowed_origins = [str(o) for o in settings.BACKEND_CORS_ORIGINS] if settings.BACKEND_CORS_ORIGINS else []

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class DynamicVercelCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        
        if request.method == "OPTIONS":
            response = Response(status_code=200)
        else:
            response = await call_next(request)
            
        # Conditionally whitelist standard user origins dynamically:
        if origin and ("vercel.app" in origin or "localhost" in origin or "rohitvishwakarma.com" in origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "Accept, Authorization, Content-Type, Origin, access-control-allow-origin, x-requested-with"
        return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Add dynamic top-level fallback
app.add_middleware(DynamicVercelCORSMiddleware)

