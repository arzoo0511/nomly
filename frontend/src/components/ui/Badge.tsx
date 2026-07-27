import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "success" | "error" | "warning" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  brand: "bg-brand-violet-soft text-brand-violet",
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-ink-100 text-ink-700",
};

export default function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
