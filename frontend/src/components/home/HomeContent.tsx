"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/home/Hero";
import FilterBar from "@/components/search/FilterBar";
import ListingGrid from "@/components/listing/ListingGrid";
import Pagination from "@/components/ui/Pagination";
import { useListings } from "@/hooks/useListings";
import type { PropertyType } from "@/types";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
      <div className="mb-6">
        <FilterBar />
      </div>
      <ListingGrid
        listings={data?.items}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyAction={{ label: "Clear all filters", onClick: () => router.push("/") }}
      />
      {data && data.total_pages > 1 && <Pagination page={data.page} totalPages={data.total_pages} onChange={goToPage} />}
    </div>
  );
}
