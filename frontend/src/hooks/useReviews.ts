"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { PaginatedReviews } from "@/types";

export function useListingReviews(listingId: number | undefined, page = 1) {
  return useQuery({
    queryKey: ["listing-reviews", listingId, page],
    queryFn: () => api.get<PaginatedReviews>(`/listings/${listingId}/reviews?page=${page}&page_size=10`),
    enabled: listingId !== undefined,
  });
}

interface CreateReviewInput {
  booking_id: number;
  rating: number;
  comment: string;
}

export function useCreateReview() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post("/reviews", input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listing-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
