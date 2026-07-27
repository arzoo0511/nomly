from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.favorite import Favorite
from app.models.listing import Listing


def toggle_favorite(db: Session, user_id: int, listing_id: int) -> bool:
    existing = db.scalar(select(Favorite).where(Favorite.user_id == user_id, Favorite.listing_id == listing_id))
    if existing is not None:
        db.delete(existing)
        db.commit()
        return False

    listing = db.get(Listing, listing_id)
    if listing is None:
        from fastapi import HTTPException, status

        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")

    db.add(Favorite(user_id=user_id, listing_id=listing_id))
    db.commit()
    return True


def get_favorited_listings(db: Session, user_id: int) -> list[Listing]:
    return list(
        db.scalars(
            select(Listing)
            .join(Favorite, Favorite.listing_id == Listing.id)
            .where(Favorite.user_id == user_id)
            .options(selectinload(Listing.images))
            .order_by(Favorite.created_at.desc())
        ).all()
    )
