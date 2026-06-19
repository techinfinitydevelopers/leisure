"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProduct, getProductImages, PRODUCT_IMAGE_COUNTS } from "@/lib/products";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type Props = {
  slug: string;
  model: string;
  tagline: string;
  price: number;
  mrp: number;
  savePercent: number;
  fallbackImageUrl: string;
};

export default function ShopProductCard({
  slug,
  model,
  tagline,
  price,
  mrp,
  savePercent,
  fallbackImageUrl,
}: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Static product has folderSlug needed for image paths
  const staticProduct = getProduct(slug);
  const colors = staticProduct?.colors ?? [];
  const activeColor = colors[activeIdx];

  const imageSrc = activeColor
    ? getProductImages(slug, activeColor.folderSlug, PRODUCT_IMAGE_COUNTS[slug]?.[activeColor.folderSlug] ?? 1)[0]
    : (fallbackImageUrl || `/products/${slug}.png`);

  return (
    <Link
      href={`/product/${slug}`}
      className="glass group flex flex-col overflow-hidden rounded-3xl p-5 transition duration-300 hover:-translate-y-2 hover:border-gold/40 hover:gold-glow"
    >
      {/* Image panel */}
      <div className="h-56">
        <div className="relative isolate flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-offwhite/10 bg-gradient-to-br from-velvet via-nearblack to-deepblack gold-glow">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-1/3 left-1/2 h-[120%] w-[120%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,237,43,0.16),transparent_60%)]"
          />
          <Image
            key={imageSrc}
            src={imageSrc}
            alt={`Leisure ${model}${activeColor ? ` — ${activeColor.name}` : ""}`}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-contain p-6 transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-5 flex flex-1 flex-col">
        <h2 className="font-display text-2xl font-bold text-offwhite">{model}</h2>
        <p className="font-pinyon mt-1 text-2xl text-gold">{tagline}</p>

        <div className="mt-4 flex items-end gap-3">
          <span className="font-display text-2xl font-bold text-gold">{inr.format(price)}</span>
          <span className="font-sans text-sm text-offwhite/40 line-through">{inr.format(mrp)}</span>
          {savePercent > 0 && (
            <span className="ml-auto font-sans text-xs font-semibold uppercase tracking-wider text-gold">
              −{savePercent}%
            </span>
          )}
        </div>

        {/* Clickable color swatches */}
        {colors.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {colors.map((color, i) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                aria-label={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveIdx(i);
                }}
                className="h-6 w-6 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: color.hex,
                  boxShadow:
                    i === activeIdx
                      ? "0 0 0 2px #000, 0 0 0 4px #fbed2b"
                      : "0 0 0 1px rgba(255,255,255,0.3)",
                  transform: i === activeIdx ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
