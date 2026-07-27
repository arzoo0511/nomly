import threading
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.booking import Booking, BookingStatus
from app.models.listing import Listing
from app.models.review import Review
from app.schemas.booking import BookingCreate, BookingOut

# Single-process SQLite dev server: a lock around the check-then-insert critical
# section is sufficient to prevent a double-booking race between two concurrent
# requests. This is a deliberate, scope-appropriate simplification -- not a
# substitute for DB-level locking (e.g. SELECT ... FOR UPDATE) in production.
_booking_lock = threading.Lock()

SERVICE_FEE_RATE = 0.12


def has_overlap(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    conflict = db.scalar(
        select(Booking.id).where(
            Booking.listing_id == listing_id,
            Booking.status == BookingStatus.confirmed,
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
    )
    return conflict is not None


def create_booking(db: Session, guest_id: int, data: BookingCreate) -> Booking:
    listing = db.get(Listing, data.listing_id)
    if listing is None or not listing.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")

    if data.check_in < date.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Check-in date cannot be in the past")

    if data.num_guests > listing.max_guests:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"This listing sleeps a maximum of {listing.max_guests} guests"
        )

    if guest_id == listing.host_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You can't book your own listing")

    with _booking_lock:
        if has_overlap(db, listing.id, data.check_in, data.check_out):
            raise HTTPException(status.HTTP_409_CONFLICT, "Selected dates are not available")

        nights = (data.check_out - data.check_in).days
        nightly_rate = float(listing.price_per_night)
        cleaning_fee = float(listing.cleaning_fee)
        service_fee = round(nightly_rate * nights * SERVICE_FEE_RATE, 2)
        total_price = round(nightly_rate * nights + cleaning_fee + service_fee, 2)

        booking = Booking(
            listing_id=listing.id,
            guest_id=guest_id,
            check_in=data.check_in,
            check_out=data.check_out,
            num_guests=data.num_guests,
            nights=nights,
            nightly_rate=nightly_rate,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=total_price,
            status=BookingStatus.confirmed,
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

    return booking


def get_booking(db: Session, booking_id: int) -> Booking | None:
    return db.get(
        Booking, booking_id, options=[selectinload(Booking.listing).selectinload(Listing.images), selectinload(Booking.guest)]
    )


def _query_with_relations():
    return select(Booking).options(
        selectinload(Booking.listing).selectinload(Listing.images), selectinload(Booking.guest)
    )


def get_my_bookings(db: Session, guest_id: int, scope: str) -> list[Booking]:
    today = date.today()
    stmt = _query_with_relations().where(Booking.guest_id == guest_id)
    if scope == "upcoming":
        stmt = stmt.where(Booking.check_in >= today, Booking.status == BookingStatus.confirmed)
    elif scope == "past":
        stmt = stmt.where((Booking.check_out < today) | (Booking.status == BookingStatus.cancelled))
    stmt = stmt.order_by(Booking.check_in.desc())
    return list(db.scalars(stmt).all())


def get_host_bookings(db: Session, host_id: int, listing_id: int | None) -> list[Booking]:
    stmt = _query_with_relations().join(Listing, Booking.listing_id == Listing.id).where(Listing.host_id == host_id)
    if listing_id is not None:
        stmt = stmt.where(Booking.listing_id == listing_id)
    stmt = stmt.order_by(Booking.check_in.desc())
    return list(db.scalars(stmt).all())


def cancel_booking(db: Session, booking: Booking) -> Booking:
    booking.status = BookingStatus.cancelled
    db.commit()
    db.refresh(booking)
    return booking


def get_unavailable_dates(db: Session, listing_id: int) -> list[Booking]:
    return list(
        db.scalars(
            select(Booking).where(Booking.listing_id == listing_id, Booking.status == BookingStatus.confirmed)
        ).all()
    )


def serialize_booking(db: Session, booking: Booking, current_user_id: int) -> BookingOut:
    today = date.today()
    already_reviewed = db.scalar(select(Review.id).where(Review.booking_id == booking.id)) is not None

    can_review = (
        booking.status == BookingStatus.confirmed
        and booking.check_out < today
        and current_user_id == booking.guest_id
        and not already_reviewed
    )
    can_cancel = booking.status == BookingStatus.confirmed and booking.check_in >= today and current_user_id in (
        booking.guest_id,
        booking.listing.host_id,
    )

    return BookingOut(
        id=booking.id,
        listing={
            "id": booking.listing.id,
            "title": booking.listing.title,
            "city": booking.listing.city,
            "country": booking.listing.country,
            "cover_image": booking.listing.images[0].url if booking.listing.images else None,
        },
        guest={
            "id": booking.guest.id,
            "full_name": booking.guest.full_name,
            "avatar_seed": booking.guest.avatar_seed,
        },
        check_in=booking.check_in,
        check_out=booking.check_out,
        num_guests=booking.num_guests,
        nights=booking.nights,
        nightly_rate=float(booking.nightly_rate),
        cleaning_fee=float(booking.cleaning_fee),
        service_fee=float(booking.service_fee),
        total_price=float(booking.total_price),
        status=booking.status,
        created_at=booking.created_at,
        can_review=can_review,
        can_cancel=can_cancel,
    )
