"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAmenities } from "@/hooks/useAmenities";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/lib/constants";
import type { ListingFormValues } from "@/types";

const listingSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(5000),
  property_type: z.enum(["apartment", "house", "guesthouse", "hotel", "unique_stay"]),
  city: z.string().trim().min(1, "City is required").max(120),
  region: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1, "Country is required").max(120),
  price_per_night: z.coerce.number().positive("Must be greater than $0").max(100_000, "That's a bit much -- keep it under $100,000/night"),
  cleaning_fee: z.coerce.number().min(0).max(10_000, "Keep the cleaning fee under $10,000"),
  max_guests: z.coerce.number().int().min(1, "At least 1 guest").max(32),
  bedrooms: z.coerce.number().int().min(0).max(20),
  beds: z.coerce.number().int().min(1).max(32),
  bathrooms: z.coerce.number().min(0.5).max(20),
});

type ListingFormInput = z.input<typeof listingSchema>;
type ListingFormOutput = z.output<typeof listingSchema>;

const inputClass =
  "w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-ink-900";
const labelClass = "mb-1.5 block text-sm font-semibold text-ink-900";
const errorClass = "mt-1 text-xs text-error";

export default function ListingForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: {
  initialValues?: Partial<ListingFormValues>;
  onSubmit: (values: ListingFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
}) {
  const { data: amenities } = useAmenities();
  const [amenityIds, setAmenityIds] = useState<number[]>(initialValues?.amenity_ids ?? []);
  const [images, setImages] = useState<string[]>(initialValues?.images?.length ? initialValues.images : [""]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormInput, unknown, ListingFormOutput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      property_type: initialValues?.property_type ?? "apartment",
      city: initialValues?.city ?? "",
      region: initialValues?.region ?? "",
      country: initialValues?.country ?? "",
      price_per_night: initialValues?.price_per_night ?? 100,
      cleaning_fee: initialValues?.cleaning_fee ?? 25,
      max_guests: initialValues?.max_guests ?? 2,
      bedrooms: initialValues?.bedrooms ?? 1,
      beds: initialValues?.beds ?? 1,
      bathrooms: initialValues?.bathrooms ?? 1,
    },
  });

  const toggleAmenity = (id: number) => {
    setAmenityIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const submit = handleSubmit(async (fields) => {
    const cleanedImages = images.map((url) => url.trim()).filter(Boolean);
    if (cleanedImages.length === 0) {
      toast.error("Add at least one photo URL");
      return;
    }
    await onSubmit({
      ...fields,
      amenity_ids: amenityIds,
      images: cleanedImages,
      latitude: initialValues?.latitude ?? 0,
      longitude: initialValues?.longitude ?? 0,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink-900">Basics</h2>
        <div>
          <label className={labelClass}>Title</label>
          <input {...register("title")} className={inputClass} placeholder="Sunlit loft in downtown Austin" />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea {...register("description")} rows={5} className={inputClass} placeholder="Describe your place..." />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Property type</label>
          <select {...register("property_type")} className={inputClass}>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink-900">Location</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>City</label>
            <input {...register("city")} className={inputClass} placeholder="Austin" />
            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
          </div>
          <div>
            <label className={labelClass}>State / Region</label>
            <input {...register("region")} className={inputClass} placeholder="TX" />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input {...register("country")} className={inputClass} placeholder="USA" />
            {errors.country && <p className={errorClass}>{errors.country.message}</p>}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink-900">Capacity &amp; pricing</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelClass}>Max guests</label>
            <input type="number" {...register("max_guests")} className={inputClass} />
            {errors.max_guests && <p className={errorClass}>{errors.max_guests.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Bedrooms</label>
            <input type="number" {...register("bedrooms")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Beds</label>
            <input type="number" {...register("beds")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bathrooms</label>
            <input type="number" step={0.5} {...register("bathrooms")} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price per night (USD)</label>
            <input type="number" step={0.01} {...register("price_per_night")} className={inputClass} />
            {errors.price_per_night && <p className={errorClass}>{errors.price_per_night.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Cleaning fee (USD)</label>
            <input type="number" step={0.01} {...register("cleaning_fee")} className={inputClass} />
          </div>
        </div>
      </section>

      {amenities && amenities.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-ink-900">Amenities</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-3 py-2 text-sm has-[:checked]:border-ink-900"
              >
                <input
                  type="checkbox"
                  checked={amenityIds.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="accent-[var(--color-brand-violet)]"
                />
                {amenity.name}
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-ink-900">Photos</h2>
        <p className="text-xs text-ink-500">Paste image URLs (e.g. from picsum.photos or your own hosting).</p>
        <div className="flex flex-col gap-2">
          {images.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={url}
                onChange={(e) => setImages((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                placeholder="https://picsum.photos/seed/my-listing/900/600"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={images.length === 1}
                aria-label="Remove photo"
                className="shrink-0 rounded-full p-2 text-ink-500 hover:bg-ink-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setImages((prev) => [...prev, ""])}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-900 underline cursor-pointer"
        >
          <Plus size={14} /> Add another photo
        </button>
      </section>

      <Button type="submit" size="lg" isLoading={isSubmitting} className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
