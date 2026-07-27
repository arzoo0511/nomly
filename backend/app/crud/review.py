from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.schemas.review import ReviewCreate


def create_review(db: Session, author_id: int, data: ReviewCreate) -> Review:
    booking = db.get(Booking, data.booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    if booking.guest_id != author_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You can only review your own trips")
    if booking.status != BookingStatus.confirmed:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cancelled bookings can't be reviewed")
    if booking.check_out >= date.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can only review a trip after it's completed")

    existing = db.scalar(select(Review.id).where(Review.booking_id == booking.id))
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "You've already reviewed this trip")

    review = Review(
        listing_id=booking.listing_id,
        booking_id=booking.id,
        author_id=author_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_listing_reviews(db: Session, listing_id: int, page: int, page_size: int) -> tuple[list[Review], int]:
    total = db.scalar(select(func.count(Review.id)).where(Review.listing_id == listing_id)) or 0
    reviews = list(
        db.scalars(
            select(Review)
            .where(Review.listing_id == listing_id)
            .options(selectinload(Review.author))
            .order_by(Review.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        ).all()
    )
    return reviews, total
