import { AlertTriangle, SearchX } from "lucide-react";
import ListingCard from "@/components/listing/ListingCard";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";
import Button, { buttonClasses } from "@/components/ui/Button";
import TravelIllustration from "@/components/ui/TravelIllustration";
import type { ListingCard as ListingCardType } from "@/types";

export default function ListingGrid({
  listings,
  isLoading,
  isError,
  onRetry,
  emptyAction,
}: {
  listings: ListingCardType[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyAction?: { label: string; onClick: () => void };
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle size={28} />
        </div>
        <p className="text-lg font-semibold text-ink-900">Couldn&apos;t load listings</p>
        <p className="max-w-sm text-sm text-ink-500">
          We couldn&apos;t reach the Nomly server. Check that the backend is running, then try again.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <TravelIllustration icon={SearchX} />
        <p className="text-lg font-semibold text-ink-900">No stays match your search</p>
        <p className="max-w-sm text-sm text-ink-500">
          Try widening your dates, clearing a filter, or searching a different destination -- your next favorite
          place is out there somewhere.
        </p>
        {emptyAction && (
          <button type="button" onClick={emptyAction.onClick} className={buttonClasses("outline", "sm")}>
            {emptyAction.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
