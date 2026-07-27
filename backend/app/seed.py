"""Idempotent demo-data seeder for Nomly.

Usage:
    python -m app.seed            # seed only if the users table is empty
    python -m app.seed --reset    # drop all tables, recreate, then seed fresh
"""

import random
import sys
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.amenity import Amenity
from app.models.booking import Booking, BookingStatus
from app.models.listing import Listing, PropertyType
from app.models.listing_image import ListingImage
from app.models.review import Review
from app.models.favorite import Favorite
from app.models.user import User

random.seed(42)
TODAY = date.today()
DEV_PASSWORD = "password123"

AMENITIES = [
    ("Wifi", "wifi"),
    ("Kitchen", "kitchen"),
    ("Free parking", "parking"),
    ("Air conditioning", "ac"),
    ("Washer", "washer"),
    ("TV", "tv"),
    ("Pool", "pool"),
    ("Hot tub", "hot_tub"),
    ("Gym", "gym"),
    ("Dedicated workspace", "workspace"),
    ("Pet friendly", "pet_friendly"),
    ("Fireplace", "fireplace"),
]

LOCATIONS = [
    ("Austin", "TX", "USA", 30.2672, -97.7431),
    ("Asheville", "NC", "USA", 35.5951, -82.5515),
    ("Portland", "OR", "USA", 45.5152, -122.6784),
    ("Miami", "FL", "USA", 25.7617, -80.1918),
    ("New Orleans", "LA", "USA", 29.9511, -90.0715),
    ("Denver", "CO", "USA", 39.7392, -104.9903),
    ("Savannah", "GA", "USA", 32.0809, -81.0912),
    ("San Diego", "CA", "USA", 32.7157, -117.1611),
    ("Santa Fe", "NM", "USA", 35.6870, -105.9378),
    ("Charleston", "SC", "USA", 32.7765, -79.9311),
    ("Lisbon", None, "Portugal", 38.7223, -9.1393),
    ("Ubud", "Bali", "Indonesia", -8.5069, 115.2625),
]

ADJECTIVES = [
    "Sunlit", "Cozy", "Modern", "Charming", "Serene", "Vibrant", "Rustic",
    "Elegant", "Breezy", "Secluded", "Chic", "Whimsical", "Tranquil", "Bold",
]

TYPE_NOUNS = {
    PropertyType.apartment: ["Loft", "Studio", "Flat", "Penthouse Suite"],
    PropertyType.house: ["Cottage", "Bungalow", "Craftsman House", "Family Home"],
    PropertyType.guesthouse: ["Guesthouse", "Casita", "Garden Cottage", "Backyard Studio"],
    PropertyType.hotel: ["Boutique Room", "Hotel Suite", "Design Hotel Room", "Skyline Suite"],
    PropertyType.unique_stay: ["Treehouse", "Converted Airstream", "Dome Retreat", "Houseboat"],
}

DESC_TEMPLATES = [
    "Wake up to natural light in this {adj_lower} {noun_lower} minutes from the heart of {city}. "
    "Thoughtfully furnished with a warm, lived-in feel, it's an easy base for exploring local restaurants, "
    "coffee shops, and everything {city} is known for.",
    "This {noun_lower} blends comfort and character, tucked into one of {city}'s most walkable pockets. "
    "Expect a fully stocked kitchen, a restful bedroom setup, and small touches that make it feel like a home "
    "away from home rather than a hotel room.",
    "A {adj_lower} retreat in {city} designed for travelers who want space to unwind after a day of exploring. "
    "The layout balances shared and private areas well, and the neighborhood offers an easy mix of quiet streets "
    "and nearby nightlife.",
    "Step into a {adj_lower} {noun_lower} with an open, airy layout and a location that puts most of {city} "
    "within a short drive or rideshare. Great for couples, small families, or solo travelers who like a bit "
    "of personality in their stay.",
]

REVIEW_COMMENTS = [
    "Exactly as pictured and the location couldn't be better. Would book again in a heartbeat.",
    "Host was incredibly responsive and the place was spotless when we arrived.",
    "Loved the neighborhood — walkable to great food and the check-in process was seamless.",
    "Comfortable beds, quiet street, and the photos undersold how nice it actually was.",
    "A few minor quirks with the place but nothing that affected the stay overall. Would recommend.",
    "This was the highlight of our trip. Beautifully kept and better than the listing photos.",
    "Great value for the price point, especially given how central it is.",
    "Check-in instructions were clear and the host left helpful recommendations for the area.",
    "Perfect for our group size — plenty of space and everything we needed was provided.",
    "Quiet, clean, and cozy. Exactly what we needed after a long travel day.",
    "The kitchen was well stocked which made a huge difference for our stay.",
    "Would happily stay here again next time we're in town.",
    "Small issue with the wifi on the first night but the host resolved it quickly.",
    "Beautiful space, great light, and an unbeatable location for getting around the city.",
    "Solid stay overall — comfortable, clean, and easy communication with the host throughout.",
]

