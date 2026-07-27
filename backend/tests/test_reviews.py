from datetime import date, timedelta

from app.models.booking import Booking, BookingStatus
from tests.conftest import auth_headers, create_listing, signup

TODAY = date.today()


def make_booking(db_session, *, listing_id, guest_id, check_in, check_out, status=BookingStatus.confirmed):
    nights = (check_out - check_in).days
    booking = Booking(
        listing_id=listing_id,
        guest_id=guest_id,
        check_in=check_in,
        check_out=check_out,
        num_guests=2,
        nights=nights,
        nightly_rate=100,
        cleaning_fee=25,
        service_fee=round(100 * nights * 0.12, 2),
        total_price=100 * nights + 25 + round(100 * nights * 0.12, 2),
        status=status,
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    return booking


def test_create_review_for_completed_trip_succeeds(client, db_session):
    host = signup(client, "rhost1@example.com", "RHost One")
    guest = signup(client, "rguest1@example.com", "RGuest One")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
    )

    resp = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 5, "comment": "Wonderful stay, would come back."},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["rating"] == 5


def test_review_rejected_before_checkout(client, db_session):
    host = signup(client, "rhost2@example.com", "RHost Two")
    guest = signup(client, "rguest2@example.com", "RGuest Two")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY + timedelta(days=5),
        check_out=TODAY + timedelta(days=10),
    )

    resp = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 4, "comment": "Still upcoming."},
    )
    assert resp.status_code == 400


def test_review_rejected_for_someone_elses_booking(client, db_session):
    host = signup(client, "rhost3@example.com", "RHost Three")
    guest = signup(client, "rguest3@example.com", "RGuest Three")
    stranger = signup(client, "rstranger3@example.com", "RStranger Three")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
    )

    resp = client.post(
        "/api/reviews",
        headers=auth_headers(stranger["access_token"]),
        json={"booking_id": booking.id, "rating": 3, "comment": "Not my trip to review."},
    )
    assert resp.status_code == 403


def test_review_rejected_for_cancelled_booking(client, db_session):
    host = signup(client, "rhost4@example.com", "RHost Four")
    guest = signup(client, "rguest4@example.com", "RGuest Four")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
        status=BookingStatus.cancelled,
    )

    resp = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 3, "comment": "This trip got cancelled."},
    )
    assert resp.status_code == 400


def test_duplicate_review_rejected(client, db_session):
    host = signup(client, "rhost5@example.com", "RHost Five")
    guest = signup(client, "rguest5@example.com", "RGuest Five")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
    )

    first = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 5, "comment": "Loved it here."},
    )
    assert first.status_code == 201

    second = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 2, "comment": "Trying to review again."},
    )
    assert second.status_code == 409


def test_review_rating_out_of_range_rejected(client, db_session):
    host = signup(client, "rhost6@example.com", "RHost Six")
    guest = signup(client, "rguest6@example.com", "RGuest Six")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
    )

    resp = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 6, "comment": "Too many stars requested."},
    )
    assert resp.status_code == 422


def test_review_blank_comment_rejected(client, db_session):
    host = signup(client, "rhost7@example.com", "RHost Seven")
    guest = signup(client, "rguest7@example.com", "RGuest Seven")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
    )

    # Whitespace-only comment must be rejected, not accepted as a "non-empty" 3-char string.
    resp = client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 4, "comment": "   "},
    )
    assert resp.status_code == 422


def test_list_listing_reviews_pagination(client, db_session):
    host = signup(client, "rhost8@example.com", "RHost Eight")
    guest = signup(client, "rguest8@example.com", "RGuest Eight")
    listing = create_listing(client, host["access_token"])
    booking = make_booking(
        db_session,
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=10),
        check_out=TODAY - timedelta(days=5),
    )
    client.post(
        "/api/reviews",
        headers=auth_headers(guest["access_token"]),
        json={"booking_id": booking.id, "rating": 5, "comment": "Great trip overall."},
    )

    resp = client.get(f"/api/listings/{listing['id']}/reviews")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["comment"] == "Great trip overall."
