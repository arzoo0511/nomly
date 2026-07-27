from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.amenity import Amenity
from app.schemas.amenity import AmenityOut

router = APIRouter(prefix="/api/amenities", tags=["amenities"])


@router.get("/", response_model=list[AmenityOut])
def list_amenities(db: Session = Depends(get_db)):
    return list(db.scalars(select(Amenity).order_by(Amenity.name)).all())
