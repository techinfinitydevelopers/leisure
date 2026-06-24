"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProduct } from "@/lib/products";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const product = getProduct("legend")!;

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.querySelector(".v7-wrap") as Element | null;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold, root }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export default function V7Page() {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const iconRef    = useRef<HTMLDivElement>(null);
  const subRef     = useRef<HTMLDivElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef(0);
  const heroHRef   = useRef(6300);
  const easedRef   = useRef(0);
  const seekingRef = useRef(false);
  const rafRef     = useRef<number>(0);

  const s2 = useReveal();
  const s3 = useReveal();
  const s4 = useReveal();
  const s5 = useReveal();

  useEffect(() => {
    heroHRef.current = window.innerHeight * 7;

    const wrap  = document.querySelector(".v7-wrap") as HTMLElement | null;
    const video = videoRef.current;
    if (!wrap || !video) return;

    video.addEventListener("canplay", () => { video.pause(); }, { once: true });
    video.addEventListener("seeked", () => { seekingRef.current = false; });
    video.load();

    const onScroll = () => { scrollRef.current = wrap.scrollTop; };
    wrap.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      const raw = Math.min(scrollRef.current / heroHRef.current, 1);

      // Lerp + seeking guard for smooth video
      easedRef.current += (raw - easedRef.current) * 0.12;
      const ep = easedRef.current;

      if (!seekingRef.current && video.readyState >= 2 && video.duration) {
        const target = ep * video.duration;
        if (Math.abs(video.currentTime - target) > 0.05) {
          seekingRef.current = true;
          video.currentTime = target;
        }
      }

      // "ICON." — in 0–2%, hold 2–4%, out 4–10%
      const ia = raw < 0.02 ? raw / 0.02 : raw < 0.04 ? 1 : Math.max(0, 1 - (raw - 0.04) / 0.06);
      const iy = raw < 0.02 ? 30 * (1 - raw / 0.02) : 0;
      if (iconRef.current) {
        iconRef.current.style.opacity = String(ia);
        iconRef.current.style.transform = `translateY(${iy}px)`;
      }

      // Subtitle: in 2–4%, out 4–9%
      const sa = raw < 0.02 ? 0 : raw < 0.04 ? (raw - 0.02) / 0.02 : raw < 0.05 ? 1 : Math.max(0, 1 - (raw - 0.05) / 0.04);
      if (subRef.current) subRef.current.style.opacity = String(sa);

      // Hint: 2–8%
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
        .v7-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.9s cubic-bezier(.16,1,.3,1), transform 0.9s cubic-bezier(.16,1,.3,1); }
        .v7-reveal.on { opacity: 1; transform: translateY(0); }
        .v7-reveal-up { opacity: 0; transform: translateY(70px); transition: opacity 1s ease, transform 1s ease; }
        .v7-reveal-up.on { opacity: 1; transform: translateY(0); }
        @keyframes v7-gold-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        .v7-gold-glow { animation: v7-gold-pulse 3s ease-in-out infinite; }
      `}</style>

      <div className="v7-wrap fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#07060a" }}>

        {/* ── HERO — 700vh sticky, scroll controls spotlight video ── */}
        <section style={{ height: "700vh", position: "relative" }}>
          <div className="sticky top-0 h-dvh overflow-hidden flex items-center justify-center">

            <video
              ref={videoRef}
              muted playsInline preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "brightness(0.65)", willChange: "contents" }}
            >
              <source src="/videos/spotlight.mp4" type="video/mp4" />
            </video>

            <div className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(7,6,10,0.4) 0%, transparent 30%, transparent 60%, rgba(7,6,10,0.85) 100%)" }} />

            <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-10 py-7">
              <Link href="/" className="text-[11px] tracking-[0.15em] text-white/50 hover:text-white transition">← BACK</Link>
              <span className="text-[15px] font-black tracking-[0.25em] text-white">LEISURE.</span>
              <Link href="/shop" className="rounded-full border border-white/20 px-5 py-2 text-[11px] tracking-[0.08em] text-white/60 transition hover:border-white/60 hover:text-white">
                Shop Now
              </Link>
            </nav>

            {/* ICON. — rAF driven, no React state */}
            <div
              ref={iconRef}
              className="pointer-events-none absolute inset-x-0 top-[28%] text-center z-10"
              style={{ opacity: 0, willChange: "opacity, transform" }}
            >
              <p className="font-black text-white" style={{ fontSize: "clamp(72px, 15vw, 180px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                ICON.
              </p>
            </div>

            <div
              ref={subRef}
              className="pointer-events-none absolute z-10 w-full text-center"
              style={{ top: "calc(28% + clamp(72px,15vw,180px) + 14px)", opacity: 0 }}
            >
              <p className="text-[11px] tracking-[0.3em] text-white/40">LEISURE LEGEND</p>
            </div>

            <div
              ref={hintRef}
              className="pointer-events-none absolute bottom-7 left-10 z-10 flex items-center gap-2"
              style={{ opacity: 0 }}
            >
              <div className="h-px w-12 bg-[#fbed2b]" />
              <span className="text-[10px] tracking-[0.2em] text-white/40">SCROLL TO REVEAL</span>
            </div>

          </div>
        </section>

        {/* ── SECTION 2 — Product reveal ── */}
        <section className="relative flex min-h-dvh items-center overflow-hidden py-24" style={{ background: "#080608" }}>
          <div className="pointer-events-none absolute inset-0 v7-gold-glow"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(251,237,43,0.1), transparent 60%)" }} />
          <div ref={s2.ref} className="mx-auto max-w-5xl px-10 w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className={`v7-reveal ${s2.visible ? "on" : ""} text-[10px] tracking-[0.3em] text-[#fbed2b]/50 mb-5`}>THE LEGEND</p>
                <h2 className={`v7-reveal ${s2.visible ? "on" : ""} font-black text-white leading-none`}
                  style={{ fontSize: "clamp(52px, 8vw, 100px)", letterSpacing: "-0.03em", transitionDelay: "0.1s" }}>
                  Unleash<br />the<br />Legend.
                </h2>
                <div className={`v7-reveal ${s2.visible ? "on" : ""} mt-8 flex items-center gap-4`} style={{ transitionDelay: "0.25s" }}>
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-[10px] tracking-[0.2em] text-white/30">STARTING AT</p>
                  <p className="text-xl font-bold text-[#fbed2b]">{inr.format(product.price)}</p>
                </div>
              </div>
              <div className={`v7-reveal ${s2.visible ? "on" : ""} relative`} style={{ transitionDelay: "0.15s" }}>
                <div className="relative h-[420px]">
                  <div className="v7-gold-glow absolute inset-0 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(251,237,43,0.15), transparent 65%)" }} />
                  <Image src="/products/legend/orange/2.jpg" alt="Leisure LEGEND" fill className="object-contain"
                    style={{ filter: "drop-shadow(0 30px 60px rgba(251,237,43,0.25))" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3 — Specs ── */}
        <section className="py-28 px-10" style={{ background: "#050404" }}>
          <div ref={s3.ref} className="mx-auto max-w-5xl">
            <div className={`v7-reveal ${s3.visible ? "on" : ""} mb-16 text-center`}>
              <p className="text-[10px] tracking-[0.3em] text-[#fbed2b]/40 mb-3">SPECIFICATIONS</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: "-0.02em" }}>Built Different.</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
                { val: "30W",  label: "Output Power",   sub: "+ 10W × 2" },
                { val: "9H",   label: "Playtime",        sub: "On single charge" },
                { val: "5in1", label: "Connectivity",    sub: "BT · AUX · USB · MIC · TWS" },
                { val: "10K",  label: "mAh Battery",     sub: "Massive capacity" },
                { val: "2",    label: "Wireless Mics",   sub: "Included in box" },
                { val: "20Hz", label: "Low Freq.",        sub: "– 20KHz range" },
              ].map((spec, i) => (
                <div key={spec.label} className={`v7-reveal-up ${s3.visible ? "on" : ""} rounded-2xl p-6`}
                  style={{ background: "#0e0c10", transitionDelay: `${i * 0.08}s` }}>
                  <p className="font-black text-[#fbed2b]" style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.02em" }}>{spec.val}</p>
                  <p className="mt-1 text-xs font-semibold text-white/70 tracking-wide">{spec.label}</p>
                  <p className="mt-0.5 text-[10px] text-white/30">{spec.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4 — Quote ── */}
        <section className="relative flex h-dvh items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/products/legend/orange/3.jpg" alt="Mood" fill className="object-cover"
              style={{ filter: "brightness(0.25) saturate(0.6)" }} />
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(251,237,43,0.06), transparent 70%)" }} />
          </div>
          <div ref={s4.ref} className="relative z-10 px-8 text-center max-w-3xl">
            <div className={`v7-reveal ${s4.visible ? "on" : ""}`}>
              <p className="font-black text-white leading-tight" style={{ fontSize: "clamp(36px, 6vw, 80px)", letterSpacing: "-0.02em" }}>
                "Every room<br />deserves a legend."
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-[#fbed2b]/40" />
                <p className="text-[10px] tracking-[0.2em] text-white/30">LEISURE AUDIO</p>
                <div className="h-px w-16 bg-[#fbed2b]/40" />
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5 — CTA ── */}
        <section className="flex h-dvh flex-col items-center justify-center gap-10 text-center px-8" style={{ background: "#040304" }}>
          <div ref={s5.ref}>
            <div className={`v7-reveal ${s5.visible ? "on" : ""}`}>
              <p className="text-[10px] tracking-[0.35em] text-white/20 mb-4">LEISURE AUDIO — LEGEND</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(52px, 10vw, 130px)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                YOUR<br />STAGE.
              </h2>
            </div>
            <div className={`v7-reveal ${s5.visible ? "on" : ""} mt-12 flex flex-col sm:flex-row items-center justify-center gap-4`}
              style={{ transitionDelay: "0.25s" }}>
              <Link href="/product/legend" className="rounded-full bg-[#fbed2b] px-10 py-4 text-[12px] font-black tracking-[0.15em] text-black transition hover:scale-105">
                DISCOVER LEGEND →
              </Link>
              <Link href="/v6" className="rounded-full border border-white/15 px-8 py-4 text-[11px] tracking-[0.12em] text-white/40 transition hover:border-white/40 hover:text-white/70">
                VIEW GALLERY
              </Link>
            </div>
            <div className={`v7-reveal ${s5.visible ? "on" : ""} mt-8`} style={{ transitionDelay: "0.4s" }}>
              <p className="text-[10px] tracking-[0.15em] text-[#fbed2b] font-bold">{inr.format(product.price)}</p>
              <p className="text-[9px] tracking-[0.1em] text-white/20 mt-1">FREE SHIPPING · 1 YEAR WARRANTY</p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
