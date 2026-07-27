"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ReviewForm from "@/components/reviews/ReviewForm";
import { useCancelBooking } from "@/hooks/useBookings";
import { ApiError } from "@/lib/api";
import { formatDateRange, formatPrice } from "@/lib/utils";
import type { Booking } from "@/types";

export default function TripCard({ booking }: { booking: Booking }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const cancelBooking = useCancelBooking();

  const handleCancel = () => {
    cancelBooking.mutate(booking.id, {
      onSuccess: () => {
        toast.success("Trip cancelled");
        setCancelOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Couldn't cancel this trip.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle p-4 sm:flex-row sm:items-center">
      <Link
        href={`/listings/${booking.listing.id}`}
        className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-24 sm:w-32"
      >
        {booking.listing.cover_image ? (
          <Image src={booking.listing.cover_image} alt={booking.listing.title} fill sizes="150px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <ImageOff size={24} />
          </div>
        )}
      </Link>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink-900">{booking.listing.title}</p>
          <Badge tone={booking.status === "confirmed" ? "success" : "neutral"}>{booking.status}</Badge>
        </div>
        <p className="text-sm text-ink-500">
          {booking.listing.city}, {booking.listing.country}
        </p>
        <p className="mt-1 text-sm text-ink-700">{formatDateRange(booking.check_in, booking.check_out)}</p>
        <p className="text-sm text-ink-700">
          {booking.num_guests} guest{booking.num_guests === 1 ? "" : "s"} ·{" "}
          <span className="font-tabular font-semibold">{formatPrice(booking.total_price, true)}</span>
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        {booking.can_review && (
          <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
            Write a review
          </Button>
        )}
        {booking.can_cancel && (
          <Button variant="ghost" size="sm" onClick={() => setCancelOpen(true)}>
            Cancel
          </Button>
        )}
      </div>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel this trip?" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-700">
            {`This will cancel your reservation at ${booking.listing.title} and free up those dates. This can't be undone.`}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep reservation
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={cancelBooking.isPending}>
              Cancel trip
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={`Review ${booking.listing.title}`} size="md">
        <ReviewForm bookingId={booking.id} onDone={() => setReviewOpen(false)} />
      </Modal>
    </div>
  );
}
