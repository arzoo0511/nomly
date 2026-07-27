"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Search, MapPin } from "lucide-react";
import DateRangePicker from "@/components/search/DateRangePicker";
import GuestPicker from "@/components/search/GuestPicker";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatDate, parseDateOnly, toISODate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Section = "where" | "dates" | "guests" | null;

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [active, setActive] = useState<Section>(null);
  const [location, setLocation] = useState(searchParams.get("q") ?? "");
  const [guests, setGuests] = useState(Number(searchParams.get("guests") ?? 1));
  const initialCheckIn = searchParams.get("check_in");
  const initialCheckOut = searchParams.get("check_out");
  const [range, setRange] = useState<DateRange | undefined>(
    initialCheckIn && initialCheckOut
      ? { from: parseDateOnly(initialCheckIn), to: parseDateOnly(initialCheckOut) }
      : undefined
  );

  const containerRef = useClickOutside<HTMLDivElement>(() => setActive(null), active !== null);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (location.trim()) params.set("q", location.trim());
    else params.delete("q");
    if (range?.from && range?.to) {
      params.set("check_in", toISODate(range.from));
      params.set("check_out", toISODate(range.to));
    } else {
      params.delete("check_in");
      params.delete("check_out");
    }
    if (guests > 1) params.set("guests", String(guests));
    else params.delete("guests");
    params.delete("page");
    setActive(null);
    router.push(`/?${params.toString()}`);
  };

  const dateLabel =
    range?.from && range?.to ? `${formatDate(toISODate(range.from))} - ${formatDate(toISODate(range.to))}` : "Any week";

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-3xl">
      <div className="flex flex-col divide-y divide-border-subtle rounded-3xl border border-ink-200 bg-surface shadow-md md:flex-row md:items-center md:divide-y-0 md:divide-x md:rounded-full">
        <button
          type="button"
          onClick={() => setActive(active === "where" ? null : "where")}
          className={cn(
            "flex flex-1 flex-col gap-0.5 rounded-full px-6 py-3 text-left cursor-pointer",
            active === "where" && "bg-ink-100"
          )}
        >
          <span className="text-xs font-bold text-ink-900">Where</span>
          <span className="truncate text-sm text-ink-500">{location || "Search destinations"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActive(active === "dates" ? null : "dates")}
          className={cn(
            "flex flex-1 flex-col gap-0.5 px-6 py-3 text-left cursor-pointer",
            active === "dates" && "bg-ink-100"
          )}
        >
          <span className="text-xs font-bold text-ink-900">When</span>
          <span className="truncate text-sm text-ink-500">{dateLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => setActive(active === "guests" ? null : "guests")}
          className={cn(
            "flex flex-1 items-center justify-between gap-2 rounded-full px-6 py-3 text-left cursor-pointer",
            active === "guests" && "bg-ink-100"
          )}
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-ink-900">Who</span>
            <span className="truncate text-sm text-ink-500">
              {guests} guest{guests === 1 ? "" : "s"}
            </span>
          </span>
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            aria-label="Search"
            className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white cursor-pointer"
          >
            <Search size={18} />
          </span>
        </button>
      </div>

      {active && (
        <div className="absolute left-1/2 top-full z-30 mt-3 w-[min(92vw,420px)] -translate-x-1/2 rounded-3xl border border-border-subtle bg-surface p-5 shadow-2xl md:w-auto">
          {active === "where" && (
            <div className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2">
              <MapPin size={16} className="text-ink-500" />
              <input
                autoFocus
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search by city, e.g. Austin"
                className="w-full min-w-[220px] bg-transparent text-sm outline-none placeholder:text-ink-400"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          )}
          {active === "dates" && (
            <div className="overflow-x-auto">
              <DateRangePicker selected={range} onSelect={setRange} />
            </div>
          )}
          {active === "guests" && (
            <div className="w-72">
              <GuestPicker
                value={guests}
                onChange={setGuests}
                max={16}
                label="Guests"
                description="Ages 13 or above"
              />
            </div>
          )}
          <div className="mt-3 flex justify-end border-t border-border-subtle pt-3">
            <button
              type="button"
              onClick={handleSearch}
              className="brand-gradient flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
