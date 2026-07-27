"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ListingForm from "@/components/host/ListingForm";
import { useCreateListing } from "@/hooks/useHostListings";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ApiError } from "@/lib/api";
import type { ListingFormValues } from "@/types";

export default function NewListingPage() {
  const { isChecking } = useRequireAuth();
  const router = useRouter();
  const createListing = useCreateListing();

  if (isChecking) return null;

  const handleSubmit = async (values: ListingFormValues) => {
    try {
      const listing = await createListing.mutateAsync(values);
      toast.success("Listing created!");
      router.push(`/listings/${listing.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create this listing.");
    }
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Create a new listing</h1>
      <ListingForm onSubmit={handleSubmit} submitLabel="Publish listing" isSubmitting={createListing.isPending} />
    </div>
  );
}
