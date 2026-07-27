import {
  Building2,
  Car,
  Dumbbell,
  Flame,
  Hotel,
  Laptop,
  PawPrint,
  Tent,
  Tv,
  UtensilsCrossed,
  Waves,
  Wifi,
  Wind,
  WashingMachine,
  Bath,
  Home,
  type LucideIcon,
} from "lucide-react";
import type { PropertyType } from "@/types";

export const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  kitchen: UtensilsCrossed,
  parking: Car,
  ac: Wind,
  washer: WashingMachine,
  tv: Tv,
  pool: Waves,
  hot_tub: Bath,
  gym: Dumbbell,
  workspace: Laptop,
  pet_friendly: PawPrint,
  fireplace: Flame,
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  house: "House",
  guesthouse: "Guesthouse",
  hotel: "Hotel",
  unique_stay: "Unique stay",
};

export const PROPERTY_TYPE_ICONS: Record<PropertyType, LucideIcon> = {
  apartment: Building2,
  house: Home,
  guesthouse: Tent,
  hotel: Hotel,
  unique_stay: Tent,
};

export const PROPERTY_TYPES: PropertyType[] = ["apartment", "house", "guesthouse", "hotel", "unique_stay"];

export const SERVICE_FEE_RATE = 0.12;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Top Rated" },
] as const;
