from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.core.validators import NonBlankStr


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: NonBlankStr = Field(min_length=1, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: NonBlankStr | None = Field(default=None, min_length=1, max_length=120)
    bio: str | None = Field(default=None, max_length=2000)
    avatar_seed: str | None = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    avatar_seed: str
    bio: str | None
    created_at: datetime
    is_superhost: bool = False
    listings_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
