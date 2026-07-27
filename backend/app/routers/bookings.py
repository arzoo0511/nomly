from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud import booking as booking_crud
from app.db.session import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut

router = APIRouter(tags=["bookings"])


@router.post("/api/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = booking_crud.create_booking(db, current_user.id, payload)
    return booking_crud.serialize_booking(db, booking, current_user.id)


@router.get("/api/bookings/mine", response_model=list[BookingOut])
def my_bookings(
    scope: str = Query(default="all", pattern="^(upcoming|past|all)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookings = booking_crud.get_my_bookings(db, current_user.id, scope)
    return [booking_crud.serialize_booking(db, b, current_user.id) for b in bookings]


@router.get("/api/bookings/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = booking_crud.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    if current_user.id not in (booking.guest_id, booking.listing.host_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't have access to this booking")
    return booking_crud.serialize_booking(db, booking, current_user.id)


@router.delete("/api/bookings/{booking_id}", response_model=BookingOut)
def cancel_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = booking_crud.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Booking not found")
    if current_user.id not in (booking.guest_id, booking.listing.host_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't have access to this booking")
    if booking.check_in < date.today():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Can't cancel a trip that has already started")
    if booking.status.value == "cancelled":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This booking is already cancelled")

    booking = booking_crud.cancel_booking(db, booking)
    return booking_crud.serialize_booking(db, booking, current_user.id)


@router.get("/api/host/bookings", response_model=list[BookingOut])
def host_bookings(
    listing_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookings = booking_crud.get_host_bookings(db, current_user.id, listing_id)
    return [booking_crud.serialize_booking(db, b, current_user.id) for b in bookings]
