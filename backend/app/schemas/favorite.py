from pydantic import BaseModel

from app.schemas.listing import ListingCardOut


class FavoriteToggleOut(BaseModel):
    favorited: bool


class FavoriteListOut(BaseModel):
    items: list[ListingCardOut]
