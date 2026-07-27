"use client";

import ListingGrid from "@/components/listing/ListingGrid";
import { useFavorites } from "@/hooks/useFavorites";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function FavoritesPage() {
  const { isChecking } = useRequireAuth();
  const { data: favorites, isLoading, isError, refetch } = useFavorites();

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Your wishlist</h1>
      <ListingGrid listings={favorites} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
    </div>
  );
}
