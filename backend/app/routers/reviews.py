from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import review as review_crud
from app.db.session import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.review import PaginatedReviews, ReviewCreate, ReviewOut

router = APIRouter(tags=["reviews"])


@router.post("/api/reviews", response_model=ReviewOut, status_code=201)
def create_review(payload: ReviewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    review = review_crud.create_review(db, current_user.id, payload)
    return review


@router.get("/api/listings/{listing_id}/reviews", response_model=PaginatedReviews)
def list_listing_reviews(
    listing_id: int,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    reviews, total = review_crud.get_listing_reviews(db, listing_id, page, page_size)
    total_pages = max(1, (total + page_size - 1) // page_size)
    return PaginatedReviews(items=reviews, page=page, page_size=page_size, total=total, total_pages=total_pages)
