from tests.conftest import auth_headers, create_listing, signup


def test_create_listing_requires_at_least_one_image(client):
    host = signup(client, "host1@example.com", "Host One")
    resp = client.post(
        "/api/listings/",
        headers=auth_headers(host["access_token"]),
        json={
            "title": "No Photos",
            "description": "desc",
            "property_type": "apartment",
            "city": "Austin",
            "country": "USA",
            "latitude": 1,
            "longitude": 1,
            "price_per_night": 100,
            "max_guests": 2,
            "images": [],
        },
    )
    assert resp.status_code == 422


def test_create_listing_rejects_blank_title(client):
    host = signup(client, "host1b@example.com", "Host One B")
    resp = client.post(
        "/api/listings/",
        headers=auth_headers(host["access_token"]),
        json={
            "title": "   ",
            "description": "desc",
            "property_type": "apartment",
            "city": "Austin",
            "country": "USA",
            "latitude": 1,
            "longitude": 1,
            "price_per_night": 100,
            "max_guests": 2,
            "images": ["https://picsum.photos/seed/x/900/600"],
        },
    )
    assert resp.status_code == 422


def test_create_and_fetch_listing(client):
    host = signup(client, "host2@example.com", "Host Two")
    listing = create_listing(client, host["access_token"], title="Cozy Loft")

    resp = client.get(f"/api/listings/{listing['id']}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["title"] == "Cozy Loft"
    assert body["host"]["full_name"] == "Host Two"
    assert body["review_count"] == 0


def test_get_nonexistent_listing_404(client):
    resp = client.get("/api/listings/9999")
    assert resp.status_code == 404


def test_update_listing_forbidden_for_non_owner(client):
    host = signup(client, "host3@example.com", "Host Three")
    other = signup(client, "other3@example.com", "Other Three")
    listing = create_listing(client, host["access_token"])

    resp = client.put(
        f"/api/listings/{listing['id']}",
        headers=auth_headers(other["access_token"]),
        json={"title": "Hijacked"},
    )
    assert resp.status_code == 403


def test_owner_can_update_listing(client):
    host = signup(client, "host4@example.com", "Host Four")
    listing = create_listing(client, host["access_token"])

    resp = client.put(
        f"/api/listings/{listing['id']}",
        headers=auth_headers(host["access_token"]),
        json={"price_per_night": 250},
    )
    assert resp.status_code == 200
    assert resp.json()["price_per_night"] == 250


def test_delete_listing_is_soft_delete(client):
    host = signup(client, "host5@example.com", "Host Five")
    listing = create_listing(client, host["access_token"])

    resp = client.delete(f"/api/listings/{listing['id']}", headers=auth_headers(host["access_token"]))
    assert resp.status_code == 204

    # Soft-deleted listings still resolve by id (bookings/reviews referencing them stay valid)...
    detail = client.get(f"/api/listings/{listing['id']}")
    assert detail.status_code == 200
    assert detail.json()["is_active"] is False

    # ...but disappear from public search results.
    search = client.get("/api/listings/")
    ids = [item["id"] for item in search.json()["items"]]
    assert listing["id"] not in ids


def test_search_filters_by_price_range(client):
    host = signup(client, "host6@example.com", "Host Six")
    create_listing(client, host["access_token"], price=50, title="Cheap Place")
    create_listing(client, host["access_token"], price=500, title="Expensive Place")

    resp = client.get("/api/listings/", params={"min_price": 400})
    titles = [item["title"] for item in resp.json()["items"]]
    assert "Expensive Place" in titles
    assert "Cheap Place" not in titles


def test_pagination_past_last_page_returns_empty_not_404(client):
    host = signup(client, "host7@example.com", "Host Seven")
    create_listing(client, host["access_token"])

    resp = client.get("/api/listings/", params={"page": 999, "page_size": 12})
    assert resp.status_code == 200
    assert resp.json()["items"] == []
