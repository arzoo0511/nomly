from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.validators import NonBlankStr
from app.models.listing import PropertyType
from app.schemas.amenity import AmenityOut


class ListingCreate(BaseModel):
    title: NonBlankStr = Field(min_length=1, max_length=120)
    description: NonBlankStr = Field(min_length=1, max_length=5000)
    property_type: PropertyType
    city: NonBlankStr = Field(min_length=1, max_length=120)
    region: str | None = Field(default=None, max_length=120)
    country: NonBlankStr = Field(min_length=1, max_length=120)
    latitude: float
    longitude: float
    price_per_night: float = Field(gt=0, le=100_000)
    cleaning_fee: float = Field(ge=0, le=10_000, default=0)
    max_guests: int = Field(ge=1, le=32)
    bedrooms: int = Field(ge=0, le=20, default=1)
    beds: int = Field(ge=1, le=32, default=1)
    bathrooms: float = Field(ge=0.5, le=20, default=1)
    amenity_ids: list[int] = Field(default_factory=list)
    images: list[str] = Field(min_length=1, max_length=12)

    @field_validator("images")
    @classmethod
    def images_not_blank(cls, v: list[str]) -> list[str]:
        cleaned = [url.strip() for url in v if url.strip()]
        if not cleaned:
            raise ValueError("At least one image URL is required")
        return cleaned


class ListingUpdate(BaseModel):
    title: NonBlankStr | None = Field(default=None, min_length=1, max_length=120)
    description: NonBlankStr | None = Field(default=None, min_length=1, max_length=5000)
    property_type: PropertyType | None = None
    city: NonBlankStr | None = Field(default=None, min_length=1, max_length=120)
    region: str | None = Field(default=None, max_length=120)
    country: NonBlankStr | None = Field(default=None, min_length=1, max_length=120)
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: float | None = Field(default=None, gt=0, le=100_000)
    cleaning_fee: float | None = Field(default=None, ge=0, le=10_000)
    max_guests: int | None = Field(default=None, ge=1, le=32)
    bedrooms: int | None = Field(default=None, ge=0, le=20)
    beds: int | None = Field(default=None, ge=1, le=32)
    bathrooms: float | None = Field(default=None, ge=0.5, le=20)
    amenity_ids: list[int] | None = None
    images: list[str] | None = Field(default=None, min_length=1, max_length=12)
    is_active: bool | None = None


class HostMiniOut(BaseModel):
    id: int
    full_name: str
    avatar_seed: str
    bio: str | None
    created_at: datetime
    is_superhost: bool = False

    model_config = ConfigDict(from_attributes=True)


class ListingCardOut(BaseModel):
    id: int
    title: str
    property_type: PropertyType
    city: str
    region: str | None
    country: str
    price_per_night: float
    max_guests: int
    cover_image: str | None
    rating_avg: float | None
    review_count: int
    is_favorited: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class ListingDetailOut(BaseModel):
    id: int
    title: str
    description: str
    property_type: PropertyType
    city: str
    region: str | None
    country: str
    latitude: float
    longitude: float
    price_per_night: float
    cleaning_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    is_active: bool
    created_at: datetime
    images: list[str]
    amenities: list[AmenityOut]
    host: HostMiniOut
    rating_avg: float | None
    review_count: int
    is_favorited: bool | None = None

    model_config = ConfigDict(from_attributes=True)


class HostListingOut(ListingCardOut):
    is_active: bool
    upcoming_bookings_count: int = 0
    total_bookings_count: int = 0


class PaginatedListings(BaseModel):
    items: list[ListingCardOut]
    page: int
    page_size: int
    total: int
    total_pages: int
