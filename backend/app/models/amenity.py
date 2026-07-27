from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.listing import listing_amenities


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    icon_key: Mapped[str] = mapped_column(String(40), nullable=False)

    listings: Mapped[list["Listing"]] = relationship(secondary=listing_amenities, back_populates="amenities")
