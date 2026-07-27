import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "brand-gradient text-white shadow-sm hover:brightness-105 active:brightness-95 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-700 disabled:opacity-50 disabled:pointer-events-none",
  outline:
    "bg-transparent border border-ink-300 text-ink-900 hover:border-ink-900 disabled:opacity-50 disabled:pointer-events-none",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 disabled:opacity-40 disabled:pointer-events-none",
  danger: "bg-error text-white hover:brightness-95 disabled:opacity-50 disabled:pointer-events-none",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-sm px-4 py-2 gap-1.5",
  md: "text-sm px-5 py-2.5 gap-2",
  lg: "text-base px-6 py-3.5 gap-2",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonClasses(variant, size, className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
