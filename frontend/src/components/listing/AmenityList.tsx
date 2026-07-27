import { Sparkles } from "lucide-react";
import { AMENITY_ICON_MAP } from "@/lib/constants";
import type { Amenity } from "@/types";

export default function AmenityList({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {amenities.map((amenity) => {
        const Icon = AMENITY_ICON_MAP[amenity.icon_key] ?? Sparkles;
        return (
          <div key={amenity.id} className="flex items-center gap-3 text-ink-800">
            <Icon size={22} className="text-ink-600" />
            <span className="text-[15px]">{amenity.name}</span>
          </div>
        );
      })}
    </div>
  );
}
