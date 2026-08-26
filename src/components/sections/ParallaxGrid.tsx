"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getAllProducts, getProductImages } from "@/lib/products";
import { useCart } from "@/context/CartContext";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const products = getAllProducts();

// Cap for the giant background watermark, in cqw (% of the details column's
// own width) — measured directly against the rendered font (sfpro, bold,
// 144px) so longer/wider names get a proportionally smaller cap and never
// overflow the column at any breakpoint. Combined with min() against the
// existing 7rem/9rem sizes below, so shorter names that already fit keep
// their original size exactly as before.
const WATERMARK_CQW_CAP: Record<string, number> = {
  DRIFT: 34,
  EDGE: 37,
  CORE: 35,
  LEGEND: 25,
  ELEVATE: 23,
  DOMINATOR: 16,
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Px of nav clearance the topmost sticky edge keeps.
const STICKY_BASE = 64;
// Px each successive card peeks below the one above it.
const STICKY_STEP = 12;

export default function ParallaxGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const { addItem } = useCart();
  const [productIds, setProductIds] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { id: number; slug: string }[]) => {
        const map: Record<string, number> = {};
        for (const p of data) map[p.slug] = p.id;
        setProductIds(map);
      })
      .catch(() => {});
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const wrappers = gsap.utils.toArray<HTMLElement>("[data-stack-item]");
      const tweens: gsap.core.Tween[] = [];

      wrappers.forEach((wrapper, i) => {
        const card = wrapper.querySelector<HTMLElement>("[data-card]");
        if (!card) return;

        // Gentle reveal as each card first scrolls into view. Fires once,
        // so it stays correct under reduced motion too.
        tweens.push(
          gsap.fromTo(
            card,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: wrapper,
                start: "top 85%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          )
        );

        if (reduceMotion) return;

        // DEPTH SCRUB — as the NEXT card scrolls up and covers this one,
        // shrink + dim this card so the buried layers read as a deck.
        // Skip the last card; nothing ever stacks on top of it.
        const nextWrapper = wrappers[i + 1];
        if (!nextWrapper) return;

        tweens.push(
          gsap.fromTo(
            card,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.92,
              filter: "brightness(0.6)",
              ease: "none",
              scrollTrigger: {
                // Span = while the next card travels from first appearing
                // at the bottom to fully covering this sticky card at the top.
                trigger: nextWrapper,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            }
          )
        );
      });

      // Images may load late; recompute trigger positions once laid out.
      ScrollTrigger.refresh();

      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full px-6 pt-28 pb-12 sm:pt-36 sm:pb-16"
    >
      {/* Subtle velvet gradient lift so the section reads as its own band. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-velvet/40 to-transparent" />

      {/* Header */}
      <div className="relative z-10 mx-auto mb-20 flex max-w-2xl flex-col items-center text-center sm:mb-28">
        <p className="font-pinyon text-2xl text-gold sm:text-3xl">The Range</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-offwhite sm:text-5xl">
          Six Ways to Sound Wild
        </h2>
        <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-offwhite/70 sm:text-base">
          From pocket-sized escapes to floor-shaking flagships — every Leisure
          speaker is tuned to fill your world with retro soul.
        </p>
      </div>

      {/* Sticky stacking deck. Each item is sticky at the same top, so each
          new card scrolls up and stacks on top of the one before it. */}
      <div className="relative z-10 mx-auto max-w-[1100px]">
        {products.map((product, i) => {
          const imageOnLeft = i % 2 === 0;
          const savePct = Math.round(
            ((product.mrp - product.price) / product.mrp) * 100
          );
          // Each card peeks a little further down than the one above it.
          const topPx = STICKY_BASE + i * STICKY_STEP;

          return (
            <div
              key={product.slug}
              data-stack-item
              className="sticky flex min-h-[90vh] items-start"
              style={{ top: `${topPx}px` }}
            >
                <article
                  data-card
                  data-image-side={imageOnLeft ? "left" : "right"}
                  className="grid h-[75vh] w-full grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-offwhite/10 bg-gradient-to-br from-velvet to-deepblack p-8 will-change-transform gold-glow sm:p-12 lg:grid-cols-2 lg:gap-14"
                >
                  {/* Image panel — DOM order first; flips visually on lg.
                      `h-full` is lg-only: on the mobile grid-cols-1 layout,
                      image panel and details column are separate auto-sized
                      grid rows, so a percentage height here has nothing to
                      resolve against and collapses to 0 (clipping the image
                      entirely via overflow-hidden). At lg, both sit in the
                      same row next to the (taller) details column, so
                      h-full correctly matches its height there. */}
                  <Link
                    href={`/product/${product.slug}`}
                    aria-label={`View the ${product.model}`}
                    className={`group relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-velvet/80 to-nearblack lg:h-full ${
                      imageOnLeft ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    {/* Boxed to the product photos' real ratio (1605:1065)
                        instead of forcing them into the full-height column —
                        that mismatch (landscape photo in a portrait box) was
                        the actual cause of the "small, empty" look, not the
                        image being too small. Centered by the flex parent
                        above, so the margin stays equal on every side. */}
                    <div className="relative aspect-[1605/1065] w-full">
                      <Image
                        src={`/products/${product.slug}.png`}
                        alt={`${product.model} — ${product.tagline}`}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        // Base scale used to be 1.3 (always on) — inside this
                        // overflow-hidden, aspect-locked box that zoomed past
                        // the image's own edges and cropped the actual
                        // speaker (its rounded top/bottom), worst on mobile
                        // where the box is shortest. Now only the hover state
                        // zooms in, which touch devices never trigger anyway.
                        className="object-contain p-1 transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                    </div>
                  </Link>

                  {/* Details column */}
                  <div
                    className={`relative flex flex-col items-center text-center [container-type:inline-size] lg:items-start lg:text-left ${
                      imageOnLeft ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    {/* Faint giant model watermark behind the text — sized
                        with min(rem, cqw-cap) so it never overflows this
                        column, at any breakpoint. The per-model cap goes in
                        via a CSS custom property (Tailwind can't compile a
                        runtime-interpolated arbitrary value, only a static
                        one referencing var()) — see WATERMARK_CQW_CAP. */}
                    <span
                      aria-hidden="true"
                      style={
                        {
                          "--wm-cap": WATERMARK_CQW_CAP[product.model],
                        } as React.CSSProperties
                      }
                      className="pointer-events-none absolute -top-8 left-1/2 -z-0 -translate-x-1/2 select-none font-display text-[min(7rem,calc(var(--wm-cap)*1cqw))] font-bold leading-none text-offwhite/[0.06] sm:text-[min(9rem,calc(var(--wm-cap)*1cqw))] lg:left-0 lg:translate-x-0"
                    >
                      {product.model}
                    </span>

                    <h3 className="relative font-display text-4xl font-semibold tracking-tight text-offwhite sm:text-5xl lg:text-6xl">
                      <Link href={`/product/${product.slug}`}>
                        {product.model}
                      </Link>
                    </h3>
                    <p className="relative mt-2 font-pinyon text-3xl leading-none text-gold sm:text-4xl">
                      {product.tagline}
                    </p>

                    {/* Price block */}
                    <div className="relative mt-6 flex flex-wrap items-baseline justify-center gap-3 lg:justify-start">
                      <span className="font-display text-3xl font-semibold text-gold sm:text-4xl">
                        {inr.format(product.price)}
                      </span>
                      {product.mrp > product.price && (
                        <>
                          <span className="font-sans text-base text-offwhite/40 line-through">
                            {inr.format(product.mrp)}
                          </span>
                          <span className="rounded-full bg-gold/15 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wide text-gold">
                            Save {savePct}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Key spec highlights — a compact label/value row per
                        spec on mobile (long values like "2 × 15W + 1 × 50W
                        Woofer" only cost one line instead of stacking label
                        above value) so this block doesn't grow tall enough
                        to push the fixed-height card's content, and with it
                        the image, past the overflow-hidden edge. Reverts to
                        the original stacked 3-column layout from sm up,
                        where there's room to spare. */}
                    <dl className="relative mt-6 flex w-full max-w-md flex-col gap-y-2 sm:mt-8 sm:grid sm:grid-cols-3 sm:gap-x-8 sm:gap-y-3">
                      {product.specs.slice(0, 3).map((spec) => (
                        <div
                          key={spec.label}
                          className="flex items-baseline justify-between gap-4 border-b border-offwhite/8 pb-2 sm:flex-col sm:justify-normal sm:gap-0 sm:border-0 sm:pb-0"
                        >
                          <dt className="shrink-0 font-sans text-xs uppercase tracking-wide text-offwhite/50">
                            {spec.label}
                          </dt>
                          <dd className="text-right font-display text-sm font-semibold text-offwhite sm:mt-1 sm:text-left sm:text-base">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {/* CTAs */}
                    <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                      <Link
                        href={`/product/${product.slug}`}
                        className="btn-gold"
                      >
                        View Speaker
                      </Link>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => {
                          const firstColor = product.colors[0];
                          addItem({
                            productId: productIds[product.slug] ?? 0,
                            slug: product.slug,
                            model: product.model,
                            price: product.price,
                            mrp: product.mrp,
                            color: firstColor.name,
                            image: getProductImages(product.slug, firstColor.folderSlug, 1)[0],
                          });
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
