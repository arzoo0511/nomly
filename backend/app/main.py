from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 -- ensures every model is registered before create_all
from app.routers import amenities, auth, availability, bookings, favorites, listings, reviews, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
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
