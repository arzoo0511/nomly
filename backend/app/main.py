from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
import app.models  # noqa: F401 -- ensures every model is registered before create_all
from app.models.user import User
from app.routers import amenities, auth, availability, bookings, favorites, listings, reviews, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    # Self-seed on startup if the DB is empty. This makes the app resilient to
    # hosting platforms with ephemeral/non-persistent disks (serverless
    # filesystems, free-tier restarts, etc.) -- rather than relying on a
    # platform-specific "run this command before starting" convention, the
    # app guarantees its own demo data on every cold start. Safe to run on
    # every boot: idempotent (skips if data exists) and deterministic
    # (random.seed(42) in app.seed), so a reset always reproduces the same
    # dataset rather than silently drifting or duplicating.
    if settings.auto_seed_on_startup:
        db = SessionLocal()
        try:
            if db.scalar(select(User.id).limit(1)) is None:
                from app.seed import seed

                seed(db)
        finally:
            db.close()

    yield


app = FastAPI(title="Nomly API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(amenities.router)
app.include_router(listings.router)
app.include_router(availability.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(favorites.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
