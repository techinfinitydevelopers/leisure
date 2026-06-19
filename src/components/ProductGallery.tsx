"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductColor } from "@/lib/products";
import { getProductImages, PRODUCT_IMAGE_COUNTS } from "@/lib/products";

type Props = {
  slug: string;
  model: string;
  colors: ProductColor[];
  // Optional controlled props (used by ProductActions)
  activeColorIdx?: number;
  onColorChange?: (i: number) => void;
};

export default function ProductGallery({ slug, model, colors, activeColorIdx: controlledColorIdx, onColorChange }: Props) {
  const [internalColorIdx, setInternalColorIdx] = useState(0);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const activeColorIdx = controlledColorIdx ?? internalColorIdx;
  const activeColor = colors[activeColorIdx];
  const folderSlug = activeColor.folderSlug;
  const count = PRODUCT_IMAGE_COUNTS[slug]?.[folderSlug] ?? 1;
  const images = getProductImages(slug, folderSlug, count);

  function handleColorChange(i: number) {
    if (onColorChange) onColorChange(i);
    else setInternalColorIdx(i);
    setActiveImgIdx(0);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main image ── */}
      <div
        className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141414] via-[#0d0d0d] to-[#000] gold-glow"
        style={{ height: "480px" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1/3 left-1/2 h-[120%] w-[120%] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,237,43,0.12), transparent 60%)" }}
        />
        <Image
          key={images[activeImgIdx]}
          src={images[activeImgIdx]}
          alt={`Leisure ${model} — ${activeColor.name}`}
          fill
          sizes="(max-width: 768px) 90vw, 50vw"
          priority={activeImgIdx === 0}
          className="object-contain transition-opacity duration-300"
        />

        {/* Color badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: activeColor.hex }} />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">{activeColor.name}</span>
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[0.65rem] font-semibold text-white/50">{activeImgIdx + 1} / {images.length}</span>
        </div>
      </div>

      {/* ── Thumbnails ── */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveImgIdx(i)}
            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200"
            style={{ borderColor: i === activeImgIdx ? "#fbed2b" : "rgba(255,255,255,0.12)", background: "#0d0d0d" }}
            aria-label={`View image ${i + 1}`}
          >
            <Image src={src} alt={`${model} thumbnail ${i + 1}`} fill sizes="64px" className="object-contain" />
          </button>
        ))}
      </div>

      {/* ── Color swatches (only shown in standalone mode, not when controlled by parent) ── */}
      {!onColorChange && <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-white/40">Color</span>
        {colors.map((color, i) => (
          <button
            key={color.name}
            type="button"
            onClick={() => handleColorChange(i)}
            aria-label={color.name}
            title={color.name}
            className="flex flex-col items-center gap-1.5 transition-all"
          >
            <span
              className="block h-8 w-8 rounded-full transition-all duration-200"
              style={{
                backgroundColor: color.hex,
                boxShadow: i === activeColorIdx
                  ? "0 0 0 2px #000, 0 0 0 4px #fbed2b"
                  : "0 0 0 1px rgba(255,255,255,0.2)",
              }}
            />
            <span
              className="text-[0.62rem] font-medium uppercase tracking-[0.1em] transition-colors"
              style={{ color: i === activeColorIdx ? "#fbed2b" : "rgba(255,255,255,0.4)" }}
            >
              {color.name}
            </span>
          </button>
        ))}
      </div>}
    </div>
  );
}
