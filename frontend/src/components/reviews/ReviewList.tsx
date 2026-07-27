"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import ReviewCard from "@/components/reviews/ReviewCard";
import Button from "@/components/ui/Button";
import { useListingReviews } from "@/hooks/useReviews";

export default function ReviewList({
  listingId,
  ratingAvg,
  reviewCount,
}: {
  listingId: number;
  ratingAvg: number | null;
  reviewCount: number;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListingReviews(listingId, page);

  if (reviewCount === 0) {
    return (
      <div>
        <h2 className="mb-2 text-xl font-bold text-ink-900">Reviews</h2>
        <p className="text-sm text-ink-500">No reviews yet for this stay.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-ink-900">
        <Star size={18} className="fill-ink-900 text-ink-900" />
        {ratingAvg?.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
      </h2>

      {isLoading ? (
        <p className="text-sm text-ink-500">Loading reviews...</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {data?.items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {data && data.total_pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
          )}
          {page < data.total_pages && (
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              Show more reviews
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
