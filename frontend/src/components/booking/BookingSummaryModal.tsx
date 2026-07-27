"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, ImageOff } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfettiBurst from "@/components/ui/ConfettiBurst";
import PriceBreakdown from "@/components/listing/PriceBreakdown";
import { useCreateBooking } from "@/hooks/useBookings";
import { ApiError } from "@/lib/api";
import { SERVICE_FEE_RATE } from "@/lib/constants";
import { formatDateRange, nightsBetween, toISODate } from "@/lib/utils";
import type { ListingDetail } from "@/types";

export default function BookingSummaryModal({
  open,
  onClose,
  listing,
  checkIn,
  checkOut,
  guests,
}: {
  open: boolean;
  onClose: () => void;
  listing: ListingDetail;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}) {
  const router = useRouter();
  const createBooking = useCreateBooking();
  const [confirmed, setConfirmed] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const pricing = useMemo(() => {
    const subtotal = listing.price_per_night * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + listing.cleaning_fee + serviceFee) * 100) / 100;
    return { serviceFee, total };
  }, [listing.price_per_night, listing.cleaning_fee, nights]);

  const handleConfirm = () => {
    createBooking.mutate(
      {
        listing_id: listing.id,
        check_in: toISODate(checkIn),
        check_out: toISODate(checkOut),
        num_guests: guests,
      },
      {
        onSuccess: () => {
          setConfirmed(true);
          setTimeout(() => {
            setConfirmed(false);
            onClose();
            router.push("/trips");
          }, 1100);
        },
        onError: (err) => {
          onClose();
          toast.error(err instanceof ApiError ? err.message : "Couldn't complete this booking.");
        },
      }
    );
  };

  return (
    <>
      <ConfettiBurst show={confirmed} />
      <Modal open={open} onClose={onClose} title={confirmed ? "You're booked!" : "Confirm and pay"} size="md">
        {confirmed ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="brand-gradient flex h-16 w-16 items-center justify-center rounded-full text-white">
              <CheckCircle2 size={30} />
            </div>
            <p className="text-lg font-bold text-ink-900">{`${listing.title} is all yours`}</p>
            <p className="text-sm text-ink-500">Taking you to My Trips...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-2xl border border-border-subtle p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100">
                {listing.images[0] ? (
                  <Image src={listing.images[0]} alt={listing.title} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-400">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{listing.title}</p>
                <p className="text-xs text-ink-500">
                  {listing.city}, {listing.country}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-900">Trip details</p>
              <p className="text-sm text-ink-600">{formatDateRange(toISODate(checkIn), toISODate(checkOut))}</p>
              <p className="text-sm text-ink-600">
                {guests} guest{guests === 1 ? "" : "s"}
              </p>
            </div>

            <PriceBreakdown
              nights={nights}
              pricePerNight={listing.price_per_night}
              cleaningFee={listing.cleaning_fee}
              serviceFee={pricing.serviceFee}
              total={pricing.total}
            />

            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-4">
              <CreditCard size={20} className="shrink-0 text-ink-500" />
              <p className="text-xs text-ink-500">
                Payment is simulated for this demo — no real charge occurs and no card details are collected.
              </p>
            </div>

            <Button onClick={handleConfirm} isLoading={createBooking.isPending} size="lg" className="w-full">
              Confirm reservation
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
