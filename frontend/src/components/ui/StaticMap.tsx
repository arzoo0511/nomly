import { MapPin } from "lucide-react";

export default function StaticMap({ city, country }: { city: string; country: string }) {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border-subtle bg-ink-50">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="nomly-map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="var(--color-ink-200)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nomly-map-grid)" />
        <path
          d="M0 180 Q 150 120 300 170 T 600 150"
          fill="none"
          stroke="var(--color-brand-violet-soft)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M-20 60 Q 120 20 260 70 T 560 40"
          fill="none"
          stroke="var(--color-brand-coral-soft)"
          strokeWidth="14"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md">
          <MapPin size={20} fill="currentColor" />
        </div>
        <p className="rounded-full bg-surface/90 px-3 py-1 text-sm font-semibold text-ink-900 shadow-sm">
          {city}, {country}
        </p>
        <p className="text-xs text-ink-500">Exact location provided after booking</p>
      </div>
    </div>
  );
}
