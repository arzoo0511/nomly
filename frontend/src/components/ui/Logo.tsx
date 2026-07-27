import { cn } from "@/lib/utils";

export default function Logo({
  className,
  iconOnly = false,
  onDark = false,
}: {
  className?: string;
  iconOnly?: boolean;
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="nomly-glyph-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF6B5B" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 2.5L30 13v16.5H2V13L16 2.5ZM16 15.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
          fill="url(#nomly-glyph-gradient)"
        />
      </svg>
      {!iconOnly && (
        <span className={cn("text-xl font-extrabold tracking-tight", onDark ? "text-white" : "text-ink-900")}>
          nomly
        </span>
      )}
    </span>
  );
}
