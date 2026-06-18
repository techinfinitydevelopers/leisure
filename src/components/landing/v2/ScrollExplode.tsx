"use client";

/**
 * Bottle-scroll style animation for the Leisure speaker.
 * Speaker image rotates / scales / translates as text sections scroll past.
 * Works inside #v2-scroll (fixed overflow-y container) — manual scroll driver.
 */

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 0,
    img: "/gallery/BLACK.png",
    headline: "Sound Your Wild",
    body: "Six speakers. One obsession with sound.",
    align: "center" as const,
    cta: false,
  },
  {
    id: 1,
    img: "/gallery/brown.png",
    headline: "Crafted for Obsession",
    body: "Every surface, every curve engineered for sonic perfection.",
    align: "left" as const,
    cta: false,
  },
  {
    id: 2,
    img: "/gallery/green.png",
    headline: "Born in the Wild",
    body: "Weatherproof. Fearless. Built to perform wherever you go.",
    align: "right" as const,
    cta: false,
  },
  {
    id: 3,
    img: "/gallery/old.png",
    headline: "Heritage, Reimagined",
    body: "Retro soul. Modern power. Zero compromise.",
    align: "left" as const,
    cta: false,
  },
  {
    id: 4,
    img: "/gallery/orange.png",
    headline: "Double the Energy",
    body: "Full-range stereo. Cinematic bass. Room-filling presence.",
    align: "right" as const,
    cta: false,
  },
  {
    id: 5,
    img: "/gallery/white.png",
    headline: "Choose Your Wild",
    body: "Six colours. One perfect match. Your sound starts here.",
    align: "center" as const,
    cta: true,
  },
];

const N = SECTIONS.length; // 6

