"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { getAllProducts } from "@/lib/products";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const products = getAllProducts();

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
      className="relative w-full px-6 py-28 sm:py-36"
    >
      {/* Subtle velvet gradient lift so the section reads as its own band. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-velvet/40 to-transparent" />

      {/* Header */}
      <div className="relative z-10 mx-auto mb-20 flex max-w-2xl flex-col items-center text-center sm:mb-28">
        <p className="font-pinyon text-3xl text-gold sm:text-4xl">The Range</p>
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
      <div className="relative z-10 mx-auto max-w-[1200px]">
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
                  className="grid h-[82vh] w-full grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-offwhite/10 bg-gradient-to-br from-velvet to-deepblack p-8 will-change-transform gold-glow sm:p-12 lg:grid-cols-2 lg:gap-14"
                >
                  {/* Image panel — DOM order first; flips visually on lg. */}
                  <Link
                    href={`/product/${product.slug}`}
                    aria-label={`View the ${product.model}`}
                    className={`group relative block h-full overflow-hidden rounded-2xl bg-gradient-to-b from-velvet/80 to-nearblack ${
                      imageOnLeft ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <div className="relative h-full min-h-[40vh] w-full">
                      <Image
                        src={`/products/${product.slug}.png`}
                        alt={`${product.model} — ${product.tagline}`}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-105 sm:p-10"
                      />
                    </div>
                  </Link>

                  {/* Details column */}
                  <div
                    className={`relative flex flex-col items-center text-center lg:items-start lg:text-left ${
                      imageOnLeft ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    {/* Faint giant model watermark behind the text. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-8 left-1/2 -z-0 -translate-x-1/2 select-none font-display text-[7rem] font-bold leading-none text-offwhite/[0.06] sm:text-[9rem] lg:left-0 lg:translate-x-0"
                    >
                      {product.model}
                    </span>

                    <h3 className="relative font-display text-4xl font-semibold tracking-tight text-offwhite sm:text-5xl lg:text-6xl">
                      <Link href={`/product/${product.slug}`}>
                        {product.model}
                      </Link>
                    </h3>
                    <p className="relative mt-2 font-pinyon text-4xl leading-none text-gold sm:text-5xl">
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

                    {/* Key spec highlights */}
                    <dl className="relative mt-8 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
                      {product.specs.slice(0, 3).map((spec) => (
                        <div key={spec.label} className="flex flex-col">
                          <dt className="font-sans text-xs uppercase tracking-wide text-offwhite/50">
                            {spec.label}
                          </dt>
                          <dd className="mt-1 font-display text-base font-semibold text-offwhite">
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
                      <button type="button" className="btn-outline">
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
