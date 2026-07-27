export type PropertyType = "apartment" | "house" | "guesthouse" | "hotel" | "unique_stay";

export type BookingStatus = "confirmed" | "cancelled";

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_seed: string;
  bio: string | null;
  created_at: string;
  is_superhost: boolean;
  listings_count: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Amenity {
  id: number;
  name: string;
  icon_key: string;
}

export interface ListingCard {
  id: number;
  title: string;
  property_type: PropertyType;
  city: string;
  region: string | null;
  country: string;
  price_per_night: number;
  max_guests: number;
  cover_image: string | null;
  rating_avg: number | null;
  review_count: number;
  is_favorited: boolean | null;
}

export interface HostListing extends ListingCard {
  is_active: boolean;
  upcoming_bookings_count: number;
  total_bookings_count: number;
}

export interface HostMini {
  id: number;
  full_name: string;
  avatar_seed: string;
  bio: string | null;
  created_at: string;
  is_superhost: boolean;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: PropertyType;
  city: string;
  region: string | null;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  is_active: boolean;
  created_at: string;
  images: string[];
  amenities: Amenity[];
  host: HostMini;
  rating_avg: number | null;
  review_count: number;
  is_favorited: boolean | null;
}

export interface PaginatedListings {
  items: ListingCard[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface BookingListingMini {
  id: number;
  title: string;
  city: string;
  country: string;
  cover_image: string | null;
}

export interface BookingGuestMini {
  id: number;
  full_name: string;
  avatar_seed: string;
}

export interface Booking {
  id: number;
  listing: BookingListingMini;
  guest: BookingGuestMini;
  check_in: string;
  check_out: string;
  num_guests: number;
  nights: number;
  nightly_rate: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  can_review: boolean;
  can_cancel: boolean;
}

export interface UnavailableRange {
  check_in: string;
  check_out: string;
}

export interface Review {
  id: number;
  listing_id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: {
    id: number;
    full_name: string;
    avatar_seed: string;
  };
}

export interface PaginatedReviews {
  items: Review[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ListingFormValues {
  title: string;
  description: string;
  property_type: PropertyType;
  city: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenity_ids: number[];
  images: string[];
}
