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

// Shared horizontal bounds for the heading, image, and caption row below —
// keeps all three on one consistent grid instead of the image going full-bleed
// while the heading sits narrower and centered.
const CONTAINER = "mx-auto w-full max-w-[1200px] px-6 sm:px-10";

export default function ProductShowcase() {
  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden pt-8 pb-6 sm:pt-10 sm:pb-8 lg:min-h-screen lg:justify-center lg:pt-[5.5rem] lg:pb-6">
      {/* Subtle velvet lift so it reads as a deliberate section after the
          video's black fade above. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-velvet/80 to-transparent" />

      <div className={`relative z-10 mb-6 flex flex-col items-center text-center sm:mb-8 lg:mb-5 ${CONTAINER}`}>
        <p className="font-pinyon text-2xl text-gold sm:text-3xl">
          The Collection
        </p>
        <h2 className="mt-1 font-display text-4xl font-semibold tracking-tight text-offwhite sm:text-5xl">
          Meet the Range
        </h2>
        <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-offwhite/70 sm:text-base">
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
