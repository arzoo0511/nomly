"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import Link from "next/link";
import TripCard from "@/components/booking/TripCard";
import Skeleton from "@/components/ui/Skeleton";
import { buttonClasses } from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import TravelIllustration from "@/components/ui/TravelIllustration";
import { cn } from "@/lib/utils";
import { useMyBookings, type TripScope } from "@/hooks/useBookings";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function TripsPage() {
  const { isChecking } = useRequireAuth();
  const [tab, setTab] = useState<Exclude<TripScope, "all">>("upcoming");
  const { data: bookings, isLoading, isError, refetch } = useMyBookings(tab);

  if (isChecking) return null;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">My trips</h1>

      <div className="mb-6 flex gap-2 border-b border-border-subtle">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-semibold capitalize cursor-pointer",
              tab === t ? "border-brand-violet text-brand-violet" : "border-transparent text-ink-500 hover:text-ink-900"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : bookings && bookings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <TripCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <TravelIllustration icon={Compass} />
          <p className="text-lg font-semibold text-ink-900">
            No {tab} trips {tab === "upcoming" ? "yet" : ""}
          </p>
          <p className="max-w-sm text-sm text-ink-500">Time to dust off your bags and start planning your next stay.</p>
          <Link href="/" className={buttonClasses("primary", "sm")}>
            Start exploring
          </Link>
        </div>
      )}
    </div>
  );
}
