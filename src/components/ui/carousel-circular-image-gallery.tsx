"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Link from "next/link";

gsap.registerPlugin(MotionPathPlugin);

export type GalleryItem = {
  title: string;
  subtitle?: string;
  url: string;
  href?: string;
  price?: number;
};

// ── Geometry (matches original) ───────────────────────────────────────────────
const GAP = 10;
const R   = 7;      // tab dot radius
const W   = 400;
const H   = 400;

function tabX(id: number, total: number) {
  return W / 2 - (total * (R * 2 + GAP) - GAP) / 2 + id * (R * 2 + GAP);
}

// Depth push (iOS-style): the incoming image enters from the direction edge
// while shrinking down from a slightly-zoomed-in "closer" scale to normal —
// the outgoing image simultaneously recedes (scales down further, partial
// parallax shift in the same direction) as if sliding away behind it.
const PUSH_DUR        = 0.65;
const PUSH_IN_EASE    = "power3.out";
const PUSH_OUT_EASE   = "power3.in";
const SCALE_IN_START  = 1.18; // incoming starts "closer" (zoomed in), settles to 1
const SCALE_OUT_END   = 0.86; // outgoing shrinks as it recedes
const PARALLAX_OUT_PCT = 28;  // % of its own width the outgoing shifts out

// ── Individual image layer ─────────────────────────────────────────────────────
interface GalleryImageProps {
  item: GalleryItem;
  id: number;
  total: number;
  open: boolean;
  dir: 1 | -1;
  onInPlace: (id: number) => void;
}

function GalleryImage({ item, id, total, open, dir, onInPlace }: GalleryImageProps) {
  const elRef     = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const fl = firstLoad.current;
    firstLoad.current = false;

    if (fl) {
      // First render: snap straight to final state, no animation.
      gsap.set(el, { xPercent: 0, scale: 1 });
      if (open) onInPlace(id);
      return;
    }

    if (open) {
      gsap.fromTo(
        el,
        { xPercent: dir >= 0 ? 100 : -100, scale: SCALE_IN_START },
        {
          xPercent: 0,
          scale: 1,
          duration: PUSH_DUR,
          ease: PUSH_IN_EASE,
          onComplete: () => onInPlace(id),
        }
      );
    } else {
      gsap.to(el, {
        xPercent: dir >= 0 ? -PARALLAX_OUT_PCT : PARALLAX_OUT_PCT,
        scale: SCALE_OUT_END,
        duration: PUSH_DUR,
        ease: PUSH_OUT_EASE,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      ref={elRef}
      className="absolute inset-0"
      style={{
        zIndex: open ? total + 1 : id,
        backgroundImage: `url(${item.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transformOrigin: "center center",
      }}
    />
  );
}

// ── Thumbnail dot navigation ───────────────────────────────────────────────────
interface TabsProps {
  items: GalleryItem[];
  opened: number;
  onSelect: (i: number) => void;
}

function Tabs({ items, opened, onSelect }: TabsProps) {
  const total = items.length;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 100 }}
    >
      {items.map((item, i) => {
        const cx = tabX(i, total);
        const cy = H - 30;
        const active = opened === i;
        return (
          <g key={item.url + i} className="pointer-events-auto">
            <defs>
              <clipPath id={`tab-clip-${i}`}>
                <circle cx={cx} cy={cy} r={R} />
              </clipPath>
            </defs>
            {/* Thumbnail preview inside the dot */}
            <image
              x={cx - R} y={cy - R}
              width={R * 2} height={R * 2}
              href={item.url}
              clipPath={`url(#tab-clip-${i})`}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Clickable ring */}
            <circle
              cx={cx} cy={cy}
              r={R + 2}
              fill="transparent"
              stroke={active ? "rgba(251,237,43,1)" : "rgba(251,237,43,0.45)"}
              strokeWidth={active ? 2 : 1.5}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(i)}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatPrice(n?: number) {
  if (typeof n !== "number") return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Main export ────────────────────────────────────────────────────────────────
export function ImageGallery({ items }: { items: GalleryItem[] }) {
  const [opened,   setOpened]   = useState(0);
  const [inPlace,  setInPlace]  = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onClick = (i: number) => {
    if (disabled || i === opened) return;
    const total = items.length;
    const forward = (i - opened + total) % total;
    const backward = (opened - i + total) % total;
    setDir(forward <= backward ? 1 : -1);
    setOpened(i);
  };
  const onInPlace = (i: number) => setInPlace(i);

  const next = useCallback(() => {
    setDir(1);
    setOpened((c) => (c + 1 >= items.length ? 0 : c + 1));
  }, [items.length]);

  const prev = useCallback(() => {
    setDir(-1);
    setOpened((c) => (c - 1 < 0 ? items.length - 1 : c - 1));
  }, [items.length]);

  useEffect(() => setDisabled(true),  [opened]);
  useEffect(() => setDisabled(false), [inPlace]);

  // Autoplay — reset whenever opened changes
  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(next, 4500);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [opened, next]);

  const current = items[opened];

  return (
    <div className="flex w-full flex-col items-center">
      {/* Stage row */}
      <div className="relative flex w-full items-center justify-center" style={{ aspectRatio: "1200 / 320" }}>

        {/* Prev */}
        <button
          type="button" onClick={prev} disabled={disabled} aria-label="Previous"
          className="absolute left-6 top-1/2 z-[101] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-gold/20 hover:border-gold/40 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Full-width stage */}
        <div className="relative h-full w-full overflow-hidden">
          {items.map((item, i) => (
            <GalleryImage
              key={item.url + i}
              item={item} id={i} total={items.length}
              open={opened === i}
              dir={dir}
              onInPlace={onInPlace}
            />
          ))}

          {/* Tab dots overlay */}
          <div className="pointer-events-none absolute inset-0 z-[100]">
            <Tabs items={items} opened={opened} onSelect={onClick} />
          </div>
        </div>

        {/* Next */}
        <button
          type="button" onClick={next} disabled={disabled} aria-label="Next"
          className="absolute right-6 top-1/2 z-[101] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:bg-gold/20 hover:border-gold/40 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Caption — two columns below the image: name/tagline on the left,
          price/CTA on the right, split by a vertical divider. Stacks and
          centers on mobile where there's no room for a row. */}
      {current && (
        <div className="mx-auto mt-6 flex w-full max-w-[1200px] flex-col items-center gap-5 px-6 text-center sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:text-left lg:mt-6">
          <div>
            {current.subtitle && (
              <p className="font-pinyon text-xl text-gold sm:text-2xl">{current.subtitle}</p>
            )}
            <h3 className="mt-1 font-display text-3xl font-semibold text-offwhite sm:text-4xl">
              {current.title}
            </h3>
          </div>

          {/* Divider — only reads as a column split once the row layout kicks in */}
          <div className="hidden h-16 w-px shrink-0 bg-offwhite/15 sm:block" />

          <div className="flex flex-col items-center gap-4 sm:items-end">
            {typeof current.price === "number" && (
              <p className="font-display text-xl text-gold sm:text-2xl">{formatPrice(current.price)}</p>
            )}
            {current.href && (
              <Link
                href={current.href}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#000000] transition-all duration-300 hover:shadow-[0_0_30px_rgba(237,196,132,0.4)]"
                style={{ background: "linear-gradient(135deg,#fbed2b,#e8d800)" }}
              >
                View Speaker
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
