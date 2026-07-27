"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { PaginatedListings, PropertyType } from "@/types";

export interface ListingSearchParams {
  q?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: PropertyType[];
  amenities?: number[];
  sort?: string;
  page?: number;
  page_size?: number;
}

export function buildListingQuery(params: ListingSearchParams): string {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.check_in) usp.set("check_in", params.check_in);
  if (params.check_out) usp.set("check_out", params.check_out);
  if (params.guests) usp.set("guests", String(params.guests));
  if (params.min_price !== undefined) usp.set("min_price", String(params.min_price));
  if (params.max_price !== undefined) usp.set("max_price", String(params.max_price));
  for (const pt of params.property_type ?? []) usp.append("property_type", pt);
  if (params.amenities?.length) usp.set("amenities", params.amenities.join(","));
  if (params.sort) usp.set("sort", params.sort);
  usp.set("page", String(params.page ?? 1));
  usp.set("page_size", String(params.page_size ?? 12));
  return usp.toString();
}

export function useListings(params: ListingSearchParams) {
  const { token } = useAuth();
  const qs = buildListingQuery(params);
  return useQuery({
    queryKey: ["listings", qs, Boolean(token)],
    queryFn: () => api.get<PaginatedListings>(`/listings/?${qs}`, token),
    placeholderData: (previous) => previous,
  });
}
