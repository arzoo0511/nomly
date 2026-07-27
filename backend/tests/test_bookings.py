from datetime import date, timedelta

from app.models.booking import Booking, BookingStatus
from tests.conftest import auth_headers, create_listing, signup

TODAY = date.today()


def book(client, token, listing_id, check_in, check_out, num_guests=2):
    return client.post(
        "/api/bookings",
        headers=auth_headers(token),
        json={
            "listing_id": listing_id,
            "check_in": check_in.isoformat(),
            "check_out": check_out.isoformat(),
            "num_guests": num_guests,
        },
    )


def test_create_booking_success(client):
    host = signup(client, "bhost1@example.com", "BHost One")
    guest = signup(client, "bguest1@example.com", "BGuest One")
    listing = create_listing(client, host["access_token"], price=100)

    resp = book(client, guest["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=15))
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["nights"] == 5
    assert body["nightly_rate"] == 100
    assert body["service_fee"] == round(100 * 5 * 0.12, 2)
    assert body["can_cancel"] is True


def test_overlapping_booking_rejected(client):
    host = signup(client, "bhost2@example.com", "BHost Two")
    guest1 = signup(client, "bguest2a@example.com", "BGuest Two A")
    guest2 = signup(client, "bguest2b@example.com", "BGuest Two B")
    listing = create_listing(client, host["access_token"])

    first = book(client, guest1["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=15))
    assert first.status_code == 201

    overlapping = book(
        client, guest2["access_token"], listing["id"], TODAY + timedelta(days=12), TODAY + timedelta(days=20)
    )
    assert overlapping.status_code == 409


def test_back_to_back_bookings_allowed(client):
    host = signup(client, "bhost3@example.com", "BHost Three")
    guest = signup(client, "bguest3@example.com", "BGuest Three")
    listing = create_listing(client, host["access_token"])

    first = book(client, guest["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=15))
    assert first.status_code == 201

    # Second booking's check-in equals first booking's check-out -- must be allowed (half-open interval).
    second = book(
        client, guest["access_token"], listing["id"], TODAY + timedelta(days=15), TODAY + timedelta(days=18)
    )
    assert second.status_code == 201, second.text


def test_past_checkin_rejected(client):
    host = signup(client, "bhost4@example.com", "BHost Four")
    guest = signup(client, "bguest4@example.com", "BGuest Four")
    listing = create_listing(client, host["access_token"])

    resp = book(client, guest["access_token"], listing["id"], TODAY - timedelta(days=10), TODAY - timedelta(days=5))
    assert resp.status_code == 400


def test_checkout_before_checkin_rejected(client):
    host = signup(client, "bhost5@example.com", "BHost Five")
    guest = signup(client, "bguest5@example.com", "BGuest Five")
    listing = create_listing(client, host["access_token"])

    resp = book(client, guest["access_token"], listing["id"], TODAY + timedelta(days=15), TODAY + timedelta(days=10))
    assert resp.status_code == 422


def test_guests_exceeding_max_rejected(client):
    host = signup(client, "bhost6@example.com", "BHost Six")
    guest = signup(client, "bguest6@example.com", "BGuest Six")
    listing = create_listing(client, host["access_token"], max_guests=2)

    resp = book(
        client, guest["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=12), num_guests=5
    )
    assert resp.status_code == 400


def test_host_cannot_book_own_listing(client):
    host = signup(client, "bhost7@example.com", "BHost Seven")
    listing = create_listing(client, host["access_token"])

    resp = book(client, host["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=12))
    assert resp.status_code == 400


def test_guest_can_cancel_own_upcoming_booking(client):
    host = signup(client, "bhost8@example.com", "BHost Eight")
    guest = signup(client, "bguest8@example.com", "BGuest Eight")
    listing = create_listing(client, host["access_token"])

    created = book(client, guest["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=12))
    booking_id = created.json()["id"]

    resp = client.delete(f"/api/bookings/{booking_id}", headers=auth_headers(guest["access_token"]))
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


def test_stranger_cannot_cancel_booking(client):
    host = signup(client, "bhost9@example.com", "BHost Nine")
    guest = signup(client, "bguest9@example.com", "BGuest Nine")
    stranger = signup(client, "stranger9@example.com", "Stranger Nine")
    listing = create_listing(client, host["access_token"])

    created = book(client, guest["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=12))
    booking_id = created.json()["id"]

    resp = client.delete(f"/api/bookings/{booking_id}", headers=auth_headers(stranger["access_token"]))
    assert resp.status_code == 403


def test_cannot_cancel_a_trip_already_in_progress(client, db_session):
    host = signup(client, "bhost10@example.com", "BHost Ten")
    guest = signup(client, "bguest10@example.com", "BGuest Ten")
    listing = create_listing(client, host["access_token"])

    # Booking creation always requires a future check-in, so a trip that has already
    # started can only occur here via direct seed-style insertion (mirrors real usage
    # once "today" moves past a previously-valid check-in date).
    past_booking = Booking(
        listing_id=listing["id"],
        guest_id=guest["user"]["id"],
        check_in=TODAY - timedelta(days=2),
        check_out=TODAY + timedelta(days=2),
        num_guests=2,
        nights=4,
        nightly_rate=100,
        cleaning_fee=25,
        service_fee=48,
        total_price=100 * 4 + 25 + 48,
        status=BookingStatus.confirmed,
    )
    db_session.add(past_booking)
    db_session.commit()
    db_session.refresh(past_booking)

    resp = client.delete(f"/api/bookings/{past_booking.id}", headers=auth_headers(guest["access_token"]))
    assert resp.status_code == 400


def test_my_trips_scope_filtering(client):
    host = signup(client, "bhost11@example.com", "BHost Eleven")
    guest = signup(client, "bguest11@example.com", "BGuest Eleven")
    listing = create_listing(client, host["access_token"])
    book(client, guest["access_token"], listing["id"], TODAY + timedelta(days=10), TODAY + timedelta(days=12))

    upcoming = client.get("/api/bookings/mine", params={"scope": "upcoming"}, headers=auth_headers(guest["access_token"]))
    past = client.get("/api/bookings/mine", params={"scope": "past"}, headers=auth_headers(guest["access_token"]))

    assert len(upcoming.json()) == 1
    assert len(past.json()) == 0
