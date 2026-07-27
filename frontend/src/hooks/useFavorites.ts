"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { ListingCard } from "@/types";

export function useFavorites() {
  const { token, user } = useAuth();
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.get<ListingCard[]>("/favorites/mine", token),
    enabled: Boolean(user),
  });
}

export function useToggleFavorite() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: number) =>
      api.post<{ favorited: boolean }>(`/favorites/${listingId}`, undefined, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
    },
  });
}
