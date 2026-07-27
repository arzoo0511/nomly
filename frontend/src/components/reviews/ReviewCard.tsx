import Avatar from "@/components/ui/Avatar";
import { RatingStarsDisplay } from "@/components/reviews/RatingStars";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/types";

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar seed={review.author.avatar_seed} name={review.author.full_name} size={44} />
        <div>
          <p className="text-sm font-semibold text-ink-900">{review.author.full_name}</p>
          <p className="text-xs text-ink-500">{formatDate(review.created_at.slice(0, 10), true)}</p>
        </div>
      </div>
      <RatingStarsDisplay rating={review.rating} />
      <p className="text-sm leading-relaxed text-ink-700">{review.comment}</p>
    </div>
  );
}
