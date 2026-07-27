"use client";

import { useState } from "react";
import Link from "next/link";
import { Home as HomeIcon, Plus } from "lucide-react";
import HostListingCard from "@/components/host/HostListingCard";
import HostBookingsTable from "@/components/host/HostBookingsTable";
import Skeleton from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import TravelIllustration from "@/components/ui/TravelIllustration";
import { cn } from "@/lib/utils";
import { useMyListings } from "@/hooks/useHostListings";
import { useHostBookings } from "@/hooks/useBookings";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function HostDashboardPage() {
  const { isChecking } = useRequireAuth();
  const [tab, setTab] = useState<"listings" | "reservations">("listings");
  const { data: listings, isLoading: listingsLoading, isError: listingsError, refetch: refetchListings } = useMyListings();
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError, refetch: refetchBookings } = useHostBookings();

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink-900">Host dashboard</h1>
        <Link href="/host/listings/new" className={buttonClasses("primary", "sm")}>
          <Plus size={16} /> Create a listing
        </Link>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border-subtle">
        {(
          [
            { key: "listings", label: "My listings" },
            { key: "reservations", label: "Reservations" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-semibold cursor-pointer",
              tab === t.key ? "border-brand-violet text-brand-violet" : "border-transparent text-ink-500 hover:text-ink-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "listings" &&
        (listingsLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : listingsError ? (
          <ErrorState onRetry={() => refetchListings()} />
        ) : listings && listings.length > 0 ? (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <HostListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState />
        ))}

      {tab === "reservations" &&
        (bookingsLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : bookingsError ? (
          <ErrorState onRetry={() => refetchBookings()} />
        ) : (
          <HostBookingsTable bookings={bookings ?? []} />
        ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <TravelIllustration icon={HomeIcon} />
      <p className="text-lg font-semibold text-ink-900">You don&apos;t have any listings yet</p>
      <p className="max-w-sm text-sm text-ink-500">Create your first listing to start hosting guests on Nomly.</p>
      <Link href="/host/listings/new" className={buttonClasses("primary", "sm")}>
        Create a listing
      </Link>
    </div>
  );
}
