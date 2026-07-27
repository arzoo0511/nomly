"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import Hero from "@/components/home/Hero";
import FilterBar from "@/components/search/FilterBar";
import ListingGrid from "@/components/listing/ListingGrid";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "@/components/ui/Skeleton";
import { useListings } from "@/hooks/useListings";
import { cn } from "@/lib/utils";
import type { PropertyType } from "@/types";

// Leaflet touches `window` at import time, so the map must never be part of
// the server-rendered bundle.
const ListingsMap = dynamic(() => import("@/components/map/ListingsMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[65vh] min-h-[420px] w-full" />,
});

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<"list" | "map">("list");

  const page = Number(searchParams.get("page") ?? 1);
  const amenitiesParam = searchParams.get("amenities");
  const guestsParam = searchParams.get("guests");
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");

  const { data, isLoading, isError, refetch } = useListings({
    q: searchParams.get("q") ?? undefined,
    check_in: searchParams.get("check_in") ?? undefined,
    check_out: searchParams.get("check_out") ?? undefined,
    guests: guestsParam ? Number(guestsParam) : undefined,
    min_price: minPriceParam ? Number(minPriceParam) : undefined,
    max_price: maxPriceParam ? Number(maxPriceParam) : undefined,
    property_type: searchParams.getAll("property_type") as PropertyType[],
    amenities: amenitiesParam ? amenitiesParam.split(",").map(Number) : undefined,
    sort: searchParams.get("sort") ?? undefined,
    page,
    page_size: 12,
  });

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(p));
    router.push(`/?${next.toString()}`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
      <Hero />
      <div className="mb-6 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <FilterBar />
        </div>
        <div className="flex shrink-0 rounded-full border border-ink-300 p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
              view === "list" ? "brand-gradient text-white" : "text-ink-600 hover:text-ink-900"
            )}
          >
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
              view === "map" ? "brand-gradient text-white" : "text-ink-600 hover:text-ink-900"
            )}
          >
            <MapIcon size={14} />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {view === "list" ? (
        <>
          <ListingGrid
            listings={data?.items}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyAction={{ label: "Clear all filters", onClick: () => router.push("/") }}
          />
          {data && data.total_pages > 1 && (
            <Pagination page={data.page} totalPages={data.total_pages} onChange={goToPage} />
          )}
        </>
      ) : isLoading ? (
        <Skeleton className="h-[65vh] min-h-[420px] w-full" />
      ) : (
        <>
          <ListingsMap listings={data?.items ?? []} />
          <p className="mt-3 text-center text-xs text-ink-500">
            {`Showing pins for this page's results (${data?.items.length ?? 0} of ${data?.total ?? 0}) -- switch pages in List view to see more.`}
          </p>
        </>
      )}
    </div>
  );
}
