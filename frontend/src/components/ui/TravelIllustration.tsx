import type { LucideIcon } from "lucide-react";

// A small bespoke scene (dashed flight path + two tilted polaroids + a gradient
// blob backdrop) reused across empty/404/coming-soon states, with a swappable
// glyph badge -- deliberately not just "icon inside a gray circle".
export default function TravelIllustration({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="relative h-40 w-60">
      <svg viewBox="0 0 240 180" className="h-full w-full" aria-hidden="true">
        <circle cx="55" cy="45" r="48" className="fill-brand-coral-soft" opacity="0.7" />
        <circle cx="190" cy="130" r="55" className="fill-brand-violet-soft" opacity="0.7" />

        <path
          d="M18 150 Q 90 55 120 100 T 224 36"
          fill="none"
          stroke="var(--color-ink-300)"
          strokeWidth="2"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
        <circle cx="18" cy="150" r="4" className="fill-brand-coral" />
        <circle cx="224" cy="36" r="4" className="fill-brand-violet" />

        <g transform="rotate(-8 75 95)">
          <rect x="45" y="62" width="60" height="70" rx="5" fill="var(--color-surface)" stroke="var(--color-ink-200)" strokeWidth="2" />
          <rect x="51" y="68" width="48" height="42" rx="3" fill="var(--color-ink-100)" />
        </g>
        <g transform="rotate(7 160 78)">
          <rect x="128" y="44" width="60" height="70" rx="5" fill="var(--color-surface)" stroke="var(--color-ink-200)" strokeWidth="2" />
          <rect
            x="134"
            y="50"
            width="48"
            height="42"
            rx="3"
            className="fill-brand-coral-soft"
          />
        </g>

        <circle cx="120" cy="152" r="26" fill="url(#travel-illustration-gradient)" />
        <defs>
          <linearGradient id="travel-illustration-gradient" x1="0" y1="0" x2="240" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF6B5B" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="absolute flex items-center justify-center rounded-full text-white"
        style={{ left: "50%", top: "84.4%", width: "21.7%", aspectRatio: "1 / 1", transform: "translate(-50%, -50%)" }}
      >
        <Icon size={22} />
      </div>
    </div>
  );
}
