"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ListingDetail, UnavailableRange } from "@/types";

export function useListing(id: number | undefined) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["listing", id, Boolean(token)],
    queryFn: () => api.get<ListingDetail>(`/listings/${id}`, token),
    enabled: id !== undefined,
  });
}

export function useUnavailableDates(id: number | undefined) {
  return useQuery({
    queryKey: ["listing-unavailable-dates", id],
    queryFn: () => api.get<UnavailableRange[]>(`/listings/${id}/unavailable-dates`),
    enabled: id !== undefined,
  });
}
