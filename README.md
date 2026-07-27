# Nomly

A functional Airbnb-style stay marketplace built from scratch as a coding assignment: browse/search listings, book stays with real availability validation, manage trips, and run a full host CRUD workflow — all with its own brand identity ("Nomly": bold coral-to-violet gradient, pill buttons, playful copy) rather than a literal Airbnb reskin.

- **Frontend:** `frontend/` — Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Backend:** `backend/` — FastAPI + SQLAlchemy + SQLite
- **Auth:** lightweight real auth — signup/login, bcrypt-hashed passwords, JWT bearer tokens. No email verification, no separate "become a host" flow — any signed-in user can list a place.

---

## 1. Quick Start

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

25 tests cover auth, listing CRUD/search, and — most importantly — the booking-overlap algorithm (conflict rejection, back-to-back allowance, past-date rejection, over-capacity rejection, self-booking rejection, cancellation rules).

---

## 2. Tech Stack

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

## 3. Architecture Overview

```
airbnb_asst/
├── backend/
│   └── app/
│       ├── main.py            FastAPI app, CORS, router registration, lifespan (create_all)
│       ├── seed.py             python -m app.seed [--reset]
│       ├── core/               config.py (pydantic-settings), security.py (bcrypt + JWT)
│       ├── db/                 base.py (declarative Base), session.py (engine, FK pragma, get_db)
│       ├── deps.py             get_current_user / get_current_user_optional (JWT bearer dependency)
│       ├── models/              SQLAlchemy models (see schema below)
│       ├── schemas/             Pydantic request/response models
│       ├── crud/                DB query/mutation logic, incl. the booking-overlap algorithm
│       └── routers/             auth, users, listings, availability, bookings, reviews, favorites, amenities
│   └── tests/                   pytest suite (conftest.py fixtures + 3 test modules)
└── frontend/
    └── src/
        ├── app/                 route entries (mostly thin wrappers; heavy lifting lives in components/)
        ├── components/          layout, listing, search, booking, reviews, host, ui, auth, home
        ├── context/AuthContext.tsx   localStorage-backed JWT session
        ├── hooks/                one hook per resource (useListings, useBookings, useFavorites, ...)
        ├── lib/                  api.ts (fetch wrapper), auth.ts, utils.ts, constants.ts
        └── types/                TypeScript mirrors of the backend Pydantic schemas
```

**Client/server split:** every data-fetching page is a Client Component using React Query — there's no server-side data fetching or SSR hydration boundary to manage, since auth state lives in `localStorage` and nearly every page needs it. The browser talks directly to FastAPI via `NEXT_PUBLIC_API_URL`; there are no Next.js API routes in between.

**Auth:** JWT is sent as `Authorization: Bearer <token>`, not a cookie. With the frontend and backend on different origins in local dev, cookie-based auth would need `SameSite=None; Secure`, `credentials: include` on every request, and CSRF handling — a bearer token sidesteps all of that at the cost of the token being readable by injected scripts (an acceptable tradeoff for a local demo with no third-party scripts).

**The booking-overlap algorithm** (`backend/app/crud/booking.py`) is the piece most worth understanding for the eval interview:

