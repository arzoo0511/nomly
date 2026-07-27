from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.amenity import Amenity
from app.models.booking import Booking, BookingStatus
from app.models.listing import Listing, PropertyType
from app.models.listing_image import ListingImage
from app.models.review import Review
from app.schemas.listing import HostListingOut, ListingCardOut, ListingCreate, ListingDetailOut, ListingUpdate

from app.crud.user import compute_superhost_stats


def _review_agg_subquery():
    return (
        select(
            Review.listing_id.label("listing_id"),
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.listing_id)
        .subquery()
    )


def _favorited_listing_ids(db: Session, user_id: int | None, listing_ids: list[int]) -> set[int]:
    if not user_id or not listing_ids:
        return set()
    from app.models.favorite import Favorite

    rows = db.scalars(
        select(Favorite.listing_id).where(Favorite.user_id == user_id, Favorite.listing_id.in_(listing_ids))
    ).all()
    return set(rows)


def search_listings(
    db: Session,
    *,
    q: str | None,
    check_in: date | None,
    check_out: date | None,
    guests: int | None,
    min_price: float | None,
    max_price: float | None,
    property_types: list[PropertyType] | None,
    amenity_ids: list[int] | None,
    sort: str,
    page: int,
    page_size: int,
    current_user_id: int | None,
) -> tuple[list[ListingCardOut], int]:
    review_agg = _review_agg_subquery()

    base = select(Listing, review_agg.c.avg_rating, review_agg.c.review_count).outerjoin(
        review_agg, review_agg.c.listing_id == Listing.id
    ).where(Listing.is_active.is_(True))

    if q:
        like = f"%{q.strip()}%"
        base = base.where(
            (Listing.title.ilike(like))
            | (Listing.city.ilike(like))
            | (Listing.region.ilike(like))
            | (Listing.country.ilike(like))
        )
    if guests:
        base = base.where(Listing.max_guests >= guests)
    if min_price is not None:
        base = base.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        base = base.where(Listing.price_per_night <= max_price)
    if property_types:
        base = base.where(Listing.property_type.in_(property_types))
    if amenity_ids:
        for amenity_id in amenity_ids:
            base = base.where(Listing.amenities.any(Amenity.id == amenity_id))
    if check_in and check_out:
        conflict_subq = (
            select(Booking.id)
            .where(
                Booking.listing_id == Listing.id,
                Booking.status == BookingStatus.confirmed,
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .exists()
        )
        base = base.where(~conflict_subq)

    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0

    if sort == "price_asc":
        base = base.order_by(Listing.price_per_night.asc())
    elif sort == "price_desc":
        base = base.order_by(Listing.price_per_night.desc())
    elif sort == "rating_desc":
        base = base.order_by(review_agg.c.avg_rating.desc(), Listing.created_at.desc())
    else:
        base = base.order_by(Listing.created_at.desc())

    base = base.offset((page - 1) * page_size).limit(page_size)
    base = base.options(selectinload(Listing.images))

    rows = db.execute(base).all()
    listing_ids = [row[0].id for row in rows]
    favorited_ids = _favorited_listing_ids(db, current_user_id, listing_ids)

    items = [
        ListingCardOut(
            id=listing.id,
            title=listing.title,
            property_type=listing.property_type,
            city=listing.city,
            region=listing.region,
            country=listing.country,
            latitude=listing.latitude,
            longitude=listing.longitude,
            price_per_night=float(listing.price_per_night),
            max_guests=listing.max_guests,
            cover_image=listing.images[0].url if listing.images else None,
            rating_avg=round(float(avg_rating), 2) if avg_rating is not None else None,
            review_count=review_count or 0,
            is_favorited=(listing.id in favorited_ids) if current_user_id else None,
        )
        for listing, avg_rating, review_count in rows
    ]
    return items, total


def serialize_listings_to_cards(
    db: Session, listings: list[Listing], current_user_id: int | None
) -> list[ListingCardOut]:
    listing_ids = [listing.id for listing in listings]
    favorited_ids = _favorited_listing_ids(db, current_user_id, listing_ids)
    cards = []
    for listing in listings:
        agg = db.execute(
            select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing.id)
        ).one()
        avg_rating, review_count = agg[0], agg[1] or 0
        cards.append(
            ListingCardOut(
                id=listing.id,
                title=listing.title,
                property_type=listing.property_type,
                city=listing.city,
                region=listing.region,
                country=listing.country,
                latitude=listing.latitude,
                longitude=listing.longitude,
                price_per_night=float(listing.price_per_night),
                max_guests=listing.max_guests,
                cover_image=listing.images[0].url if listing.images else None,
                rating_avg=round(float(avg_rating), 2) if avg_rating is not None else None,
                review_count=review_count,
                is_favorited=(listing.id in favorited_ids) if current_user_id else None,
            )
        )
    return cards