FIRST_NAMES = ["Maya", "Jordan", "Priya", "Diego", "Sofia", "Elena", "Marcus", "Noah",
               "Aisha", "Liam", "Zoe", "Kenji", "Isabella", "Theo"]
LAST_NAMES = ["Rivera", "Chen", "Patel", "Okafor", "Novak", "Larsson", "Duarte", "Kim",
              "Silva", "Torres", "Bianchi", "Nakamura", "Osei", "Fischer"]


def clamp_check_out(check_in: date, nights: int, must_be_before: date | None = None) -> tuple[date, date] | None:
    check_out = check_in + timedelta(days=nights)
    if must_be_before is not None and check_out >= must_be_before:
        return None
    return check_in, check_out


def find_non_overlapping_range(existing: list[tuple[date, date]], *, window_start: date, window_end: date,
                                min_nights: int = 2, max_nights: int = 7, attempts: int = 30) -> tuple[date, date] | None:
    span = (window_end - window_start).days
    if span <= min_nights:
        return None
    for _ in range(attempts):
        nights = random.randint(min_nights, max_nights)
        latest_start = span - nights
        if latest_start <= 0:
            continue
        offset = random.randint(0, latest_start)
        check_in = window_start + timedelta(days=offset)
        check_out = check_in + timedelta(days=nights)
        conflict = any(check_in < e_out and check_out > e_in for e_in, e_out in existing)
        if not conflict:
            return check_in, check_out
    return None


