import Link from "next/link";
import Image from "next/image";

const SPECS = [
  { label: "Bluetooth", value: "5.3" },
  { label: "Playtime", value: "20 hrs" },
  { label: "Rating", value: "IPX5" },
];

const HERO_EQ = [
  { h: 16, dur: 0.85, del: 0.00 }, { h: 30, dur: 1.05, del: 0.07 },
  { h: 22, dur: 0.75, del: 0.14 }, { h: 40, dur: 1.15, del: 0.03 },
  { h: 28, dur: 0.90, del: 0.10 }, { h: 44, dur: 0.80, del: 0.17 },
  { h: 18, dur: 1.10, del: 0.05 }, { h: 36, dur: 0.95, del: 0.12 },
  { h: 24, dur: 0.85, del: 0.08 }, { h: 42, dur: 1.00, del: 0.15 },
  { h: 32, dur: 0.78, del: 0.02 }, { h: 20, dur: 1.20, del: 0.09 },
  { h: 46, dur: 0.88, del: 0.16 }, { h: 26, dur: 1.05, del: 0.06 },
  { h: 38, dur: 0.82, del: 0.13 }, { h: 14, dur: 0.95, del: 0.04 },
];

export default function HeroV3() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* Warm cream background with velvet blob */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 45% at 75% 50%, rgba(66,2,6,0.07) 0%, transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 40% 35% at 15% 80%, rgba(200,146,42,0.06) 0%, transparent 65%)" }} />

      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(66,2,6,1) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-0">

        {/* Right — image first on mobile, second on desktop */}
        <div className="relative order-first flex items-center justify-center lg:order-last">
          {/* Velvet shadow bloom */}
          <div className="absolute h-[340px] w-[340px] rounded-full blur-3xl sm:h-[440px] sm:w-[440px]"
            style={{ background: "radial-gradient(circle, rgba(66,2,6,0.18) 0%, transparent 70%)" }} />

          {/* Cream card behind product */}
          <div className="absolute h-[280px] w-[280px] rounded-full sm:h-[360px] sm:w-[360px]"
            style={{ background: "rgba(255,255,255,0.6)", boxShadow: "0 0 0 1px rgba(66,2,6,0.07), 0 20px 80px rgba(66,2,6,0.12)" }} />

          {/* Product */}
          <div className="relative z-10 h-[280px] w-[280px] sm:h-[380px] sm:w-[380px]">
            <Image src="/products/drift.png" alt="Leisure DRIFT Speaker" fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(66,2,6,0.2)]" priority />
          </div>

          {/* Floating spec chips */}
          <div className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col gap-3 lg:-left-4">
            {SPECS.map((s) => (
              <div key={s.label} className="flex flex-col rounded-2xl px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(66,2,6,0.1)", boxShadow: "0 4px 20px rgba(66,2,6,0.08)" }}>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#420206]/60">{s.label}</span>
                <span className="font-display text-base font-semibold text-[#0f0102]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left — text */}
        <div className="flex flex-col gap-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#c8922a]" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#c8922a]">
              Premium Wireless Audio — 2026
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-display font-black uppercase leading-[0.9] tracking-tight text-[#0f0102]"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
              SOUND
              <br />
              YOUR
              <br />
              <span style={{ color: "#420206" }}>WILD.</span>
            </h1>
          </div>

          {/* Pinyon */}
          <p className="font-pinyon text-3xl text-[#c8922a]" style={{ lineHeight: 1.2 }}>
            Where Sound Becomes Art.
          </p>

          {/* Body */}
          <p className="max-w-sm text-sm leading-relaxed text-[#0f0102]/55">
            Retro soul. Modern power. Leisure speakers are engineered for those who demand more — from their music, and from their space.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shop"
              className="flex items-center gap-2 rounded-full px-7 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[#faf8fb] transition-all duration-300 hover:shadow-[0_0_28px_rgba(66,2,6,0.45)]"
              style={{ background: "linear-gradient(135deg,#420206,#6b0508)" }}>
              Explore Collection
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/shop"
              className="rounded-full px-7 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[#420206] transition-all duration-300 hover:bg-[rgba(66,2,6,0.06)]"
              style={{ border: "1.5px solid rgba(66,2,6,0.3)" }}>
              View Speakers
            </Link>
          </div>

          {/* Mini EQ */}
          <div className="flex items-end gap-[3px] pt-2">
            {HERO_EQ.map((b, i) => (
              <div key={i} className="w-[4px] origin-bottom rounded-t-sm bg-[#420206]/30"
                style={{ height: `${b.h}px`, animation: `eq-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate` }} />
            ))}
            <span className="ml-3 self-center text-[0.65rem] uppercase tracking-[0.2em] text-[#0f0102]/25">Live Audio</span>
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(66,2,6,0.15)] to-transparent" />
    </section>
  );
}
