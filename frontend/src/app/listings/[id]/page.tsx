"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import Gallery from "@/components/listing/Gallery";
import AmenityList from "@/components/listing/AmenityList";
import HostCard from "@/components/listing/HostCard";
import ReviewList from "@/components/reviews/ReviewList";
import BookingWidget from "@/components/booking/BookingWidget";
import StaticMap from "@/components/ui/StaticMap";
import Skeleton from "@/components/ui/Skeleton";
import Button, { buttonClasses } from "@/components/ui/Button";
import { useListing } from "@/hooks/useListing";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { ApiError } from "@/lib/api";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);
  const { data: listing, isLoading, isError, error, refetch } = useListing(listingId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-6 md:px-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-72 w-full mb-8 md:h-[420px]" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const isNotFound = error instanceof ApiError && error.status === 404;

  if (isError || !listing) {
    return (
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-ink-900">
          {isNotFound ? "Listing not found" : "Couldn't load this listing"}
        </h1>
        <p className="text-ink-500">
          {isNotFound
            ? "This stay may have been removed or the link is incorrect."
            : "We couldn't reach the Nomly server. Check that the backend is running, then try again."}
        </p>
        {isNotFound ? (
          <Link href="/" className={buttonClasses("primary")}>
            Back to exploring
          </Link>
        ) : (
          <Button onClick={() => refetch()}>Retry</Button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6 md:px-8">
      <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">{listing.title}</h1>
      <div className="mb-4 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-700">
        {listing.rating_avg !== null && (
          <span className="flex items-center gap-1 font-semibold text-ink-900">
            <Star size={14} className="fill-brand-coral text-brand-coral" />
            {listing.rating_avg.toFixed(1)} · {listing.review_count} review{listing.review_count === 1 ? "" : "s"}
          </span>
        )}
        <span>·</span>
        <span>
          {listing.city}, {listing.region ? `${listing.region}, ` : ""}
          {listing.country}
        </span>
      </div>

      <Gallery images={listing.images} title={listing.title} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="border-b border-border-subtle pb-8">
            <p className="text-lg font-semibold text-ink-900">
              {PROPERTY_TYPE_LABELS[listing.property_type]} in {listing.city}
            </p>
            <p className="text-sm text-ink-500">
              {listing.max_guests} guest{listing.max_guests === 1 ? "" : "s"} · {listing.bedrooms} bedroom
              {listing.bedrooms === 1 ? "" : "s"} · {listing.beds} bed{listing.beds === 1 ? "" : "s"} ·{" "}
              {listing.bathrooms} bath{listing.bathrooms === 1 ? "" : "s"}
            </p>
          </div>

          <div className="border-b border-border-subtle pb-8">
            <HostCard host={listing.host} />
          </div>

          <div className="border-b border-border-subtle pb-8">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-700">{listing.description}</p>
          </div>

          <div className="border-b border-border-subtle pb-8">
            <h2 className="mb-4 text-xl font-bold text-ink-900">What this place offers</h2>
            <AmenityList amenities={listing.amenities} />
          </div>

          <div className="border-b border-border-subtle pb-8">
            <h2 className="mb-4 text-xl font-bold text-ink-900">Where you&apos;ll be</h2>
            <StaticMap city={listing.city} country={listing.country} />
          </div>

          <ReviewList listingId={listing.id} ratingAvg={listing.rating_avg} reviewCount={listing.review_count} />
        </div>

        <div className="lg:col-span-1">
          <BookingWidget listing={listing} />
        </div>
      </div>
    </div>
  );
}
