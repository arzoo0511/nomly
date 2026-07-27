from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.validators import NonBlankStr


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: NonBlankStr = Field(min_length=1, max_length=2000)


class ReviewAuthorMini(BaseModel):
    id: int
    full_name: str
    avatar_seed: str

    model_config = ConfigDict(from_attributes=True)


class ReviewOut(BaseModel):
    id: int
    listing_id: int
    rating: int
    comment: str
    created_at: datetime
    author: ReviewAuthorMini

    model_config = ConfigDict(from_attributes=True)


class PaginatedReviews(BaseModel):
    items: list[ReviewOut]
    page: int
    page_size: int
    total: int
    total_pages: int