- Two date ranges are modeled as half-open intervals `[check_in, check_out)`. They conflict iff `existing.check_in < new.check_out AND existing.check_out > new.check_in`. This correctly *allows* back-to-back stays — one guest's checkout day can be another's check-in day.
- Full validation order on `POST /api/bookings`: listing exists & active → `check_out > check_in` → `check_in >= today` → `guests <= listing.max_guests` → `guest_id != listing.host_id` (hosts can't book their own place) → overlap check (409 if conflict) → snapshot pricing fields from the listing (never trust client-sent prices) → insert.
- A module-level `threading.Lock()` guards the check-then-insert critical section. This is a deliberate, explicitly-commented simplification appropriate for a single-process SQLite dev server — not a substitute for `SELECT ... FOR UPDATE`-style locking in a real multi-process deployment.

**Soft delete only:** listings are never hard-deleted (`is_active` flag instead), so existing bookings and reviews always keep a valid `listing_id` to join against, and a host can "unlist" a place with upcoming reservations without invalidating a guest's trip.

---

## 4. Database Schema

All foreign keys are enforced (`PRAGMA foreign_keys=ON`, set via a SQLAlchemy connect-event listener since SQLite disables this by default).

| Table | Key columns | Notes |
|---|---|---|
| **users** | `email` (unique), `hashed_password`, `full_name`, `avatar_seed`, `bio` | `is_superhost` and `listings_count` are **computed on read**, never stored — superhost = a host's listings' average review rating ≥ 4.5 **and** ≥ 5 confirmed bookings across them |
| **listings** | `host_id`→users, `title`, `description`, `property_type` (enum), `city`/`region`/`country`, `latitude`/`longitude` (display-only, feeds the decorative static map), `price_per_night`, `cleaning_fee`, `max_guests`, `bedrooms`, `beds`, `bathrooms`, `is_active` | Soft-delete via `is_active`; never physically removed |
| **listing_images** | `listing_id`→listings (CASCADE), `url`, `position` | Ordered gallery images |
| **amenities** | `name` (unique), `icon_key` | Fixed seed set of 12; `icon_key` maps to a lucide icon on the frontend |
| **listing_amenities** | `(listing_id, amenity_id)` composite PK | Many-to-many join table |
| **bookings** | `listing_id`, `guest_id`, `check_in`, `check_out`, `num_guests`, `nights`, `nightly_rate`/`cleaning_fee`/`service_fee`/`total_price` (all **snapshotted** at booking time), `status` (confirmed/cancelled) | `CHECK(check_out > check_in)`; composite index on `(listing_id, check_in, check_out)` for the overlap query |
| **reviews** | `listing_id`, `booking_id` (**unique** — one review per booking), `author_id`, `rating` (1–5), `comment` | Eligibility enforced server-side: confirmed booking, checkout in the past, not already reviewed |
| **favorites** | `user_id`, `listing_id`, `UNIQUE(user_id, listing_id)` | Simple wishlist join table |

---

## 5. API Overview

All routes are prefixed `/api`. Interactive Swagger docs: `http://localhost:8000/docs`.

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

## 6. Feature Checklist

- Home/Explore: search bar (location + dates + guests), category pills + full filter modal (price range, property type, amenities), sort, pagination, "Surprise me" random-listing discovery, and a List/Map toggle — Map mode plots the current page's results on an interactive OpenStreetMap view with branded price-pill pins; clicking a pin opens a popup with a thumbnail/price/rating that links to the listing.
- Listing detail: photo gallery with lightbox, amenities, host card with superhost badge, decorative static map, reviews, inline booking widget with a live calendar (booked ranges greyed out).
- Booking flow: date + guest validation, price breakdown (nightly × nights + cleaning + service fee), mocked-checkout confirmation modal with a small celebratory moment, My Trips (upcoming/past, cancel, write a review).
- Host CRUD: create/edit/unlist listings, host dashboard with owned listings + reservations across all of them.
- Wishlist/favorites, toasts on every mutation, responsive layout (mobile/tablet/desktop), dark mode toggle.
- Mocked-only, explicitly stubbed as "Coming soon": messaging (`/messages`) and identity verification (`/verify-identity`).

---

## 7. Assumptions & Known Limitations

- **Payments** are entirely simulated — the booking confirmation modal says so explicitly; no card details are ever collected.
- **Messaging** and **identity verification** are static "Coming soon" pages per the assignment's scope.
- **Maps**: the home page has a real interactive map (react-leaflet + OpenStreetMap, branded price-pill pins, click-through popups) as a bonus feature. The listing detail page's "Where you'll be" section intentionally stays a decorative static SVG (gradient blobs + a pin + city/country label, no exact address) — mirroring how Airbnb only reveals the approximate area pre-booking, not a limitation of the map integration.
- **Images** are deterministic placeholder photos from `picsum.photos/seed/...`. Because picsum has no category filter, a "Boutique Room" listing may show an arbitrary stock photo (a leaf, a bridge, etc.) rather than an actual interior — a known and accepted tradeoff of using a keyless placeholder image service.
- **Auth** has no email verification and a single long-lived JWT (no refresh tokens) — appropriate for a local demo, not production-grade.
- **Concurrency:** the booking-overlap check uses an in-process lock rather than database-level row locking (see the architecture section above) — correct for a single-process dev server, not a distributed deployment.
- **Deployment:** frontend on Vercel (root directory `frontend/`), backend on Render's free tier via the `render.yaml` Blueprint at the repo root. The two talk over `NEXT_PUBLIC_API_URL` on the frontend and `CORS_ORIGINS` on the backend, rather than being served from one domain. Render's free tier has no persistent disk, so `nomly.db` resets on every redeploy/restart — the backend self-seeds its demo data on startup whenever the database is empty (`AUTO_SEED_ON_STARTUP`, on by default), idempotent and deterministic (`random.seed(42)`), so a reset always reproduces the same clean dataset instead of serving a blank app. Free tier also spins down after 15 minutes of inactivity, so the first request after a while can take 30-50s to wake back up.
- `npm audit` flags several **high-severity advisories in dev-only tooling** (ESLint's dependency chain, PostCSS, `sharp`) pulled in transitively by the pinned Next.js 16 toolchain. These are build-time/dev dependencies, not runtime application code, and aren't exposed to end users of the running app.