export default function ScrollExplode() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const speakerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = document.getElementById("v2-scroll");
    const speaker  = speakerRef.current;
    const wrap     = wrapRef.current;
    if (!scroller || !speaker || !wrap) return;

    // ── Master timeline (paused — manually driven by scroll) ─────────────────
    // 5 transitions across 6 sections
    const tl = gsap.timeline({ paused: true });

    // S0 → S1 : slide RIGHT, tilt right
    tl.fromTo(speaker,
      { x: "0vw",   rotation: 0,   scale: 1    },
      { x: "30vw",  rotation: 8,   scale: 0.78, ease: "none", duration: 1 }
    );
    // S1 → S2 : slide LEFT, tilt left
    tl.to(speaker,
      { x: "-30vw", rotation: -8,  scale: 0.75, ease: "none", duration: 1 }
    );
    // S2 → S3 : slide RIGHT, tilt right (less)
    tl.to(speaker,
      { x: "24vw",  rotation: 6,   scale: 0.72, ease: "none", duration: 1 }
    );
    // S3 → S4 : slide LEFT, tilt left (less)
    tl.to(speaker,
      { x: "-24vw", rotation: -6,  scale: 0.70, ease: "none", duration: 1 }
    );
    // S4 → S5 : return center, upright
    tl.to(speaker,
      { x: "0vw",   rotation: 0,   scale: 0.88, ease: "none", duration: 1 }
    );

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const onScroll = () => {
      const wrapTop = wrap.offsetTop;
      const wrapH   = wrap.clientHeight - window.innerHeight;
      const prog    = clamp((scroller.scrollTop - wrapTop) / wrapH, 0, 1);

      // Drive speaker transform
      tl.progress(prog);

      // Progress bar
      const bar = document.getElementById("v2-explode-bar");
      if (bar) bar.style.transform = `scaleX(${prog})`;

      // ── Image cross-fade ────────────────────────────────────────────────
      // floatSection: 0 → 5 as prog: 0 → 1
      const floatSec = prog * (N - 1);
      const lo = Math.floor(floatSec);
      const hi = Math.min(lo + 1, N - 1);
      const blend = floatSec - lo;

      for (let i = 0; i < N; i++) {
        const imgEl = document.getElementById(`spk-img-${i}`) as HTMLElement | null;
        if (!imgEl) continue;
        let opacity = 0;
        if (i === lo) opacity = 1 - blend;
        if (i === hi) opacity = blend;
        imgEl.style.opacity = opacity.toFixed(3);
      }

      // ── Text overlays ───────────────────────────────────────────────────
      const HALF = 0.55 / (N - 1);
      SECTIONS.forEach((s) => {
        const el = document.getElementById(`spk-txt-${s.id}`);
        if (!el) return;
        const center = s.id / (N - 1);
        // No clamping — let edge sections be fully visible at scroll 0 and 1
        const sR = center - HALF;
        const eR = center + HALF;
        const pad = HALF * 0.45;

        let opacity = 0;
        if (prog >= sR && prog < sR + pad)          opacity = (prog - sR) / pad;
        else if (prog >= sR + pad && prog <= eR - pad) opacity = 1;
        else if (prog > eR - pad && prog <= eR)     opacity = (eR - prog) / pad;

        const yOff = prog < center ? (1 - Math.min(opacity * 1.5, 1)) * 22 : -(1 - Math.min(opacity * 1.5, 1)) * 22;
        el.style.opacity   = opacity.toFixed(3);
        el.style.transform = `translateY(${yOff.toFixed(1)}px)`;
      });

      // Scroll hint fades after 4%
      const hint = document.getElementById("v2-scroll-hint");
      if (hint) hint.style.opacity = Math.max(0, 1 - prog * 25).toString();
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* Gold progress bar */}
      <div className="sticky top-0 z-[110] h-[2px] w-full bg-white/5">
        <div
          id="v2-explode-bar"
          className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#c8922a] to-[#edc484]"
          style={{ willChange: "transform" }}
        />
      </div>

      {/* 600 vh scroll track */}
      <div ref={wrapRef} className="relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#070707]">

          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_center,rgba(237,196,132,0.09),transparent_70%)]" />

          {/* ── Speaker ─────────────────────────────────────────────────── */}
          <div
            ref={speakerRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ willChange: "transform" }}
          >
            {SECTIONS.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.id}
                id={`spk-img-${i}`}
                src={s.img}
                alt={s.headline}
                className="absolute h-[55vh] max-h-[520px] w-auto max-w-none select-none"
                style={{
                  opacity: i === 0 ? 1 : 0,
                  transition: "opacity 0.5s ease",
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(237,196,132,0.15))",
                }}
                draggable={false}
              />
            ))}
          </div>

          {/* ── Text overlays ────────────────────────────────────────────── */}
          {SECTIONS.map((s) => (
            <div
              key={s.id}
              id={`spk-txt-${s.id}`}
              className={[
                "absolute inset-0 flex flex-col justify-center pointer-events-none",
                s.align === "left"   ? "items-start pl-8 sm:pl-16 lg:pl-24" : "",
                s.align === "right"  ? "items-end pr-8 sm:pr-16 lg:pr-24 text-right" : "",
                s.align === "center" ? "items-center text-center px-6" : "",
              ].join(" ")}
              style={{ opacity: 0, transform: "translateY(22px)", willChange: "opacity, transform" }}
            >
              <div className="max-w-xs sm:max-w-sm">
                <p className="font-pinyon text-2xl text-gold mb-1 sm:text-3xl">Leisure</p>
                <h2 className="font-display text-3xl font-semibold text-white/92 leading-tight sm:text-4xl lg:text-5xl">
                  {s.headline}
                </h2>
                <p className="mt-3 text-white/55 text-sm sm:text-base leading-relaxed">
                  {s.body}
                </p>
                {s.cta && (
                  <div className="pointer-events-auto mt-7 flex gap-3 flex-wrap">
                    <Link
                      href="/collection"
                      className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#070707] transition-all duration-300 hover:shadow-[0_0_28px_rgba(237,196,132,0.45)]"
                      style={{ background: "linear-gradient(135deg,#edc484,#c8922a)" }}
                    >
                      Shop Now
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <a
                      href="#v2-products"
                      className="inline-flex items-center gap-2 rounded-full border border-white/18 px-6 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white/70 hover:border-gold/40 hover:text-white transition-colors"
                    >
                      See Speakers
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Scroll hint */}
          <div
            id="v2-scroll-hint"
            className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-2 pointer-events-none"
          >
            <p className="text-white/28 text-[0.6rem] uppercase tracking-[0.22em]">Scroll</p>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <rect x="1" y="1" width="12" height="18" rx="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
              <rect x="6" y="4" width="2" height="5" rx="1" fill="rgba(255,255,255,0.3)">
                <animate attributeName="y" values="4;9;4" dur="1.6s" repeatCount="indefinite" />
              </rect>
            </svg>
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#070707] to-transparent" />
        </div>
      </div>
    </>
  );
}
