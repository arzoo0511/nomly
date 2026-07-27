"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Star } from "lucide-react";
import { toast } from "sonner";
import DateRangePicker from "@/components/search/DateRangePicker";
import GuestPicker from "@/components/search/GuestPicker";
import PriceBreakdown from "@/components/listing/PriceBreakdown";
import Button from "@/components/ui/Button";
import BookingSummaryModal from "@/components/booking/BookingSummaryModal";
import { useAuth } from "@/context/AuthContext";
import { useUnavailableDates } from "@/hooks/useListing";
import { SERVICE_FEE_RATE } from "@/lib/constants";
import { formatPrice, nightsBetween, toISODate } from "@/lib/utils";
import type { ListingDetail } from "@/types";

export default function BookingWidget({ listing }: { listing: ListingDetail }) {
  const { user } = useAuth();
  const router = useRouter();
  const { data: unavailableRanges } = useUnavailableDates(listing.id);

  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const isOwner = user?.id === listing.host.id;
  const nights = range?.from && range?.to ? nightsBetween(range.from, range.to) : 0;
  const canReserve = Boolean(range?.from && range?.to && nights > 0 && !isOwner);

  const pricing = useMemo(() => {
    const subtotal = listing.price_per_night * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + listing.cleaning_fee + serviceFee) * 100) / 100;
    return { serviceFee, total };
  }, [listing.price_per_night, listing.cleaning_fee, nights]);

  const handleReserveClick = () => {
    if (!user) {
      toast("Log in to book this stay");
      router.push(`/login?redirect=${encodeURIComponent(`/listings/${listing.id}`)}`);
      return;
    }
    if (!canReserve) {
      toast.error("Select your trip dates first");
      return;
    }
    setSummaryOpen(true);
  };

  return (
    <div className="sticky top-24 rounded-2xl border border-border-subtle p-6 shadow-lg">
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-xl font-bold text-ink-900">
          {formatPrice(listing.price_per_night, true)} <span className="text-sm font-normal text-ink-500">night</span>
        </p>
        {listing.rating_avg !== null && (
          <span className="flex items-center gap-1 text-sm text-ink-700">
            <Star size={13} className="fill-brand-coral text-brand-coral" />
            {listing.rating_avg.toFixed(1)} · {listing.review_count} review{listing.review_count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-300">
        <button
          type="button"
          onClick={() => setCalendarOpen((v) => !v)}
          className="grid w-full grid-cols-2 divide-x divide-ink-300 text-left cursor-pointer"
        >
          <span className="px-3 py-2">
            <span className="block text-[10px] font-bold uppercase text-ink-700">Check-in</span>
            <span className="text-sm text-ink-900">{range?.from ? toISODate(range.from) : "Add date"}</span>
          </span>
          <span className="px-3 py-2">
            <span className="block text-[10px] font-bold uppercase text-ink-700">Check-out</span>
            <span className="text-sm text-ink-900">{range?.to ? toISODate(range.to) : "Add date"}</span>
          </span>
        </button>
        <div className="border-t border-ink-300 px-3">
          <GuestPicker value={guests} onChange={setGuests} max={listing.max_guests} label="Guests" />
        </div>
      </div>

      {calendarOpen && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-border-subtle p-2">
          <DateRangePicker selected={range} onSelect={setRange} unavailableRanges={unavailableRanges ?? []} />
        </div>
      )}

      {isOwner ? (
        <p className="mt-4 rounded-xl bg-ink-100 px-4 py-3 text-center text-sm text-ink-600">
          This is your own listing, so it can&apos;t be booked from this account.
        </p>
      ) : (
        <Button onClick={handleReserveClick} className="mt-4 w-full" size="lg" disabled={!canReserve && Boolean(user)}>
          Reserve
        </Button>
      )}

      {!isOwner && <p className="mt-3 text-center text-xs text-ink-500">You won&apos;t be charged yet</p>}

      {nights > 0 && !isOwner && (
        <div className="mt-5">
          <PriceBreakdown
            nights={nights}
            pricePerNight={listing.price_per_night}
            cleaningFee={listing.cleaning_fee}
            serviceFee={pricing.serviceFee}
            total={pricing.total}
          />
        </div>
      )}

      {range?.from && range?.to && (
        <BookingSummaryModal
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          listing={listing}
          checkIn={range.from}
          checkOut={range.to}
          guests={guests}
        />
      )}
    </div>
  );
}
