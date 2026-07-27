from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import favorite as favorite_crud
from app.crud import listing as listing_crud
from app.db.session import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.favorite import FavoriteToggleOut
from app.schemas.listing import ListingCardOut

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.post("/{listing_id}", response_model=FavoriteToggleOut)
def toggle_favorite(listing_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    favorited = favorite_crud.toggle_favorite(db, current_user.id, listing_id)
    return FavoriteToggleOut(favorited=favorited)


@router.get("/mine", response_model=list[ListingCardOut])
def my_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    listings = favorite_crud.get_favorited_listings(db, current_user.id)
    return listing_crud.serialize_listings_to_cards(db, listings, current_user.id)
