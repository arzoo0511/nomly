"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { toast } from "sonner";
import SearchBar from "@/components/search/SearchBar";
import { api } from "@/lib/api";

// Airbnb's actual explore page has no marketing hero -- the search bar sits
// directly in/under the nav and the listing grid starts almost immediately.
// This mirrors that: just the search pill, plus one small optional link.
export default function Hero() {
  const router = useRouter();
  const [isShuffling, setIsShuffling] = useState(false);

  const handleSurpriseMe = async () => {
    setIsShuffling(true);
    try {
      const { id } = await api.get<{ id: number }>("/listings/random");
      router.push(`/listings/${id}`);
    } catch {
      toast.error("Couldn't find a stay to surprise you with. Try again?");
    } finally {
      setIsShuffling(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-6 sm:py-8">
      <SearchBar />
      <button
        type="button"
        onClick={handleSurpriseMe}
        disabled={isShuffling}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 underline decoration-ink-300 underline-offset-4 hover:text-ink-900 hover:decoration-ink-900 disabled:opacity-60 cursor-pointer"
      >
        <Shuffle size={13} className={isShuffling ? "animate-spin" : ""} />
        {isShuffling ? "Picking something good..." : "Feeling spontaneous? Surprise me"}
      </button>
    </div>
  );
}
