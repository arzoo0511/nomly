"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import SearchBar from "@/components/search/SearchBar";
import { api } from "@/lib/api";

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
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-border-subtle bg-surface-muted px-6 py-14 sm:py-16">
      <div className="brand-blob brand-blob-coral -top-16 -left-16 h-56 w-56" />
      <div className="brand-blob brand-blob-violet -right-10 top-6 h-64 w-64" />
      <div className="brand-dot-grid absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-brand-violet shadow-sm">
          <Sparkles size={13} /> Wander further, worry less
        </span>
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
          Find your next <span className="brand-gradient-text">favorite</span> place to stay
        </h1>
        <p className="max-w-md text-[15px] text-ink-600">
          Unique homes, boutique stays, and one-of-a-kind escapes across a dozen destinations worldwide.
        </p>

        <div className="mt-2 w-full">
          <SearchBar />
        </div>

        <button
          type="button"
          onClick={handleSurpriseMe}
          disabled={isShuffling}
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-violet underline decoration-brand-violet/40 underline-offset-4 hover:decoration-brand-violet disabled:opacity-60 cursor-pointer"
        >
          <Shuffle size={14} className={isShuffling ? "animate-spin" : ""} />
          {isShuffling ? "Picking something good..." : "Feeling spontaneous? Surprise me"}
        </button>

        <div className="mt-2 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <Stat value="32+" label="unique stays" />
          <Stat value="12" label="destinations" />
          <Stat value="4.6★" label="avg. rating" />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-tabular text-lg font-extrabold text-ink-900">{value}</span>
      <span className="text-xs text-ink-500">{label}</span>
    </div>
  );
}
