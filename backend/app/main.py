from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

from app.database import engine, Base
from app.models import *  # noqa: F401,F403 — registers all models with Base
from app.routers import auth, products, orders, payments, users, blog, admin

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="Mufflux Exhaust System API",
    description="E-commerce API for Mufflux — Malaysian Motorcycle Exhaust Brand",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(users.router)
app.include_router(blog.router)
app.include_router(admin.router)


# Serve uploaded images at /uploads/...
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok", "service": "mufflux-api"}


@app.post("/setup/make-admin")
def make_admin(email: str, secret: str):
    from app.database import SessionLocal
    from app.models.user import User, UserRole
    if secret != "mufflux-setup-2024":
        return {"error": "forbidden"}
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"error": "user not found"}
        user.role = UserRole.admin
        db.commit()
        return {"ok": True, "email": user.email, "role": user.role}
    finally:
        db.close()
