"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

const HERO_EQ = [
  { h: 16, dur: 0.85, del: 0.00 }, { h: 30, dur: 1.05, del: 0.07 },
  { h: 22, dur: 0.75, del: 0.14 }, { h: 40, dur: 1.15, del: 0.03 },
  { h: 28, dur: 0.90, del: 0.10 }, { h: 44, dur: 0.80, del: 0.17 },
  { h: 18, dur: 1.10, del: 0.05 }, { h: 36, dur: 0.95, del: 0.12 },
];

export default function ScrollProductSections() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sec2Ref    = useRef<HTMLElement>(null);
  const sec3Ref    = useRef<HTMLElement>(null);

  // One slot per section — GSAP animates each into/out of view
  const slot1 = useRef<HTMLDivElement>(null); // S1 product (right side)
  const slot2 = useRef<HTMLDivElement>(null); // S2 product (left side)  — starts hidden
  const slot3 = useRef<HTMLDivElement>(null); // S3 product (right side) — starts hidden

  const p = products[3]; // LEGEND

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const scroller = document.getElementById("v2-scroll");
      if (!scroller) return;

      // Build GSAP timelines (paused — we manually drive progress via scroll)
      // ── S1 → S2 ─────────────────────────────────────────────
      const tl1 = gsap.timeline({ paused: true });
      tl1.to(slot1.current, { x: "-38vw", opacity: 0, scale: 0.8, ease: "none" }, 0);
      tl1.fromTo(
        slot2.current,
        { x: "52vw", y: "5vh", opacity: 0, scale: 0.72 },
        { x: 0,      y: 0,    opacity: 1, scale: 1,    ease: "none" },
        0,
      );
      tl1.fromTo(
        sec2Ref.current!.querySelector<HTMLElement>(".sec-content"),
        { y: 55, opacity: 0 },
        { y: 0,  opacity: 1, ease: "none" },
        0.25,
      );

      // ── S2 → S3 ─────────────────────────────────────────────
      const tl2 = gsap.timeline({ paused: true });
      // immediateRender:false → GSAP reads FROM value at runtime (after tl1 has set slot2 to opacity:1)
      tl2.fromTo(slot2.current,
        { x: 0, y: 0, opacity: 1, scale: 1, immediateRender: false },
        { x: "38vw", opacity: 0, scale: 0.8, ease: "none" },
        0,
      );
      tl2.fromTo(
        slot3.current,
        { x: "-52vw", y: "5vh", opacity: 0, scale: 0.72 },
        { x: 0,       y: 0,    opacity: 1, scale: 1,    ease: "none" },
        0,
      );
      tl2.fromTo(
        sec3Ref.current!.querySelector<HTMLElement>(".sec-content"),
        { y: 55, opacity: 0 },
        { y: 0,  opacity: 1, ease: "none" },
        0.25,
      );

      // Manual scroll driver — bypasses ScrollTrigger position bugs with fixed overflow container
      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

      const onScroll = () => {
        const st   = scroller.scrollTop;
        const vh   = window.innerHeight;

        const sec2top = sec2Ref.current!.offsetTop;
        const sec3top = sec3Ref.current!.offsetTop;

        // S1→S2: trigger fires between 80% and 10% of viewport
        const s12start = sec2top - vh * 0.82;
        const s12end   = sec2top - vh * 0.18;
        tl1.progress(clamp((st - s12start) / (s12end - s12start), 0, 1));

        // S2→S3
        const s23start = sec3top - vh * 0.82;
        const s23end   = sec3top - vh * 0.18;
        tl2.progress(clamp((st - s23start) / (s23end - s23start), 0, 1));
      };

      scroller.addEventListener("scroll", onScroll, { passive: true });
      onScroll(); // seed initial state

      return () => {
        tl1.kill();
        tl2.kill();
        scroller.removeEventListener("scroll", onScroll);
      };
    });

    return () => mm.revert();
  }, { scope: wrapperRef });

  const ProductImage = () => (
    <div className="relative h-[300px] w-[300px] lg:h-[400px] lg:w-[400px]">
      <div
        className="absolute inset-[-15%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle,rgba(237,196,132,0.16) 0%,transparent 65%)" }}
      />
      <Image
        src={`/products/${p.slug}.png`}
        alt={p.model}
        fill
        className="relative z-10 object-contain drop-shadow-[0_0_50px_rgba(237,196,132,0.2)]"
        priority
      />
    </div>
  );

  return (
    <div ref={wrapperRef}>

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO
          Layout: Content LEFT │ Product RIGHT
      ═══════════════════════════════════════ */}
      <section
        className="relative flex min-h-screen items-center overflow-hidden"
        style={{ backgroundColor: "#070707" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(237,196,132,1) 1px,transparent 1px),linear-gradient(90deg,rgba(237,196,132,1) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
          }} />
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 50% at 65% 45%, rgba(237,196,132,0.07), transparent)" }} />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:min-h-screen lg:py-0">

          {/* LEFT — hero text */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold">
                Premium Wireless Audio — 2026
              </span>
            </div>
            <h1 className="font-display font-black uppercase leading-[0.9] tracking-tight text-white"
              style={{ fontSize: "clamp(3rem,7vw,6.5rem)" }}>
              SOUND<br />YOUR<br />
              <span style={{
                background: "linear-gradient(90deg,#c8922a 0%,#edc484 40%,#fff8e0 70%,#edc484 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>WILD.</span>
            </h1>
            <p className="font-pinyon text-3xl text-gold/90">Where Sound Becomes Art.</p>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              Retro soul. Modern power. Leisure speakers engineered for those who demand more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop"
                className="flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-wider text-[#070707]"
                style={{ background: "linear-gradient(135deg,#edc484,#c8922a)" }}>
                Explore
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/shop"
                className="rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-wider text-white/70"
                style={{ border: "1px solid rgba(250,248,251,0.22)" }}>
                View Speakers
              </Link>
            </div>
            <div className="flex items-end gap-[3px] pt-1">
              {HERO_EQ.map((b, i) => (
                <div key={i} className="w-[4px] origin-bottom rounded-t-sm bg-gold/45"
                  style={{ height: `${b.h}px`, animation: `eq-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate` }} />
              ))}
              <span className="ml-3 self-center text-[0.6rem] uppercase tracking-[0.2em] text-white/25">Live</span>
            </div>
          </div>

          {/* RIGHT — product (will fly LEFT when section 2 enters) */}
          <div ref={slot1} className="flex items-center justify-center">
            <ProductImage />
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[0.62rem] uppercase tracking-[0.22em] text-white/25">
          <span>Scroll</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="6" y="4" width="2" height="5" rx="1" fill="currentColor">
              <animate attributeName="y" values="4;9;4" dur="1.5s" repeatCount="indefinite"/>
            </rect>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2 — SPECS
          Layout: Product LEFT │ Content RIGHT
          Product arrives FROM the right (traveling left)
      ═══════════════════════════════════════ */}
      <section
        ref={sec2Ref}
        className="relative flex min-h-screen items-center overflow-hidden"
        style={{ backgroundColor: "#070707" }}
      >
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:min-h-screen lg:py-0">

          {/* LEFT — product arrives here from section 1's right side */}
          <div ref={slot2} className="flex items-center justify-center" style={{ opacity: 0 }}>
            <ProductImage />
          </div>

          {/* RIGHT — specs content */}
          <div className="sec-content flex flex-col gap-5" style={{ opacity: 0 }}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold">Pure Power</span>
            </div>
            <h2 className="font-display font-black uppercase leading-[0.88] text-white"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>
              THE<br />
              <span style={{
                background: "linear-gradient(90deg,#edc484,#c8922a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>{p.model}</span>
            </h2>
            <p className="font-pinyon text-2xl text-gold/80">{p.tagline}</p>
            <div className="grid grid-cols-2 gap-3">
              {p.specs.slice(0, 4).map((s) => (
                <div key={s.label} className="flex flex-col rounded-2xl px-4 py-3"
                  style={{ background: "rgba(237,196,132,0.06)", border: "1px solid rgba(237,196,132,0.12)" }}>
                  <p className="text-[0.62rem] uppercase tracking-wider text-gold/55">{s.label}</p>
                  <p className="font-display text-sm font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl font-bold text-gold">₹{p.price.toLocaleString("en-IN")}</span>
              <span className="text-sm text-white/30 line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
            </div>
            <Link href={`/product/${p.slug}`}
              className="self-start rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-wider text-[#070707]"
              style={{ background: "linear-gradient(135deg,#edc484,#c8922a)" }}>
              View Details →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 — IN THE BOX
          Layout: Content LEFT │ Product RIGHT
          Product arrives FROM the left (traveling right)
      ═══════════════════════════════════════ */}
      <section
        ref={sec3Ref}
        className="relative flex min-h-screen items-center overflow-hidden"
        style={{ backgroundColor: "#070707" }}
      >
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:min-h-screen lg:py-0">

          {/* LEFT — in the box content */}
          <div className="sec-content flex flex-col gap-5" style={{ opacity: 0 }}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold">What&apos;s Inside</span>
            </div>
            <h2 className="font-display font-black uppercase leading-[0.88] text-white"
              style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)" }}>
              IN THE<br />
              <span style={{
                background: "linear-gradient(90deg,#edc484,#c8922a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>BOX</span>
            </h2>
            <p className="font-pinyon text-2xl text-gold/80">Everything You Need.</p>
            <ul className="flex flex-col gap-3">
              {p.inBox.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/65">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gold/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={`/product/${p.slug}`}
                className="rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-wider text-[#070707]"
                style={{ background: "linear-gradient(135deg,#edc484,#c8922a)" }}>
                Buy Now
              </Link>
              <Link href="/shop"
                className="rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-wider text-white/65"
                style={{ border: "1px solid rgba(250,248,251,0.18)" }}>
                All Speakers
              </Link>
            </div>
          </div>

          {/* RIGHT — product arrives here from section 2's left side */}
          <div ref={slot3} className="flex items-center justify-center" style={{ opacity: 0 }}>
            <ProductImage />
          </div>
        </div>
      </section>

    </div>
  );
}
