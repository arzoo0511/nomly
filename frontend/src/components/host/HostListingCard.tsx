"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, ImageOff, Pencil, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useDeleteListing } from "@/hooks/useHostListings";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { HostListing } from "@/types";

export default function HostListingCard({ listing }: { listing: HostListing }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteListing = useDeleteListing();

  const handleDelete = () => {
    deleteListing.mutate(listing.id, {
      onSuccess: () => {
        toast.success("Listing unlisted");
        setConfirmOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Couldn't delete this listing.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle p-4 sm:flex-row sm:items-center">
      <Link href={`/listings/${listing.id}`} className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-24 sm:w-32">
        {listing.cover_image ? (
          <Image src={listing.cover_image} alt={listing.title} fill sizes="150px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <ImageOff size={24} />
          </div>
        )}
      </Link>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink-900">{listing.title}</p>
          {!listing.is_active && <Badge tone="neutral">Unlisted</Badge>}
        </div>
        <p className="text-sm text-ink-500">
          {listing.city}, {listing.country} · {formatPrice(listing.price_per_night)}/night
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
          <CalendarDays size={14} />
          {listing.upcoming_bookings_count} upcoming · {listing.total_bookings_count} total booking
          {listing.total_bookings_count === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Link href={`/host/listings/${listing.id}/edit`} className="rounded-full border border-ink-300 p-2.5 text-ink-700 hover:bg-ink-100">
          <Pencil size={16} />
        </Link>
        {listing.is_active && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-full border border-ink-300 p-2.5 text-ink-700 hover:bg-ink-100 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Unlist this listing?" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-700">
            {listing.upcoming_bookings_count > 0
              ? `This listing has ${listing.upcoming_bookings_count} upcoming reservation${listing.upcoming_bookings_count === 1 ? "" : "s"}. Unlisting hides it from search, but existing bookings stay valid and visible to guests and in your reservations.`
              : "This will hide the listing from search. You can't permanently delete a listing that has booking history, so it's unlisted rather than removed."}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteListing.isPending}>
              Unlist
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
