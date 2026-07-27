"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { HostListing, ListingDetail, ListingFormValues } from "@/types";

export function useMyListings() {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: ["my-listings"],
    queryFn: () => api.get<HostListing[]>("/listings/mine", token),
    enabled: Boolean(user),
  });
}

export function useCreateListing() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingFormValues) => api.post<ListingDetail>("/listings/", input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListing(listingId: number) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ListingFormValues>) =>
      api.put<ListingDetail>(`/listings/${listingId}`, input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    },
  });
}

export function useDeleteListing() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: number) => api.delete<void>(`/listings/${listingId}`, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
