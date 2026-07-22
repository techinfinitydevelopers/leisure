"use client";

import { getAllProducts } from "@/lib/products";
import {
  ImageGallery,
  type GalleryItem,
} from "@/components/ui/carousel-circular-image-gallery";

const items: GalleryItem[] = getAllProducts().map((p) => ({
  title: p.model,
  subtitle: p.tagline,
  url: `/gallery/${p.slug}.png`,
  href: `/product/${p.slug}`,
  price: p.price,
}));

export default function ProductShowcase() {
  return (
    <section className="relative flex w-full flex-col items-center py-24 sm:py-32">
      {/* Subtle velvet lift so it reads as a deliberate section after the
          video's black fade above. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-velvet/80 to-transparent" />

      <div className="relative z-10 mb-14 flex flex-col items-center px-6 text-center">
        <p className="font-pinyon text-3xl text-gold sm:text-4xl">
          The Collection
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-offwhite sm:text-5xl">
          Meet the Range
        </h2>
        <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-offwhite/70 sm:text-base">
          Six speakers, one obsession with sound. Spin through the lineup and
          find the one that matches your wild.
        </p>
      </div>

      <div className="relative z-10 w-full">
        <ImageGallery items={items} />
      </div>
    </section>
  );
}
