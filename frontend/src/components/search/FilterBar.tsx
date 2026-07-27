"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import FilterModal from "@/components/search/FilterModal";
import { PROPERTY_TYPE_ICONS, PROPERTY_TYPE_LABELS, PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PropertyType } from "@/types";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const selectedTypes = searchParams.getAll("property_type") as PropertyType[];
  const sort = searchParams.get("sort") ?? "newest";
  const activeFilterCount =
    selectedTypes.length +
    (searchParams.get("min_price") ? 1 : 0) +
    (searchParams.get("max_price") ? 1 : 0) +
    (searchParams.get("amenities") ? searchParams.get("amenities")!.split(",").length : 0);

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const toggleType = (type: PropertyType) => {
    pushParams((params) => {
      const current = new Set(params.getAll("property_type"));
      if (current.has(type)) current.delete(type);
      else current.add(type);
      params.delete("property_type");
      current.forEach((t) => params.append("property_type", t));
    });
  };

  return (
    <div className="flex items-center gap-4 border-b border-border-subtle">
      <div
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-7 overflow-x-auto"
        style={{ maskImage: "linear-gradient(90deg, black 92%, transparent 100%)" }}
      >
        {PROPERTY_TYPES.map((type) => {
          const Icon = PROPERTY_TYPE_ICONS[type];
          const isActive = selectedTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-2 border-b-2 pb-3 pt-3 text-xs font-medium transition-colors cursor-pointer",
                isActive
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-ink-500 hover:border-ink-200 hover:text-ink-800"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.25 : 1.6} />
              {PROPERTY_TYPE_LABELS[type]}
            </button>
          );
        })}
      </div>

      <select
        value={sort}
        onChange={(e) => pushParams((params) => params.set("sort", e.target.value))}
        className="mb-3 hidden shrink-0 cursor-pointer rounded-full border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 sm:block"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mb-3 flex shrink-0 items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 transition-shadow hover:shadow-md cursor-pointer"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {modalOpen && <FilterModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
