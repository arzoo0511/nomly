from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.booking import get_unavailable_dates, has_overlap
from app.db.session import get_db
from app.models.listing import Listing
from app.schemas.booking import AvailabilityOut, UnavailableRange

router = APIRouter(prefix="/api/listings", tags=["availability"])


@router.get("/{listing_id}/availability", response_model=AvailabilityOut)
def check_availability(listing_id: int, check_in: date, check_out: date, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if check_out <= check_in:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Check-out date must be after check-in date")

    available = not has_overlap(db, listing_id, check_in, check_out)
    return AvailabilityOut(available=available)


@router.get("/{listing_id}/unavailable-dates", response_model=list[UnavailableRange])
def unavailable_dates(listing_id: int, db: Session = Depends(get_db)):
    bookings = get_unavailable_dates(db, listing_id)
    return [UnavailableRange(check_in=b.check_in, check_out=b.check_out) for b in bookings]
