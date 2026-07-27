from tests.conftest import auth_headers, create_listing, signup


def test_favorites_requires_auth(client):
    resp = client.post("/api/favorites/1")
    assert resp.status_code == 401

    resp = client.get("/api/favorites/mine")
    assert resp.status_code == 401


def test_toggle_favorite_nonexistent_listing_404(client):
    user = signup(client, "fav1@example.com", "Fav One")
    resp = client.post("/api/favorites/9999", headers=auth_headers(user["access_token"]))
    assert resp.status_code == 404


def test_toggle_favorite_adds_then_removes(client):
    host = signup(client, "fhost2@example.com", "FHost Two")
    guest = signup(client, "fguest2@example.com", "FGuest Two")
    listing = create_listing(client, host["access_token"])

    add = client.post(f"/api/favorites/{listing['id']}", headers=auth_headers(guest["access_token"]))
    assert add.status_code == 200
    assert add.json()["favorited"] is True

    remove = client.post(f"/api/favorites/{listing['id']}", headers=auth_headers(guest["access_token"]))
    assert remove.status_code == 200
    assert remove.json()["favorited"] is False


def test_my_favorites_reflects_toggled_listings(client):
    host = signup(client, "fhost3@example.com", "FHost Three")
    guest = signup(client, "fguest3@example.com", "FGuest Three")
    listing_a = create_listing(client, host["access_token"], title="Favorite Me")
    listing_b = create_listing(client, host["access_token"], title="Skip Me")

    client.post(f"/api/favorites/{listing_a['id']}", headers=auth_headers(guest["access_token"]))

    resp = client.get("/api/favorites/mine", headers=auth_headers(guest["access_token"]))
    assert resp.status_code == 200
    titles = [item["title"] for item in resp.json()]
    assert "Favorite Me" in titles
    assert "Skip Me" not in titles


def test_favorites_are_scoped_per_user(client):
    host = signup(client, "fhost4@example.com", "FHost Four")
    guest_a = signup(client, "fguest4a@example.com", "FGuest Four A")
    guest_b = signup(client, "fguest4b@example.com", "FGuest Four B")
    listing = create_listing(client, host["access_token"])

    client.post(f"/api/favorites/{listing['id']}", headers=auth_headers(guest_a["access_token"]))

    a_favorites = client.get("/api/favorites/mine", headers=auth_headers(guest_a["access_token"])).json()
    b_favorites = client.get("/api/favorites/mine", headers=auth_headers(guest_b["access_token"])).json()

    assert len(a_favorites) == 1
    assert len(b_favorites) == 0


def test_listing_detail_reflects_is_favorited_for_current_user(client):
    host = signup(client, "fhost5@example.com", "FHost Five")
    guest = signup(client, "fguest5@example.com", "FGuest Five")
    listing = create_listing(client, host["access_token"])

    client.post(f"/api/favorites/{listing['id']}", headers=auth_headers(guest["access_token"]))

    as_guest = client.get(f"/api/listings/{listing['id']}", headers=auth_headers(guest["access_token"]))
    assert as_guest.json()["is_favorited"] is True

    anonymous = client.get(f"/api/listings/{listing['id']}")
    assert anonymous.json()["is_favorited"] is None
