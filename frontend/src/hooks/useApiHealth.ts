"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useApiHealth() {
  return useQuery({
    queryKey: ["api-health"],
    queryFn: () => api.get<{ status: string }>("/health"),
    retry: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}
