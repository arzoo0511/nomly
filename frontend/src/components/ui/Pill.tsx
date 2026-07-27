import { cn } from "@/lib/utils";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

export default function Pill({ active, icon, className, children, ...props }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
        active
          ? "border-ink-900 bg-ink-900 text-white"
          : "border-ink-300 bg-surface text-ink-900 hover:border-ink-900",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
