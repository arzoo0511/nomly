"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Amenity } from "@/types";

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: () => api.get<Amenity[]>("/amenities/"),
    staleTime: Infinity,
  });
}
