"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStarsDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "fill-ink-900 text-ink-900" : "fill-ink-200 text-ink-200"}
        />
      ))}
    </div>
  );
}

export function RatingStarsInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
            className="cursor-pointer p-0.5"
          >
            <Star
              size={28}
              className={cn(starValue <= value ? "fill-ink-900 text-ink-900" : "fill-ink-200 text-ink-200")}
            />
          </button>
        );
      })}
    </div>
  );
}
