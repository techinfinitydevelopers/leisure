"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.querySelector(".v6-wrap") as Element | null;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1, root }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const products = getAllProducts();

export default function V6Page() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef(0);
  const heroHRef   = useRef(6300);
  const easedRef   = useRef(0);
  const seekingRef = useRef(false);
  const rafRef     = useRef<number>(0);

  const sec2 = useReveal();
  const sec3 = useReveal();
  const sec4 = useReveal();
  const sec5 = useReveal();

  useEffect(() => {
    heroHRef.current = window.innerHeight * 7;

    const wrap  = document.querySelector(".v6-wrap") as HTMLElement | null;
    const video = videoRef.current;
    if (!wrap || !video) return;

    // Pause on ready, let scroll control playback
    video.addEventListener("canplay", () => { video.pause(); }, { once: true });
    video.addEventListener("seeked", () => { seekingRef.current = false; });
    video.load();

    const onScroll = () => { scrollRef.current = wrap.scrollTop; };
    wrap.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const raw = Math.min(scrollRef.current / heroHRef.current, 1);

      // Lerp eased toward raw — smooth video, no seek interruption
      easedRef.current += (raw - easedRef.current) * 0.12;
      const ep = easedRef.current;

      if (!seekingRef.current && video.readyState >= 2 && video.duration) {
        const target = ep * video.duration;
        if (Math.abs(video.currentTime - target) > 0.05) {
          seekingRef.current = true;
          video.currentTime = target;
        }
      }

      // Text: in 0–2%, hold 2–4%, out 4–10% → hidden by ~630px scroll
      const ta = raw < 0.02 ? raw / 0.02 : raw < 0.04 ? 1 : Math.max(0, 1 - (raw - 0.04) / 0.06);
      const ty = raw < 0.02 ? 30 * (1 - raw / 0.02) : 0;
      if (textRef.current) {
        textRef.current.style.opacity = String(ta);
        textRef.current.style.transform = `translateY(${ty}px)`;
      }

      // Hint: visible 2–8%
      const ha = raw < 0.02 ? 0 : raw < 0.04 ? (raw - 0.02) / 0.02 : raw < 0.07 ? 1 : Math.max(0, 1 - (raw - 0.07) / 0.03);
      if (hintRef.current) hintRef.current.style.opacity = String(ha);

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
        .v6-reveal { opacity: 0; transform: translateY(48px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .v6-reveal.visible { opacity: 1; transform: translateY(0); }
        .v6-reveal-left { opacity: 0; transform: translateX(-48px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .v6-reveal-left.visible { opacity: 1; transform: translateX(0); }
        .v6-reveal-right { opacity: 0; transform: translateX(48px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .v6-reveal-right.visible { opacity: 1; transform: translateX(0); }
        .v6-card { opacity: 0; transform: translateY(60px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .v6-card.visible { opacity: 1; transform: translateY(0); }
        .v6-card:nth-child(2) { transition-delay: 0.12s; }
        .v6-card:nth-child(3) { transition-delay: 0.24s; }
        .v6-card:nth-child(4) { transition-delay: 0.36s; }
        .v6-card:nth-child(5) { transition-delay: 0.48s; }
        .v6-card:nth-child(6) { transition-delay: 0.60s; }
        @keyframes v6-line-grow { from { width: 0; } to { width: 100%; } }
        .v6-line { width: 0; }
        .v6-line.visible { animation: v6-line-grow 1.2s ease forwards; }
      `}</style>

      <div className="v6-wrap fixed inset-0 z-[100] overflow-y-auto bg-black">

        {/* ── HERO — 700vh sticky, scroll controls video ── */}
        <section style={{ height: "700vh", position: "relative" }}>
          <div className="sticky top-0 h-dvh overflow-hidden">

            <video
              ref={videoRef}
              muted playsInline preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ willChange: "contents" }}
            >
              <source src="/videos/gallery.mp4" type="video/mp4" />
            </video>

            <div className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.2) 100%)" }} />

            <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-10 py-7">
              <span className="text-[13px] tracking-[0.25em] text-white/70 font-light">THE COLLECTION</span>
              <span className="text-[15px] font-black tracking-[0.25em] text-white">LEISURE.</span>
              <Link href="/shop" className="rounded-full border border-white/30 px-5 py-2 text-[11px] tracking-[0.1em] text-white/80 transition hover:border-white hover:text-white">
                Shop →
              </Link>
            </nav>

            {/* Text — opacity/transform driven directly by rAF (no React state) */}
            <div
              ref={textRef}
              className="pointer-events-none absolute bottom-16 left-0 right-0 px-10 z-10"
              style={{ opacity: 0, willChange: "opacity, transform" }}
            >
              <p className="text-[10px] tracking-[0.3em] text-[#fbed2b]/70 mb-4">LEISURE AUDIO — 2026</p>
              <h1 className="font-black leading-none text-white" style={{ fontSize: "clamp(52px, 10vw, 130px)", letterSpacing: "-0.02em" }}>
                THE<br />GALLERY.
              </h1>
              <p className="mt-5 text-sm text-white/50 max-w-xs">Every speaker — a masterpiece. Every sound — a statement.</p>
            </div>

            <div
              ref={hintRef}
              className="pointer-events-none absolute bottom-7 left-10 z-10 flex items-center gap-2"
              style={{ opacity: 0, willChange: "opacity" }}
            >
              <div className="h-px w-12 bg-[#fbed2b]" />
              <span className="text-[10px] tracking-[0.2em] text-white/40">SCROLL TO EXPLORE</span>
            </div>

          </div>
        </section>

        {/* ── SECTION 2 — Featured LEGEND ── */}
        <section className="relative flex h-dvh items-center overflow-hidden" style={{ background: "#0e0c09" }}>
          <div className="pointer-events-none absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(251,237,43,0.12), transparent 60%)" }} />

          <div ref={sec2.ref} className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-10 lg:grid-cols-2 lg:items-center">
            <div className={`v6-reveal-left ${sec2.visible ? "visible" : ""}`}>
              <div className="relative mx-auto h-[420px] w-full max-w-[520px]">
                <Image src="/products/legend/orange/1.jpg" alt="Leisure LEGEND" fill className="object-contain"
                  style={{ filter: "drop-shadow(0 30px 60px rgba(251,237,43,0.2))" }} />
              </div>
            </div>
            <div className={`v6-reveal-right ${sec2.visible ? "visible" : ""}`} style={{ transitionDelay: "0.2s" }}>
              <p className="text-[10px] tracking-[0.3em] text-[#fbed2b]/60 mb-3">FEATURED — LEGEND</p>
              <h2 className="font-black leading-none text-white" style={{ fontSize: "clamp(40px, 6vw, 80px)", letterSpacing: "-0.02em" }}>
                Unleash<br />the Legend.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-white/45 max-w-sm">
                30W room-filling sound with built-in wireless microphone — take your stage anywhere.
              </p>
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-white/30">FROM</p>
                  <p className="text-2xl font-bold text-[#fbed2b]">{inr.format(13900)}</p>
                </div>
                <Link href="/product/legend" className="rounded-full bg-[#fbed2b] px-7 py-3 text-[11px] font-bold tracking-[0.12em] text-black transition hover:bg-white">
                  EXPLORE →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3 — All products ── */}
        <section className="py-24 px-10" style={{ background: "#080605" }}>
          <div ref={sec3.ref} className="mx-auto max-w-6xl">
            <div className={`v6-reveal ${sec3.visible ? "visible" : ""} mb-16 flex items-end justify-between`}>
              <div>
                <p className="text-[10px] tracking-[0.3em] text-[#fbed2b]/50 mb-2">THE RANGE</p>
                <h2 className="font-black text-white" style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.02em" }}>
                  Every Sound.<br />Every Space.
                </h2>
              </div>
              <div className={`v6-line ${sec3.visible ? "visible" : ""} h-px bg-white/10 flex-1 mx-12 mb-4`} />
              <Link href="/shop" className="mb-2 text-[11px] tracking-[0.12em] text-white/40 hover:text-white transition whitespace-nowrap">
                VIEW ALL →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
              {products.map((prod, i) => (
                <Link key={prod.slug} href={`/product/${prod.slug}`}
                  className={`v6-card ${sec3.visible ? "visible" : ""} group relative overflow-hidden rounded-2xl`}
                  style={{ background: "#121010", transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "radial-gradient(circle at 50% 70%, rgba(251,237,43,0.08), transparent 70%)" }} />
                  <div className="relative h-48 overflow-hidden">
                    <Image src={`/products/${prod.slug}/${prod.colors[0].folderSlug}/1.jpg`} alt={prod.model} fill
                      className="object-contain p-6 transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-5 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm tracking-wide">{prod.model}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{prod.tagline}</p>
                      </div>
                      <p className="text-[#fbed2b] text-sm font-bold">{inr.format(prod.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4 — Craft ── */}
        <section className="relative h-dvh flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/products/core/brown/2.jpg" alt="Craft detail" fill className="object-cover"
              style={{ filter: "brightness(0.4) saturate(0.8)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.3))" }} />
          </div>
          <div ref={sec4.ref} className="relative z-10 px-10 max-w-xl">
            <div className={`v6-reveal-left ${sec4.visible ? "visible" : ""}`}>
              <p className="text-[10px] tracking-[0.3em] text-[#fbed2b]/60 mb-4">CRAFTSMANSHIP</p>
              <h2 className="font-black leading-tight text-white" style={{ fontSize: "clamp(36px, 5.5vw, 72px)", letterSpacing: "-0.02em" }}>
                Obsessed<br />with Detail.
              </h2>
            </div>
            <div className={`v6-reveal ${sec4.visible ? "visible" : ""} mt-8`} style={{ transitionDelay: "0.2s" }}>
              <p className="text-sm leading-relaxed text-white/45 mb-8">
                Premium leather wrapping. Gold-capped control knobs. Precision-woven fabric grilles.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[["Premium Leather","Full-grain wrap"],["Gold Accents","Brass hardware"],["Fabric Grille","Acoustic weave"],["Bluetooth 5.3","30m range"]].map(([l,d]) => (
                  <div key={l}><p className="text-[10px] tracking-[0.15em] text-[#fbed2b]/70">{l}</p><p className="text-xs text-white/35 mt-1">{d}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5 — CTA ── */}
        <section className="flex h-dvh flex-col items-center justify-center text-center px-8" style={{ background: "#060504" }}>
          <div ref={sec5.ref}>
            <div className={`v6-reveal ${sec5.visible ? "visible" : ""}`}>
              <p className="text-[10px] tracking-[0.35em] text-[#fbed2b]/40 mb-6">LEISURE AUDIO — INDIA</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(48px, 9vw, 120px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                SOUND<br />YOUR WILD.
              </h2>
            </div>
            <div className={`v6-reveal ${sec5.visible ? "visible" : ""} mt-12 flex flex-col items-center gap-4`} style={{ transitionDelay: "0.3s" }}>
              <Link href="/shop" className="rounded-full bg-[#fbed2b] px-10 py-4 text-[12px] font-black tracking-[0.15em] text-black transition hover:scale-105 hover:bg-white">
                SHOP THE COLLECTION →
              </Link>
              <Link href="/" className="text-[10px] tracking-[0.2em] text-white/30 hover:text-white/60 transition">BACK TO HOME</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