def get_random_listing_id(db: Session) -> int | None:
    return db.scalar(select(Listing.id).where(Listing.is_active.is_(True)).order_by(func.random()).limit(1))


def get_listing_detail(db: Session, listing_id: int, current_user_id: int | None) -> ListingDetailOut | None:
    listing = db.get(
        Listing,
        listing_id,
        options=[selectinload(Listing.images), selectinload(Listing.amenities), selectinload(Listing.host)],
    )
    if listing is None:
        return None

    agg = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    avg_rating, review_count = agg[0], agg[1] or 0

    is_superhost, _ = compute_superhost_stats(db, listing.host_id)
    favorited_ids = _favorited_listing_ids(db, current_user_id, [listing_id])

    return ListingDetailOut(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        city=listing.city,
        region=listing.region,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=float(listing.price_per_night),
        cleaning_fee=float(listing.cleaning_fee),
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        is_active=listing.is_active,
        created_at=listing.created_at,
        images=[img.url for img in listing.images],
        amenities=list(listing.amenities),
        host={
            "id": listing.host.id,
            "full_name": listing.host.full_name,
            "avatar_seed": listing.host.avatar_seed,
            "bio": listing.host.bio,
            "created_at": listing.host.created_at,
            "is_superhost": is_superhost,
        },
        rating_avg=round(float(avg_rating), 2) if avg_rating is not None else None,
        review_count=review_count,
        is_favorited=(listing_id in favorited_ids) if current_user_id else None,
    )


def create_listing(db: Session, host_id: int, data: ListingCreate) -> Listing:
    listing = Listing(
        host_id=host_id,
        title=data.title,
        description=data.description,
        property_type=data.property_type,
        city=data.city,
        region=data.region,
        country=data.country,
        latitude=data.latitude,
        longitude=data.longitude,
        price_per_night=data.price_per_night,
        cleaning_fee=data.cleaning_fee,
        max_guests=data.max_guests,
        bedrooms=data.bedrooms,
        beds=data.beds,
        bathrooms=data.bathrooms,
    )
    if data.amenity_ids:
        listing.amenities = list(db.scalars(select(Amenity).where(Amenity.id.in_(data.amenity_ids))))
    listing.images = [ListingImage(url=url, position=i) for i, url in enumerate(data.images)]
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def update_listing(db: Session, listing: Listing, data: ListingUpdate) -> Listing:
    update_fields = data.model_dump(exclude_unset=True, exclude={"amenity_ids", "images"})
    for field, value in update_fields.items():
        setattr(listing, field, value)

    if data.amenity_ids is not None:
        listing.amenities = list(db.scalars(select(Amenity).where(Amenity.id.in_(data.amenity_ids))))
    if data.images is not None:
        listing.images.clear()
        listing.images = [ListingImage(url=url, position=i) for i, url in enumerate(data.images)]

    db.commit()
    db.refresh(listing)
    return listing


def soft_delete_listing(db: Session, listing: Listing) -> None:
    listing.is_active = False
    db.commit()


def get_owned_listings(db: Session, host_id: int) -> list[HostListingOut]:
    listings = db.scalars(
        select(Listing)
        .where(Listing.host_id == host_id)
        .options(selectinload(Listing.images))
        .order_by(Listing.created_at.desc())
    ).all()

    today = date.today()
    items = []
    for listing in listings:
        agg = db.execute(
            select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing.id)
        ).one()
        avg_rating, review_count = agg[0], agg[1] or 0

        total_bookings = (
            db.scalar(
                select(func.count(Booking.id)).where(
                    Booking.listing_id == listing.id, Booking.status == BookingStatus.confirmed
                )
            )
            or 0
        )
        upcoming_bookings = (
            db.scalar(
                select(func.count(Booking.id)).where(
                    Booking.listing_id == listing.id,
                    Booking.status == BookingStatus.confirmed,
                    Booking.check_in >= today,
                )
            )
            or 0
        )

        items.append(
            HostListingOut(
                id=listing.id,
                title=listing.title,
                property_type=listing.property_type,
                city=listing.city,
                region=listing.region,
                country=listing.country,
                latitude=listing.latitude,
                longitude=listing.longitude,
                price_per_night=float(listing.price_per_night),
                max_guests=listing.max_guests,
                cover_image=listing.images[0].url if listing.images else None,
                rating_avg=round(float(avg_rating), 2) if avg_rating is not None else None,
                review_count=review_count,
                is_active=listing.is_active,
                upcoming_bookings_count=upcoming_bookings,
                total_bookings_count=total_bookings,
            )
        )
    return items
