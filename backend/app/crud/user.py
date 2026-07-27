from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking, BookingStatus
from app.models.listing import Listing
from app.models.review import Review
from app.models.user import User
from app.schemas.user import UserOut


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def create_user(db: Session, *, email: str, hashed_password: str, full_name: str, avatar_seed: str) -> User:
    user = User(
        email=email.lower(),
        hashed_password=hashed_password,
        full_name=full_name,
        avatar_seed=avatar_seed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def compute_superhost_stats(db: Session, user_id: int) -> tuple[bool, int]:
    """Returns (is_superhost, listings_count). Superhost = avg rating across all of a
    host's listings >= 4.5 AND total confirmed bookings across those listings >= 5.
    Computed on read rather than stored, so it can never go stale."""
    listings_count = db.scalar(select(func.count(Listing.id)).where(Listing.host_id == user_id)) or 0
    if listings_count == 0:
        return False, 0

    avg_rating = db.scalar(
        select(func.avg(Review.rating)).join(Listing, Review.listing_id == Listing.id).where(Listing.host_id == user_id)
    )
    booking_count = (
        db.scalar(
            select(func.count(Booking.id))
            .join(Listing, Booking.listing_id == Listing.id)
            .where(Listing.host_id == user_id, Booking.status == BookingStatus.confirmed)
        )
        or 0
    )
    is_superhost = bool(avg_rating is not None and avg_rating >= 4.5 and booking_count >= 5)
    return is_superhost, listings_count


def serialize_user(db: Session, user: User) -> UserOut:
    is_superhost, listings_count = compute_superhost_stats(db, user.id)
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_seed=user.avatar_seed,
        bio=user.bio,
        created_at=user.created_at,
        is_superhost=is_superhost,
        listings_count=listings_count,
    )
