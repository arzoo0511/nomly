"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RatingStarsInput } from "@/components/reviews/RatingStars";
import Button from "@/components/ui/Button";
import { useCreateReview } from "@/hooks/useReviews";
import { ApiError } from "@/lib/api";

export default function ReviewForm({ bookingId, onDone }: { bookingId: number; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length === 0) {
      toast.error("Please share a few words about your stay.");
      return;
    }
    createReview.mutate(
      { booking_id: bookingId, rating, comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success("Thanks for your review!");
          onDone();
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Couldn't submit your review.");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-900">Overall rating</p>
        <RatingStarsInput value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-ink-900">Your review</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="How was your stay? What stood out?"
          className="w-full resize-none rounded-2xl border border-ink-200 p-3 text-sm outline-none focus:border-ink-900"
        />
      </div>
      <Button type="submit" isLoading={createReview.isPending} className="self-end">
        Submit review
      </Button>
    </form>
  );
}
