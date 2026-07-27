"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ListingForm from "@/components/host/ListingForm";
import Skeleton from "@/components/ui/Skeleton";
import { useListing } from "@/hooks/useListing";
import { useUpdateListing } from "@/hooks/useHostListings";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ApiError } from "@/lib/api";
import type { ListingFormValues } from "@/types";

export default function EditListingPage() {
  const { isChecking } = useRequireAuth();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);
  const router = useRouter();

  const { data: listing, isLoading } = useListing(listingId);
  const updateListing = useUpdateListing(listingId);

  if (isChecking) return null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!listing) {
    return <div className="mx-auto max-w-[720px] px-4 py-16 text-center text-ink-500">Listing not found.</div>;
  }

  if (user && listing.host.id !== user.id) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center text-ink-500">
        You don&apos;t have permission to edit this listing.
      </div>
    );
  }

  const handleSubmit = async (values: ListingFormValues) => {
    try {
      await updateListing.mutateAsync(values);
      toast.success("Listing updated");
      router.push("/host");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update this listing.");
    }
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Edit listing</h1>
      <ListingForm
        initialValues={{
          title: listing.title,
          description: listing.description,
          property_type: listing.property_type,
          city: listing.city,
          region: listing.region ?? undefined,
          country: listing.country,
          latitude: listing.latitude,
          longitude: listing.longitude,
          price_per_night: listing.price_per_night,
          cleaning_fee: listing.cleaning_fee,
          max_guests: listing.max_guests,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          amenity_ids: listing.amenities.map((a) => a.id),
          images: listing.images,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        isSubmitting={updateListing.isPending}
      />
    </div>
  );
}
