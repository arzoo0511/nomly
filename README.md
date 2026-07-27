# Nomly

> ### 🏡 Entire full-stack developer — hosted by Arzoo
> ⭐ **5.0** (1 review: *"Showed up with a working booking-overlap algorithm instead of flowers. Would host again."*) · **Superhost** · Free cancellation on bad hires, anytime
>
> **$0 / night** *(negotiable — I'll accept a salary instead)*
>
> **This place offers:** a database schema that survived its own evaluation interview · zero double-bookings, guaranteed by a half-open interval and not by hope · dark mode · a README that doesn't lie to you about what's actually built 
>
> *House rules: no ghosting after the take-home. Instant Book available — scroll down for the actual documentation.*

A functional Airbnb clone built end-to-end for the SDE Fullstack Assignment: browse/search listings, book real stays with real overlap validation, manage trips, run a full host CRUD dashboard, and a UI that's had two passes — one to get it working, one to make it actually *look* like Airbnb instead of a generic listings app with an Airbnb-shaped hat on.

- **Frontend:** `frontend/` — Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Backend:** `backend/` — FastAPI + SQLAlchemy + SQLite
- **Auth:** real auth — signup/login, bcrypt-hashed passwords, JWT bearer tokens. No email verification, no separate "become a host" flow — any signed-in user can list a place, exactly like the assignment allows.

### 🔗 Live

| | |
|---|---|
| **App** | [nomly-kohl.vercel.app](https://nomly-kohl.vercel.app) |
| **API docs (Swagger)** | [nomly-backend-npcq.onrender.com/docs](https://nomly-backend-npcq.onrender.com/docs) |
| **Repo** | [github.com/arzoo0511/nomly](https://github.com/arzoo0511/nomly) |

The backend is on Render's free tier, so if it's been idle for 15 minutes the first request takes 30-50s to wake up. That's the free tier's fault, not the booking algorithm's.

---

## 1. Assignment Coverage — what's actually done, mapped to the brief

Every heading below matches the assignment doc 1:1, so you can check it off against the original without cross-referencing anything.

### Home & Search ✅
- Grid of listing cards (photo, title, location, price/night, rating) → [`ListingCard.tsx`](frontend/src/components/listing/ListingCard.tsx), [`ListingGrid.tsx`](frontend/src/components/listing/ListingGrid.tsx)
- Search bar (location + date range + guests) → [`SearchBar.tsx`](frontend/src/components/search/SearchBar.tsx), a real pill search bar that writes to the URL query string
- Category / filter row (price range, property type, amenities) → [`FilterBar.tsx`](frontend/src/components/search/FilterBar.tsx) (icon-above-label category row, Airbnb-style) + [`FilterModal.tsx`](frontend/src/components/search/FilterModal.tsx) (price range, property type, amenities)
- Pagination → [`Pagination.tsx`](frontend/src/components/ui/Pagination.tsx), server-paginated (`page`/`page_size` on `GET /listings`)
- *Extra, not asked for:* a List/Map toggle with an actual interactive map (see Bonus)

### Listing Detail Page ✅
- Photo gallery → [`Gallery.tsx`](frontend/src/components/listing/Gallery.tsx) with lightbox
- Title, description, location, amenities, host info → the detail page + [`AmenityList.tsx`](frontend/src/components/listing/AmenityList.tsx) + [`HostCard.tsx`](frontend/src/components/listing/HostCard.tsx)
- Availability calendar / date-range picker → [`BookingWidget.tsx`](frontend/src/components/booking/BookingWidget.tsx), react-day-picker fed live from `GET /listings/{id}/unavailable-dates` — already-booked ranges are actually greyed out and unselectable, not decorative
- Price breakdown → [`PriceBreakdown.tsx`](frontend/src/components/listing/PriceBreakdown.tsx) (nightly rate × nights + cleaning fee + service fee)
- Reviews section → [`ReviewList.tsx`](frontend/src/components/reviews/ReviewList.tsx) / [`ReviewCard.tsx`](frontend/src/components/reviews/ReviewCard.tsx), paginated

### Booking Flow ✅
- Date range + guest count validation, no overlapping/unavailable dates → enforced twice: client-side (calendar disables booked ranges) and server-side authoritative in [`crud/booking.py`](backend/app/crud/booking.py) (see the algorithm writeup in §3 — this is the part I'd most want to walk through in an interview)
- Booking summary + mocked checkout/confirmation → [`BookingSummaryModal.tsx`](frontend/src/components/booking/BookingSummaryModal.tsx), explicit "payment is simulated, no card details collected" disclaimer, small confetti moment on confirm
- "My Trips" view → `/trips`, [`TripCard.tsx`](frontend/src/components/booking/TripCard.tsx), upcoming/past tabs, cancel
- Bookings persist and block those dates → written to the `bookings` table; every future booking attempt (by anyone) is checked against them, not just the current session

### Host Experience (CRUD) ✅
- Create a listing (title, description, photos via URL, price, location, amenities) → [`ListingForm.tsx`](frontend/src/components/host/ListingForm.tsx), `POST /listings`
- Edit and delete → `PUT /listings/{id}`, `DELETE /listings/{id}` — delete is a soft "unlist" (`is_active = false`) so a host can't accidentally orphan a guest's existing reservation
- Host dashboard of owned listings + their bookings → `/host`, [`HostListingCard.tsx`](frontend/src/components/host/HostListingCard.tsx), `GET /listings/mine`, `GET /host/bookings`
- All listing data persists → SQLAlchemy models, SQLite

### Airbnb Experience ✅
- Navigation and layout (explore grid + detail view) → [`Navbar.tsx`](frontend/src/components/layout/Navbar.tsx) + the routes above
- Cards, galleries, date pickers, modals → throughout
- Search, filters, pagination → as above
- Notifications / toasts → sonner, fired on every mutation (booking, favorite, review, listing CRUD, auth errors)
- Wishlist / favorites → heart icon on every card, `/favorites`, `POST /favorites/{id}` toggle
- *The honest part:* the first pass at this looked "Airbnb-inspired" but wasn't really Airbnb — gradients, a made-up two-tone brand, pill buttons everywhere. It got a dedicated second pass to actually match Airbnb's real language: one sparing rose accent color (no gradients), neutral grays, an icon-over-label category row with underline selection instead of pill buttons, black-filled rating stars, and a plain light footer instead of a dark decorated one.

### Mocked / Placeholder Sections (per the assignment's own scope) ✅
- Real payment processing → mocked, clearly labeled, no card fields exist anywhere in the codebase
- Messaging → `/messages`, "Coming soon"
- Identity verification → `/verify-identity`, "Coming soon"
- Real-time map with live pricing pins → actually implemented for real (see Bonus) rather than left mocked; the listing detail page's own small map stays a deliberately static/approximate illustration, matching how Airbnb itself only shows the general area before you've booked
- Guest vs. host → no separate account types; any signed-in user is a guest and can become a host by listing a place, same as the assignment allows

### Bonus (Optional) — 5 of 6

| Item | Status | Where |
|---|---|---|
| Interactive map with listing pins | ✅ | [`ListingsMap.tsx`](frontend/src/components/map/ListingsMap.tsx) — react-leaflet + OpenStreetMap, no API key, branded pins, click-through popup cards |
| Leave a review after a completed stay | ✅ | [`ReviewForm.tsx`](frontend/src/components/reviews/ReviewForm.tsx) — eligibility enforced server-side: booking must be confirmed, checkout must be in the past, can't review the same booking twice |
| Superhost badges / ratings aggregation | ✅ | computed on read, never stored — a host is a superhost if their listings average ≥4.5★ **and** have ≥5 confirmed bookings combined |
| Dark mode | ✅ | toggle in the navbar, Tailwind v4 `@custom-variant dark`, persisted in `localStorage` |
| Responsive design (mobile/tablet/desktop) | ✅ | every component built mobile-first with `sm:`/`md:`/`lg:` breakpoints, not just squeezed to fit afterward |
| Image upload to cloud storage | ⚠️ partial | listings take photo **URLs**, not binary file upload to something like S3/Cloudinary. The assignment's own core-feature wording explicitly allows "photos via URL/upload," so URL input satisfies the required CRUD feature — but I'm not going to pretend URL paste is the same as the bonus item, so it's marked honestly as not fully done. |

---

## 2. Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+ and npm

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate   # Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env    # macOS/Linux: cp .env.example .env
python -m app.seed        # seeds ~14 users, 32 listings, 65 bookings, 24 reviews, 41 favorites
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

### Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local   # macOS/Linux: cp .env.local.example .env.local
npm run dev
```

The app is now at `http://localhost:3000`.

### Demo logins

Every seeded user shares the password **`password123`**. A few to try:

| Email | Role in seed data |
|---|---|
| `maya.rivera@nomly.dev` | Host-only (owns 5 listings, never books) |
| `marcus.duarte@nomly.dev` | Guest-only (has trips/favorites/reviews, owns nothing) |
| `isabella.osei@nomly.dev` | Both a host and a guest elsewhere — demonstrates there's no separate "host account" concept |

Or sign up a brand-new account from `/signup` — any account can create a listing from `/host/listings/new` immediately.

### Re-seeding

```bash
python -m app.seed --reset   # wipes all tables and reseeds fresh
```

Re-running `python -m app.seed` without `--reset` is a no-op if data already exists (checked once at the top of the script).

### Running backend tests

```bash
cd backend
pytest -q
```

43 tests cover auth, listing CRUD/search, reviews, favorites, and — most importantly — the booking-overlap algorithm (conflict rejection, back-to-back allowance, past-date rejection, over-capacity rejection, self-booking rejection, cancellation rules).

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 16 (App Router) + TypeScript | Required by the assignment; file-based routing keeps the route map readable |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) | Custom design tokens as real CSS variables (`--color-brand-*`, `--color-ink-*`) — the same mechanism powers the dark-mode override |
| Server state | TanStack React Query | Caching, invalidation-on-mutation, background refetch, without hand-rolled fetch/loading state |
| Forms | react-hook-form + zod | Typed validation for the listing create/edit form |
| Calendar | react-day-picker | Range selection with a `disabled` matcher fed from the booked-dates API |
| Map | react-leaflet + OpenStreetMap tiles | Interactive map view with branded price-pill pins, no API key needed |
| Icons | lucide-react | Single consistent icon set for amenities, categories, and UI chrome |
| Toasts | sonner | Feedback on every mutation (booking, favorite, review, listing CRUD, auth errors) |
| Backend framework | FastAPI | Required by the assignment; async-ready, typed request/response models via Pydantic |
| ORM | SQLAlchemy 2.0 (declarative) | `PRAGMA foreign_keys=ON` enabled explicitly since SQLite disables FK enforcement by default |
| Database | SQLite | Required by the assignment; zero setup, file-based (`backend/nomly.db`) |
| Auth | passlib(bcrypt) + PyJWT | Hashed passwords, HS256 JWT, 7-day expiry, no refresh-token flow (out of scope for a demo) |
| Backend tests | pytest + httpx `TestClient` | In-memory SQLite per test (via `StaticPool`), isolated from the real dev database |

---

## 4. Architecture Overview

```
airbnb_asst/
├── backend/
│   └── app/
│       ├── main.py            FastAPI app, CORS, router registration, lifespan (create_all + self-seed)
│       ├── seed.py             python -m app.seed [--reset]
│       ├── core/               config.py (pydantic-settings), security.py (bcrypt + JWT)
│       ├── db/                 base.py (declarative Base), session.py (engine, FK pragma, get_db)
│       ├── deps.py             get_current_user / get_current_user_optional (JWT bearer dependency)
│       ├── models/              SQLAlchemy models (see schema below)
│       ├── schemas/             Pydantic request/response models
│       ├── crud/                DB query/mutation logic, incl. the booking-overlap algorithm
│       └── routers/             auth, users, listings, availability, bookings, reviews, favorites, amenities
│   └── tests/                   pytest suite (conftest.py fixtures + test modules)
└── frontend/
    └── src/
        ├── app/                 route entries (mostly thin wrappers; heavy lifting lives in components/)
        ├── components/          layout, listing, search, booking, reviews, host, ui, auth, home, map
        ├── context/AuthContext.tsx   localStorage-backed JWT session
        ├── hooks/                one hook per resource (useListings, useBookings, useFavorites, ...)
        ├── lib/                  api.ts (fetch wrapper), auth.ts, utils.ts, constants.ts
        └── types/                TypeScript mirrors of the backend Pydantic schemas
```

**Client/server split:** every data-fetching page is a Client Component using React Query — there's no server-side data fetching or SSR hydration boundary to manage, since auth state lives in `localStorage` and nearly every page needs it. The browser talks directly to FastAPI via `NEXT_PUBLIC_API_URL`; there are no Next.js API routes in between.

**Auth:** JWT is sent as `Authorization: Bearer <token>`, not a cookie. With the frontend and backend on different origins, cookie-based auth would need `SameSite=None; Secure`, `credentials: include` on every request, and CSRF handling — a bearer token sidesteps all of that at the cost of the token being readable by injected scripts (an acceptable tradeoff for a demo with no third-party scripts).

**The booking-overlap algorithm** (`backend/app/crud/booking.py`) is the piece most worth understanding for the eval interview:

- Two date ranges are modeled as half-open intervals `[check_in, check_out)`. They conflict iff `existing.check_in < new.check_out AND existing.check_out > new.check_in`. This correctly *allows* back-to-back stays — one guest's checkout day can be another's check-in day.
- Full validation order on `POST /api/bookings`: listing exists & active → `check_out > check_in` → `check_in >= today` → `guests <= listing.max_guests` → `guest_id != listing.host_id` (hosts can't book their own place) → overlap check (409 if conflict) → snapshot pricing fields from the listing (never trust client-sent prices) → insert.
- A module-level `threading.Lock()` guards the check-then-insert critical section. This is a deliberate, explicitly-commented simplification appropriate for a single-process SQLite dev server — not a substitute for `SELECT ... FOR UPDATE`-style locking in a real multi-process deployment.

**Soft delete only:** listings are never hard-deleted (`is_active` flag instead), so existing bookings and reviews always keep a valid `listing_id` to join against, and a host can "unlist" a place with upcoming reservations without invalidating a guest's trip.

---

## 5. Database Schema

All foreign keys are enforced (`PRAGMA foreign_keys=ON`, set via a SQLAlchemy connect-event listener since SQLite disables this by default).

| Table | Key columns | Notes |
|---|---|---|
| **users** | `email` (unique), `hashed_password`, `full_name`, `avatar_seed`, `bio` | `is_superhost` and `listings_count` are **computed on read**, never stored — superhost = a host's listings' average review rating ≥ 4.5 **and** ≥ 5 confirmed bookings across them |
| **listings** | `host_id`→users, `title`, `description`, `property_type` (enum), `city`/`region`/`country`, `latitude`/`longitude` (feeds the map + decorative static map), `price_per_night`, `cleaning_fee`, `max_guests`, `bedrooms`, `beds`, `bathrooms`, `is_active` | Soft-delete via `is_active`; never physically removed |
| **listing_images** | `listing_id`→listings (CASCADE), `url`, `position` | Ordered gallery images |
| **amenities** | `name` (unique), `icon_key` | Fixed seed set of 12; `icon_key` maps to a lucide icon on the frontend |
| **listing_amenities** | `(listing_id, amenity_id)` composite PK | Many-to-many join table |
| **bookings** | `listing_id`, `guest_id`, `check_in`, `check_out`, `num_guests`, `nights`, `nightly_rate`/`cleaning_fee`/`service_fee`/`total_price` (all **snapshotted** at booking time), `status` (confirmed/cancelled) | `CHECK(check_out > check_in)`; composite index on `(listing_id, check_in, check_out)` for the overlap query |
| **reviews** | `listing_id`, `booking_id` (**unique** — one review per booking), `author_id`, `rating` (1–5), `comment` | Eligibility enforced server-side: confirmed booking, checkout in the past, not already reviewed |
| **favorites** | `user_id`, `listing_id`, `UNIQUE(user_id, listing_id)` | Simple wishlist join table |

---

## 6. API Overview

All routes are prefixed `/api`. Interactive Swagger docs: `http://localhost:8000/docs` (or the [live docs](https://nomly-backend-npcq.onrender.com/docs)).

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me` |
| **Users** | `PATCH /users/me` |
| **Listings** | `GET /listings/` (search: `q`, `check_in`/`check_out`, `guests`, `min_price`/`max_price`, `property_type[]`, `amenities` (csv ids), `sort`, `page`/`page_size`), `GET /listings/mine`, `GET /listings/random` ("Surprise me"), `GET /listings/{id}`, `POST /listings/`, `PUT /listings/{id}`, `DELETE /listings/{id}` (soft) |
| **Availability** | `GET /listings/{id}/availability?check_in&check_out`, `GET /listings/{id}/unavailable-dates` |
| **Bookings** | `POST /bookings`, `GET /bookings/mine?scope=upcoming\|past\|all`, `GET /bookings/{id}`, `DELETE /bookings/{id}` (cancel), `GET /host/bookings?listing_id=` |
| **Reviews** | `POST /reviews`, `GET /listings/{id}/reviews` |
| **Favorites** | `POST /favorites/{listing_id}` (toggle), `GET /favorites/mine` |
| **Amenities** | `GET /amenities/` |

Auth-required endpoints expect `Authorization: Bearer <token>`. `GET /listings/` and `GET /listings/{id}` accept an *optional* token to populate `is_favorited` for the current user without requiring login.

---

## 7. Assumptions & Known Limitations

- **Payments** are entirely simulated — the booking confirmation modal says so explicitly; no card details are ever collected.
- **Messaging** and **identity verification** are static "Coming soon" pages per the assignment's scope.
- **Maps**: the home page has a real interactive map (react-leaflet + OpenStreetMap, branded price-pill pins, click-through popups) as a bonus feature. The listing detail page's "Where you'll be" section intentionally stays a decorative static illustration (no exact address) — mirroring how Airbnb only reveals the approximate area pre-booking, not a limitation of the map integration.
- **Images** are deterministic placeholder photos from `picsum.photos/seed/...` for seed data, and host-added listings take photo URLs rather than binary upload (see the Bonus table above). Because picsum has no category filter, a "Boutique Room" listing may show an arbitrary stock photo rather than an actual interior — an accepted tradeoff of a keyless placeholder image service.
- **Auth** has no email verification and a single long-lived JWT (no refresh tokens) — appropriate for a demo, not production-grade.
- **Concurrency:** the booking-overlap check uses an in-process lock rather than database-level row locking (see the architecture section above) — correct for a single-process dev server, not a distributed deployment.
- **Deployment:** frontend on Vercel (root directory `frontend/`), backend on Render's free tier via the `render.yaml` Blueprint at the repo root. The two talk over `NEXT_PUBLIC_API_URL` on the frontend and `CORS_ORIGINS` on the backend, rather than being served from one domain. Render's free tier has no persistent disk, so `nomly.db` resets on every redeploy/restart — the backend self-seeds its demo data on startup whenever the database is empty (`AUTO_SEED_ON_STARTUP`, on by default), idempotent and deterministic (`random.seed(42)`), so a reset always reproduces the same clean dataset instead of serving a blank app. Free tier also spins down after 15 minutes of inactivity, so the first request after a while can take 30-50s to wake back up.
- `npm audit` flags several **high-severity advisories in dev-only tooling** (ESLint's dependency chain, PostCSS, `sharp`) pulled in transitively by the pinned Next.js 16 toolchain. These are build-time/dev dependencies, not runtime application code, and aren't exposed to end users of the running app.

---

*If you read this far: the booking algorithm doesn't overlap, the reviews are real, and neither is this README. Let's talk.*
