import { Suspense } from "react";
import HomeContent from "@/components/home/HomeContent";
import { ListingCardSkeleton } from "@/components/ui/Skeleton";

function HomeFallback() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8">
      <div className="mb-8 h-16 w-full max-w-3xl mx-auto animate-pulse rounded-full bg-ink-100" />
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
