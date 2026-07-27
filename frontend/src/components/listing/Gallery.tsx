"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Grip, ImageOff, X } from "lucide-react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-ink-100 text-ink-400 md:h-[420px]">
        <ImageOff size={40} />
      </div>
    );
  }

  const shown = images.slice(0, 5);

  return (
    <>
      <div className="grid h-72 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-[420px]">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative col-span-4 row-span-2 cursor-pointer md:col-span-2"
        >
          <Image src={shown[0]} alt={title} fill sizes="60vw" priority className="object-cover" />
        </button>
        {shown.slice(1).map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setLightboxIndex(i + 1)}
            className="relative col-span-2 row-span-1 hidden cursor-pointer md:block"
          >
            <Image src={src} alt={`${title} photo ${i + 2}`} fill sizes="20vw" className="object-cover" />
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-ink-100 cursor-pointer"
        >
          <Grip size={16} /> Show all {images.length} photos
        </button>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          title={title}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onIndexChange,
  title,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  title: string;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onIndexChange]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-900/95">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <p className="text-sm font-medium text-white/80">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="rounded-full p-2 text-white hover:bg-white/10 cursor-pointer"
        >
          <X size={22} />
        </button>
      </div>
      <div className="relative flex-1 px-4 pb-8 md:px-16">
        <div className="relative h-full w-full">
          <Image src={images[index]} alt={`${title} photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white cursor-pointer md:left-6"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % images.length)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 hover:bg-white cursor-pointer md:right-6"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
