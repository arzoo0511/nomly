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
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer",
        active
          ? "brand-gradient border-transparent text-white shadow-sm"
          : "border-ink-200 bg-surface text-ink-700 hover:border-brand-violet hover:text-brand-violet",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
