"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const products = getAllProducts();
const N = products.length;

export default function V8Page() {
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const imgRefs    = useRef<(HTMLDivElement | null)[]>(new Array(N).fill(null));
  const textRefs   = useRef<(HTMLDivElement | null)[]>(new Array(N).fill(null));
  const dotRefs    = useRef<(HTMLDivElement | null)[]>(new Array(N).fill(null));
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef(0);
  const heroHRef  = useRef(0);
  const rafRef    = useRef<number>(0);
  const posRef    = useRef({ lx: 0, gapX: 0, imgW: 0 });

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    heroHRef.current = vh * 18; // 1800vh

    const imgW = Math.min(vw * 0.42, 500);
    const lx   = vw * 0.05;
    const rx   = vw - imgW - vw * 0.05;
    posRef.current = { lx, gapX: rx - lx, imgW };

    if (imgContainerRef.current) {
      imgContainerRef.current.style.width     = `${imgW}px`;
      imgContainerRef.current.style.left      = `${lx}px`;
      imgContainerRef.current.style.transform = "translateY(-50%) translateX(0px)";
    }
    textRefs.current.forEach(d => {
      if (d) d.style.transform = "translateY(-50%) translateX(0px)";
    });

    const wrap = document.querySelector(".v8-wrap") as HTMLElement | null;
    if (!wrap) return;
    const onScroll = () => { scrollRef.current = wrap.scrollTop; };
    wrap.addEventListener("scroll", onScroll, { passive: true });

    // Ease-in-out
    const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let lastZi = -1;

    const tick = () => {
      const raw = Math.min(scrollRef.current / heroHRef.current, 1);
      const { lx, gapX } = posRef.current;

      // Progress bar
      if (progressRef.current) progressRef.current.style.width = `${(raw * 100).toFixed(2)}%`;

      // Zone
      const zf = Math.min(raw / (1 / N), N - 0.0001);
      const zi = Math.floor(zf);
      const zp = zf - zi; // 0–1 within zone

      // Image: even zones=LEFT(0), odd zones=RIGHT(1)
      const target = zi % 2;       // 0 or 1
      const prev   = 1 - target;   // opposite

      let xOffset: number;
      if (zi === 0) {
        // First zone: image already at left, no slide
        xOffset = 0;
      } else {
        const sp = ease(Math.min(zp / 0.13, 1));
        xOffset  = (prev + (target - prev) * sp) * gapX;
      }

      if (imgContainerRef.current) {
        imgContainerRef.current.style.transform = `translateY(-50%) translateX(${xOffset.toFixed(1)}px)`;
      }

      // Crossfade images
      imgRefs.current.forEach((div, i) => {
        if (!div) return;
        let a = 0;
        if (i === zi) {
          const ea = i === 0 ? 1 : (zp < 0.10 ? zp / 0.10 : 1);
          const xa = i === N - 1 ? 1 : (zp > 0.90 ? Math.max(0, 1 - (zp - 0.90) / 0.10) : 1);
          a = Math.min(ea, xa);
        }
        div.style.opacity = String(a);
      });

      // Text blocks
      textRefs.current.forEach((div, i) => {
        if (!div) return;
        let a = 0, tx = 0;
        if (i === zi) {
          // Text appears slightly after image slide (0.14 for all except first zone)
          const ts  = i === 0 ? 0.04 : 0.14;
          const ea  = zp < ts ? 0 : zp < ts + 0.10 ? (zp - ts) / 0.10 : 1;
          const xa  = i === N - 1 ? 1 : (zp > 0.82 ? Math.max(0, 1 - (zp - 0.82) / 0.10) : 1);
          a         = Math.min(ea, xa);

          // Slide text in from its side
          const textLeft = i % 2 === 1; // odd products: text on left side
          const slideAmt = 28 * (1 - Math.min(a * 2, 1));
          tx = textLeft ? -slideAmt : slideAmt;
        }
        div.style.opacity       = String(a);
        div.style.transform     = `translateY(-50%) translateX(${tx.toFixed(1)}px)`;
      });

      // Dot indicators
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        dot.style.opacity   = i === zi ? "1"    : "0.22";
        dot.style.transform = i === zi ? "scaleY(2.8)" : "scaleY(1)";
      });

      // Counter (direct DOM, no React state)
      if (counterRef.current && zi !== lastZi) {
        lastZi = zi;
        counterRef.current.textContent = `${String(zi + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      wrap.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes v8-grain {
          0%  { transform:translate(0,0); }
          25% { transform:translate(-1.5%,-1%); }
          50% { transform:translate(1%,1.5%); }
          75% { transform:translate(-1%,1%); }
          100%{ transform:translate(0,0); }
        }
        .v8-grain-layer {
          animation: v8-grain .09s steps(1) infinite;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px 300px;
          mix-blend-mode: overlay;
        }
      `}</style>

      <div className="v8-wrap fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#0a0806" }}>

        <section style={{ height: "1800vh", position: "relative" }}>
          <div className="sticky top-0 h-dvh overflow-hidden">

            {/* BG */}
            <div className="absolute inset-0" style={{ background: "#0a0806" }} />

            {/* Grain */}
            <div className="v8-grain-layer pointer-events-none absolute inset-[-15%] z-[1]" style={{ opacity: 0.16 }} />

            {/* Center divider */}
            <div className="pointer-events-none absolute top-20 bottom-20 left-1/2 z-[2]"
              style={{ width: "1px", background: "rgba(255,255,255,0.055)" }} />

            {/* Progress bar */}
            <div className="absolute top-0 inset-x-0 h-px z-50" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div ref={progressRef} className="h-full" style={{ width: "0%", background: "#fbed2b", transition: "none" }} />
            </div>

            {/* ── Sliding image container ── */}
            <div
              ref={imgContainerRef}
              className="absolute"
              style={{ top: "50%", left: "5vw", willChange: "transform" }}
            >
              {/* Aspect-ratio wrapper */}
              <div style={{ position: "relative", width: "100%", paddingBottom: "85%" }}>
                {products.map((prod, i) => (
                  <div
                    key={prod.slug}
                    ref={el => { imgRefs.current[i] = el; }}
                    className="absolute inset-0"
                    style={{ opacity: i === 0 ? 1 : 0, willChange: "opacity" }}
                  >
                    <Image
                      src={`/products/${prod.slug}/${prod.colors[0].folderSlug}/1.jpg`}
                      alt={prod.model}
                      fill
                      className="object-contain"
                      style={{ filter: "brightness(0.96) contrast(1.02)" }}
                      priority
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Text blocks — one per product ── */}
            {products.map((prod, i) => {
              const onRight = i % 2 === 0; // even → text RIGHT | odd → text LEFT
              return (
                <div
                  key={prod.slug}
                  ref={el => { textRefs.current[i] = el; }}
                  className="absolute z-[5]"
                  style={{
                    top: "50%",
                    width: "clamp(260px, 36vw, 450px)",
                    ...(onRight ? { right: "5vw" } : { left: "5vw" }),
                    opacity: 0,
                    willChange: "opacity, transform",
                  }}
                >
                  <p className="text-[8px] tracking-[0.45em] text-white/18 mb-5">
                    {String(i + 1).padStart(2, "0")} — LEISURE AUDIO
                  </p>
                  <h2 className="font-black text-white leading-none mb-3"
                    style={{ fontSize: "clamp(42px, 6vw, 84px)", letterSpacing: "-0.04em" }}>
                    {prod.model}.
                  </h2>
                  <p className="text-[9px] tracking-[0.22em] text-white/32 mb-7 uppercase">
                    {prod.tagline}
                  </p>

                  {/* Divider */}
                  <div className="w-full mb-7" style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

                  {/* Specs */}
                  <div className="space-y-3 mb-8">
                    {prod.specs.slice(0, 3).map(spec => (
                      <div key={spec.label} className="flex items-center justify-between gap-3">
                        <span className="text-[8px] tracking-[0.18em] text-white/20">{spec.label.toUpperCase()}</span>
                        <span className="text-[10px] font-semibold text-white/52">{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-[7px] tracking-[0.18em] text-white/20 mb-0.5">FROM</p>
                      <p className="text-lg font-black text-[#fbed2b] tracking-tight">{inr.format(prod.price)}</p>
                    </div>
                    <Link
                      href={`/product/${prod.slug}`}
                      className="pointer-events-auto rounded-full bg-white px-7 py-2.5 text-[10px] font-black tracking-[0.15em] text-black transition hover:bg-[#fbed2b] hover:scale-105"
                    >
                      BUY →
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Dot indicators (right edge) */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2.5">
              {products.map((_, i) => (
                <div
                  key={i}
                  ref={el => { dotRefs.current[i] = el; }}
                  className="w-0.5 h-2 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    opacity: 0.22,
                    transition: "transform .3s ease, opacity .3s ease",
                  }}
                />
              ))}
            </div>

            {/* Product counter */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
              <span ref={counterRef} className="text-[9px] tracking-[0.22em] text-white/22 font-mono">
                01 / 06
              </span>
            </div>

            {/* Nav */}
            <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-7">
              <Link href="/" className="text-[10px] tracking-[0.18em] text-white/30 hover:text-white transition">← BACK</Link>
              <span className="text-[14px] font-black tracking-[0.28em] text-white">LEISURE.</span>
              <Link href="/shop" className="rounded-full border border-white/12 px-5 py-2 text-[10px] tracking-[0.1em] text-white/40 transition hover:border-white/40 hover:text-white">
                Shop
              </Link>
            </nav>

          </div>
        </section>

      </div>
    </>
  );
}
