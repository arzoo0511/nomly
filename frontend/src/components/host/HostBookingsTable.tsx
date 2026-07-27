import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { formatDateRange, formatPrice } from "@/lib/utils";
import type { Booking } from "@/types";

export default function HostBookingsTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <p className="py-12 text-center text-sm text-ink-500">No reservations yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-border-subtle">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex flex-wrap items-center gap-4 py-4">
          <Avatar seed={booking.guest.avatar_seed} name={booking.guest.full_name} size={40} />
          <div className="min-w-[160px] flex-1">
            <p className="text-sm font-semibold text-ink-900">{booking.guest.full_name}</p>
            <p className="text-xs text-ink-500">{booking.listing.title}</p>
          </div>
          <div className="min-w-[160px] text-sm text-ink-700">
            {formatDateRange(booking.check_in, booking.check_out)}
          </div>
          <div className="text-sm text-ink-700">
            {booking.num_guests} guest{booking.num_guests === 1 ? "" : "s"}
          </div>
          <div className="font-tabular text-sm font-semibold text-ink-900">{formatPrice(booking.total_price, true)}</div>
          <Badge tone={booking.status === "confirmed" ? "success" : "neutral"}>{booking.status}</Badge>
        </div>
      ))}
    </div>
  );
}
