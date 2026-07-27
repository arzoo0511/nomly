from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud import listing as listing_crud
from app.db.session import get_db
from app.deps import get_current_user, get_current_user_optional
from app.models.listing import Listing, PropertyType
from app.models.user import User
from app.schemas.listing import (
    HostListingOut,
    ListingCreate,
    ListingDetailOut,
    ListingUpdate,
    PaginatedListings,
)

router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.get("/", response_model=PaginatedListings)
def list_listings(
    q: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = Query(default=None, ge=1),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    property_type: list[PropertyType] | None = Query(default=None),
    amenities: str | None = None,
    sort: str = "newest",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    if check_in and check_out and check_out <= check_in:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Check-out date must be after check-in date")

    amenity_ids: list[int] | None = None
    if amenities:
        try:
            amenity_ids = [int(part) for part in amenities.split(",") if part.strip()]
        except ValueError:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid amenities filter")

    items, total = listing_crud.search_listings(
        db,
        q=q,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_types=property_type,
        amenity_ids=amenity_ids,
        sort=sort,
        page=page,
        page_size=page_size,
        current_user_id=current_user.id if current_user else None,
    )
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedListings(items=items, page=page, page_size=page_size, total=total, total_pages=total_pages)


@router.get("/mine", response_model=list[HostListingOut])
def my_listings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return listing_crud.get_owned_listings(db, current_user.id)


@router.get("/random")
def random_listing(db: Session = Depends(get_db)):
    """Powers the "Surprise me" button -- picks any one active listing at random."""
    listing_id = listing_crud.get_random_listing_id(db)
    if listing_id is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No listings available")
    return {"id": listing_id}


@router.get("/{listing_id}", response_model=ListingDetailOut)
def get_listing(
    listing_id: int,
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    detail = listing_crud.get_listing_detail(db, listing_id, current_user.id if current_user else None)
    if detail is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return detail


@router.post("/", response_model=ListingDetailOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    listing = listing_crud.create_listing(db, current_user.id, payload)
    return listing_crud.get_listing_detail(db, listing.id, current_user.id)


@router.put("/{listing_id}", response_model=ListingDetailOut)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't own this listing")

    listing_crud.update_listing(db, listing, payload)
    return listing_crud.get_listing_detail(db, listing.id, current_user.id)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if listing.host_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't own this listing")

    listing_crud.soft_delete_listing(db, listing)
