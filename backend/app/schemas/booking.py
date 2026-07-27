from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    num_guests: int = Field(ge=1)

    @model_validator(mode="after")
    def check_dates(self) -> "BookingCreate":
        if self.check_out <= self.check_in:
            raise ValueError("Check-out date must be after check-in date")
        return self


class BookingListingMini(BaseModel):
    id: int
    title: str
    city: str
    country: str
    cover_image: str | None

    model_config = ConfigDict(from_attributes=True)


class BookingGuestMini(BaseModel):
    id: int
    full_name: str
    avatar_seed: str

    model_config = ConfigDict(from_attributes=True)


class BookingOut(BaseModel):
    id: int
    listing: BookingListingMini
    guest: BookingGuestMini
    check_in: date
    check_out: date
    num_guests: int
    nights: int
    nightly_rate: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: BookingStatus
    created_at: datetime
    can_review: bool = False
    can_cancel: bool = False

    model_config = ConfigDict(from_attributes=True)


class UnavailableRange(BaseModel):
    check_in: date
    check_out: date


class AvailabilityOut(BaseModel):
    available: bool
