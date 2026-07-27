import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 -- register all models on the shared metadata
from app.db.base import Base
from app.db.session import get_db
from app.main import app as fastapi_app


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = testing_session_local()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


def signup(client: TestClient, email: str, full_name: str = "Test User", password: str = "password123") -> dict:
    resp = client.post(
        "/api/auth/signup", json={"email": email, "password": password, "full_name": full_name}
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def create_listing(
    client: TestClient, token: str, *, price: float = 100.0, max_guests: int = 4, title: str = "Test Listing"
) -> dict:
    resp = client.post(
        "/api/listings/",
        headers=auth_headers(token),
        json={
            "title": title,
            "description": "A lovely place to stay for testing purposes.",
            "property_type": "apartment",
            "city": "Austin",
            "country": "USA",
            "latitude": 30.27,
            "longitude": -97.74,
            "price_per_night": price,
            "cleaning_fee": 25,
            "max_guests": max_guests,
            "images": ["https://picsum.photos/seed/test/900/600"],
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()
