"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Pill from "@/components/ui/Pill";
import Button from "@/components/ui/Button";
import { useAmenities } from "@/hooks/useAmenities";
import { PROPERTY_TYPE_ICONS, PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/lib/constants";
import type { PropertyType } from "@/types";

// Rendered only while open (see FilterBar), so each mount's lazy initializers
// below capture a fresh snapshot of the current URL filters -- no effect-based
// reset needed.
export default function FilterModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: amenities } = useAmenities();

  const [types, setTypes] = useState<PropertyType[]>(() => searchParams.getAll("property_type") as PropertyType[]);
  const [minPrice, setMinPrice] = useState(() => searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("max_price") ?? "");
  const [amenityIds, setAmenityIds] = useState<number[]>(() => {
    const amenitiesParam = searchParams.get("amenities");
    return amenitiesParam ? amenitiesParam.split(",").map(Number) : [];
  });

  const toggleType = (type: PropertyType) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const toggleAmenity = (id: number) => {
    setAmenityIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleClear = () => {
    setTypes([]);
    setMinPrice("");
    setMaxPrice("");
    setAmenityIds([]);
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("property_type");
    types.forEach((t) => params.append("property_type", t));
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    if (amenityIds.length) params.set("amenities", amenityIds.join(","));
    else params.delete("amenities");
    params.delete("page");
    router.push(`/?${params.toString()}`);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Filters" size="md">
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="mb-3 text-base font-bold text-ink-900">Price range per night</h3>
          <div className="flex items-center gap-3">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 px-3 py-2">
              <span className="text-xs text-ink-500">Min</span>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="$0"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <span className="text-ink-400">–</span>
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 px-3 py-2">
              <span className="text-xs text-ink-500">Max</span>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-base font-bold text-ink-900">Property type</h3>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => {
              const Icon = PROPERTY_TYPE_ICONS[type];
              return (
                <Pill key={type} active={types.includes(type)} icon={<Icon size={15} />} onClick={() => toggleType(type)}>
                  {PROPERTY_TYPE_LABELS[type]}
                </Pill>
              );
            })}
          </div>
        </section>

        {amenities && amenities.length > 0 && (
          <section>
            <h3 className="mb-3 text-base font-bold text-ink-900">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm has-[:checked]:border-ink-900"
                >
                  <input
                    type="checkbox"
                    checked={amenityIds.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="accent-[var(--color-brand-violet)]"
                  />
                  {amenity.name}
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          <button type="button" onClick={handleClear} className="text-sm font-semibold text-ink-700 underline cursor-pointer">
            Clear all
          </button>
          <Button onClick={handleApply}>Show results</Button>
        </div>
      </div>
    </Modal>
  );
}
