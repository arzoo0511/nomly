from tests.conftest import auth_headers, signup


def test_signup_returns_token_and_user(client):
    data = signup(client, "alice@example.com", "Alice Guest")
    assert "access_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["is_superhost"] is False


def test_signup_duplicate_email_rejected(client):
    signup(client, "bob@example.com")
    resp = client.post(
        "/api/auth/signup",
        json={"email": "bob@example.com", "password": "password123", "full_name": "Bob Again"},
    )
    assert resp.status_code == 409


def test_login_wrong_password_rejected(client):
    signup(client, "carol@example.com")
    resp = client.post("/api/auth/login", json={"email": "carol@example.com", "password": "wrongpass"})
    assert resp.status_code == 401


def test_login_success(client):
    signup(client, "dave@example.com")
    resp = client.post("/api/auth/login", json={"email": "dave@example.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user(client):
    data = signup(client, "erin@example.com", "Erin Host")
    resp = client.get("/api/auth/me", headers=auth_headers(data["access_token"]))
    assert resp.status_code == 200
    assert resp.json()["email"] == "erin@example.com"


def test_signup_duplicate_email_rejected_regardless_of_case(client):
    signup(client, "frank@example.com")
    resp = client.post(
        "/api/auth/signup",
        json={"email": "Frank@Example.com", "password": "password123", "full_name": "Frank Again"},
    )
    assert resp.status_code == 409


def test_login_succeeds_with_different_email_case(client):
    signup(client, "grace@example.com")
    resp = client.post("/api/auth/login", json={"email": "Grace@Example.COM", "password": "password123"})
    assert resp.status_code == 200


def test_signup_rejects_blank_full_name(client):
    resp = client.post(
        "/api/auth/signup",
        json={"email": "blank@example.com", "password": "password123", "full_name": "   "},
    )
    assert resp.status_code == 422
