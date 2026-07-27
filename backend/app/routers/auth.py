import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.crud.user import create_user, get_by_email, serialize_user
from app.db.session import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.user import Token, UserLogin, UserOut, UserSignup

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    if get_by_email(db, payload.email) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    try:
        user = create_user(
            db,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            avatar_seed=f"user-{random.randint(1, 10_000_000)}",
        )
    except IntegrityError:
        # Two concurrent signups for the same email both passed the check above --
        # the unique constraint is the real guard; surface it as a clean 409 rather
        # than a raw 500.
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    token = create_access_token(user.id)
    return Token(access_token=token, user=serialize_user(db, user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = get_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    token = create_access_token(user.id)
    return Token(access_token=token, user=serialize_user(db, user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return serialize_user(db, current_user)
