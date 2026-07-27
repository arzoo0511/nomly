"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Booking } from "@/types";

export type TripScope = "upcoming" | "past" | "all";

export function useMyBookings(scope: TripScope) {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: ["my-bookings", scope],
    queryFn: () => api.get<Booking[]>(`/bookings/mine?scope=${scope}`, token),
    enabled: Boolean(user),
  });
}

export function useHostBookings(listingId?: number) {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: ["host-bookings", listingId ?? "all"],
    queryFn: () =>
      api.get<Booking[]>(`/host/bookings${listingId ? `?listing_id=${listingId}` : ""}`, token),
    enabled: Boolean(user),
  });
}

interface CreateBookingInput {
  listing_id: number;
  check_in: string;
  check_out: string;
  num_guests: number;
}

export function useCreateBooking() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => api.post<Booking>("/bookings", input, token),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listing-unavailable-dates", variables.listing_id] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useCancelBooking() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) => api.delete<Booking>(`/bookings/${bookingId}`, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["host-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listing-unavailable-dates"] });
    },
  });
}
