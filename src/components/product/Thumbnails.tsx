"use client";

import { useEffect, useRef } from "react";

type ThumbnailsProps = {
  images?: string[];
  value?: number;
  onChange?: (i: number) => void;
};

export default function Thumbnails({ images = [], value = 0, onChange }: ThumbnailsProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  // On mobile the strip scrolls horizontally instead of wrapping (see the
  // max-width: 860px block in product-experience.css). Picking a new colour
  // resets the view index to 0 while the strip keeps its old scrollLeft, which
  // leaves the active thumb scrolled out of sight. Nudge it back in.
  // Deliberately NOT scrollIntoView(): that walks up to the window and would
  // fight Lenis/ScrollTrigger. Only this element's own scrollLeft is touched.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const thumb = strip.children.item(value) as HTMLElement | null;
    if (!thumb) return;
    const s = strip.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    const pad = 8;
    if (t.left < s.left) strip.scrollLeft -= s.left - t.left + pad;
    else if (t.right > s.right) strip.scrollLeft += t.right - s.right + pad;
  }, [value, images]);

  if (!images.length) return null;
  return (
    <div className="hero__thumbs" ref={stripRef} role="group" aria-label="Product views">
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          aria-label={`View ${i + 1}`}
          aria-pressed={value === i}
          className={`hero__thumb ${value === i ? "is-active" : ""}`}
          onClick={() => onChange?.(i)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}
