import Link from "next/link";
import { ImageOff, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ListingCard } from "@/types";

// Plain <img> rather than next/image -- this renders inside a Leaflet popup
// (a DOM node Leaflet manages outside Next's normal layout sizing), where
// next/image's fill/layout assumptions are more likely to misbehave.
export default function MapPopupCard({ listing }: { listing: ListingCard }) {
  return (
    <Link href={`/listings/${listing.id}`} className="flex flex-col gap-0">
      <div className="relative h-28 w-full overflow-hidden bg-ink-100">
        {listing.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.cover_image} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <ImageOff size={22} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink-900">{listing.city}</p>
          {listing.rating_avg !== null && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-ink-700">
              <Star size={11} className="fill-brand-coral text-brand-coral" />
              {listing.rating_avg.toFixed(1)}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-ink-500">{listing.title}</p>
        <p className="mt-0.5 text-sm">
          <span className="font-tabular font-semibold text-ink-900">{formatPrice(listing.price_per_night)}</span>{" "}
          <span className="text-xs text-ink-500">night</span>
        </p>
      </div>
    </Link>
  );
}
