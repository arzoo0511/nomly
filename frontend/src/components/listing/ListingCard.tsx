"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff, Star } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { cn, formatPrice } from "@/lib/utils";
import type { ListingCard as ListingCardType } from "@/types";

export default function ListingCard({ listing }: { listing: ListingCardType }) {
  const { user } = useAuth();
  const router = useRouter();
  const toggleFavorite = useToggleFavorite();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Log in to save favorites");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    toggleFavorite.mutate(listing.id, {
      onSuccess: (data) => {
        toast.success(data.favorited ? "Added to your wishlist" : "Removed from your wishlist");
      },
      onError: () => toast.error("Something went wrong. Please try again."),
    });
  };

  return (
    <Link href={`/listings/${listing.id}`} className="group flex flex-col gap-2">
      <div className="card-hover relative aspect-square w-full overflow-hidden rounded-xl bg-ink-100">
        {listing.cover_image ? (
          <Image
            src={listing.cover_image}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-400">
            <ImageOff size={32} />
          </div>
        )}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={listing.is_favorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 rounded-full p-1.5 transition-transform hover:scale-110 cursor-pointer"
        >
          <Heart
            size={22}
            className={cn(
              "drop-shadow-sm",
              listing.is_favorited ? "fill-brand-coral text-brand-coral" : "fill-ink-900/40 text-white"
            )}
          />
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[15px] font-medium text-ink-900">
            {listing.city}, {listing.region ?? listing.country}
          </p>
          {listing.rating_avg !== null && (
            <span className="flex shrink-0 items-center gap-1 text-sm text-ink-900">
              <Star size={13} className="fill-ink-900 text-ink-900" />
              {listing.rating_avg.toFixed(1)}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-ink-500">{listing.title}</p>
        <p className="mt-1 text-sm">
          <span className="font-tabular font-semibold text-ink-900">{formatPrice(listing.price_per_night)}</span>{" "}
          <span className="text-ink-500">night</span>
        </p>
      </div>
    </Link>
  );
}
