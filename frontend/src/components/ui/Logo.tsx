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
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 2.5L30 13v16.5H2V13L16 2.5ZM16 15.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
          fill="var(--color-brand-coral)"
        />
      </svg>
      {!iconOnly && (
        <span className={cn("text-xl font-extrabold tracking-tight", onDark ? "text-white" : "text-brand-coral")}>
          nomly
        </span>
      )}
    </span>
  );
}