def seed(db: Session) -> None:
    print("Seeding amenities...")
    amenities = []
    for name, icon_key in AMENITIES:
        amenity = Amenity(name=name, icon_key=icon_key)
        db.add(amenity)
        amenities.append(amenity)
    db.flush()

    print("Seeding users...")
    hashed = hash_password(DEV_PASSWORD)
    users: list[User] = []
    for i, (first, last) in enumerate(zip(FIRST_NAMES, LAST_NAMES)):
        email = f"{first.lower()}.{last.lower()}@nomly.dev"
        user = User(
            email=email,
            hashed_password=hashed,
            full_name=f"{first} {last}",
            avatar_seed=f"avatar-{i + 1}",
            bio=f"Based in {random.choice(LOCATIONS)[0]}. Loves discovering new places and good coffee.",
        )
        db.add(user)
        users.append(user)
    db.flush()

    # Roles: first 6 = host-only, next 6 = guest-only, last 2 = overlap (both host & guest)
    host_only_users = users[0:6]
    guest_only_users = users[6:12]
    overlap_users = users[12:14]
    host_pool = host_only_users + overlap_users  # 8 users who can own listings
    guest_pool = guest_only_users + overlap_users  # 8 users who can book

    print("Seeding listings...")
    listings_per_host = [5, 4, 4, 4, 4, 4, 4, 3]  # sums to 32
    listings: list[Listing] = []
    listing_counter = 0
    for host, count in zip(host_pool, listings_per_host):
        for _ in range(count):
            listing_counter += 1
            city, region, country, lat, lng = LOCATIONS[(listing_counter - 1) % len(LOCATIONS)]
            property_type = list(PropertyType)[(listing_counter - 1) % len(PropertyType)]
            adj = random.choice(ADJECTIVES)
            noun = random.choice(TYPE_NOUNS[property_type])
            title = f"{adj} {noun} in {city}"
            desc_template = random.choice(DESC_TEMPLATES)
            description = desc_template.format(adj_lower=adj.lower(), noun_lower=noun.lower(), city=city)

            price = round(random.uniform(45, 650), 2)
            max_guests = random.randint(1, 10)
            bedrooms = max(1, max_guests // 2)
            beds = max(1, max_guests // 2 + random.randint(0, 1))
            bathrooms = float(random.choice([1, 1, 1.5, 2, 2.5, 3]))

            listing = Listing(
                host_id=host.id,
                title=title,
                description=description,
                property_type=property_type,
                city=city,
                region=region,
                country=country,
                latitude=lat + random.uniform(-0.02, 0.02),
                longitude=lng + random.uniform(-0.02, 0.02),
                price_per_night=price,
                cleaning_fee=round(random.uniform(20, 90), 2),
                max_guests=max_guests,
                bedrooms=bedrooms,
                beds=beds,
                bathrooms=bathrooms,
            )
            listing.amenities = random.sample(amenities, k=random.randint(3, 8))

            image_count = random.randint(3, 6)
            listing.images = [
                ListingImage(url=f"https://picsum.photos/seed/nomly-{listing_counter}-{n}/900/600", position=n)
                for n in range(image_count)
            ]
            db.add(listing)
            listings.append(listing)
    db.flush()

    print("Seeding bookings...")
    past_window = (TODAY - timedelta(days=200), TODAY - timedelta(days=9))
    upcoming_window = (TODAY + timedelta(days=3), TODAY + timedelta(days=150))

    all_bookings: list[Booking] = []
    past_confirmed: list[Booking] = []
    listing_ranges: dict[int, list[tuple[date, date]]] = {listing.id: [] for listing in listings}

    target_past = 35
    target_upcoming = 25
    made_past = made_upcoming = 0
    guard = 0
    while (made_past < target_past or made_upcoming < target_upcoming) and guard < 2000:
        guard += 1
        listing = random.choice(listings)
        eligible_guests = [g for g in guest_pool if g.id != listing.host_id]
        guest = random.choice(eligible_guests)

        want_past = made_past < target_past and (made_upcoming >= target_upcoming or random.random() < 0.6)
        window = past_window if want_past else upcoming_window

        result = find_non_overlapping_range(listing_ranges[listing.id], window_start=window[0], window_end=window[1])
        if result is None:
            continue
        check_in, check_out = result
        nights = (check_out - check_in).days
        nightly_rate = float(listing.price_per_night)
        cleaning_fee = float(listing.cleaning_fee)
        service_fee = round(nightly_rate * nights * 0.12, 2)
        total_price = round(nightly_rate * nights + cleaning_fee + service_fee, 2)

        booking = Booking(
            listing_id=listing.id,
            guest_id=guest.id,
            check_in=check_in,
            check_out=check_out,
            num_guests=random.randint(1, listing.max_guests),
            nights=nights,
            nightly_rate=nightly_rate,
            cleaning_fee=cleaning_fee,
            service_fee=service_fee,
            total_price=total_price,
            status=BookingStatus.confirmed,
        )
        db.add(booking)
        listing_ranges[listing.id].append((check_in, check_out))
        all_bookings.append(booking)
        if want_past:
            made_past += 1
            past_confirmed.append(booking)
        else:
            made_upcoming += 1
    db.flush()

    print(f"  -> {made_past} past + {made_upcoming} upcoming confirmed bookings")

    print("Seeding cancelled bookings...")
    for _ in range(5):
        listing = random.choice(listings)
        eligible_guests = [g for g in guest_pool if g.id != listing.host_id]
        guest = random.choice(eligible_guests)
        check_in = TODAY + timedelta(days=random.randint(5, 100))
        nights = random.randint(2, 5)
        check_out = check_in + timedelta(days=nights)
        nightly_rate = float(listing.price_per_night)
        cleaning_fee = float(listing.cleaning_fee)
        service_fee = round(nightly_rate * nights * 0.12, 2)
        total_price = round(nightly_rate * nights + cleaning_fee + service_fee, 2)
        db.add(
            Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=check_in,
                check_out=check_out,
                num_guests=random.randint(1, listing.max_guests),
                nights=nights,
                nightly_rate=nightly_rate,
                cleaning_fee=cleaning_fee,
                service_fee=service_fee,
                total_price=total_price,
                status=BookingStatus.cancelled,
            )
        )
    db.flush()

    print("Seeding reviews...")
    reviewable = random.sample(past_confirmed, k=round(len(past_confirmed) * 0.7))
    for booking in reviewable:
        rating = random.choices([5, 4, 3, 2], weights=[45, 35, 15, 5])[0]
        db.add(
            Review(
                listing_id=booking.listing_id,
                booking_id=booking.id,
                author_id=booking.guest_id,
                rating=rating,
                comment=random.choice(REVIEW_COMMENTS),
            )
        )
    db.flush()
    print(f"  -> {len(reviewable)} reviews")

    print("Seeding favorites...")
    favorite_count = 0
    seen_pairs = set()
    for user in users:
        is_guest_leaning = user in guest_pool
        sample_size = random.randint(3, 5) if is_guest_leaning else random.randint(0, 2)
        candidates = [l for l in listings if l.host_id != user.id]
        for listing in random.sample(candidates, k=min(sample_size, len(candidates))):
            pair = (user.id, listing.id)
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)
            db.add(Favorite(user_id=user.id, listing_id=listing.id))
            favorite_count += 1
    db.flush()
    print(f"  -> {favorite_count} favorites")

    db.commit()
    print("\nSeed complete.")
    print(f"  Users: {len(users)} (dev password for all: '{DEV_PASSWORD}')")
    print(f"  Listings: {len(listings)}")
    print(f"  Bookings: {len(all_bookings) + 5} ({made_past} past, {made_upcoming} upcoming, 5 cancelled)")
    print(f"  Reviews: {len(reviewable)}")
    print(f"  Favorites: {favorite_count}")
    print("\nSample logins:")
    for u in [host_only_users[0], guest_only_users[0], overlap_users[0]]:
        print(f"  {u.email} / {DEV_PASSWORD}")


def main() -> None:
    reset = "--reset" in sys.argv

    if reset:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.scalar(select(User.id).limit(1))
        if existing is not None and not reset:
            print("Database already has users -- skipping seed (pass --reset to wipe and reseed).")
            return
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
