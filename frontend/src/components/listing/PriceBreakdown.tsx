import { formatPrice } from "@/lib/utils";

export default function PriceBreakdown({
  nights,
  pricePerNight,
  cleaningFee,
  serviceFee,
  total,
}: {
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 font-tabular text-[15px] text-ink-800">
      <div className="flex items-center justify-between">
        <span className="underline decoration-ink-300 underline-offset-2">
          {formatPrice(pricePerNight, true)} x {nights} night{nights === 1 ? "" : "s"}
        </span>
        <span>{formatPrice(pricePerNight * nights, true)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="underline decoration-ink-300 underline-offset-2">Cleaning fee</span>
        <span>{formatPrice(cleaningFee, true)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="underline decoration-ink-300 underline-offset-2">Nomly service fee</span>
        <span>{formatPrice(serviceFee, true)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-border-subtle pt-3 text-base font-bold text-ink-900">
        <span>Total</span>
        <span>{formatPrice(total, true)}</span>
      </div>
    </div>
  );
}
