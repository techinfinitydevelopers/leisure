import Link from "next/link";
import Image from "next/image";

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

const SPECS = [
  { label: "Bluetooth", value: "5.3" },
  { label: "Playtime", value: "20 hrs" },
  { label: "Rating", value: "IPX5" },
];

export default function HeroV2() {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(251,237,43,0.07) 0%, transparent 65%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,237,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(251,237,43,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-0">

        {/* Left — text */}
        <div className="flex flex-col gap-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold">
              Premium Wireless Audio — 2026
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-display font-black uppercase leading-[0.9] tracking-tight text-white"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
              SOUND
              <br />
              YOUR
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #e8d800 0%, #fbed2b 40%, #fff8e0 70%, #fbed2b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                WILD.
              </span>
            </h1>
          </div>

          {/* Pinyon tagline */}
          <p className="font-pinyon text-3xl text-gold/90" style={{ lineHeight: 1.2 }}>
            Where Sound Becomes Art.
          </p>

          {/* Description */}
          <p className="max-w-sm text-sm leading-relaxed text-white/55">
            Retro soul. Modern power. Leisure speakers are engineered for those who demand more — from their music, and from their space.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/shop"
              className="flex items-center gap-2 rounded-full px-7 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-[#000000] transition-all duration-300 hover:shadow-[0_0_28px_rgba(251,237,43,0.5)]"
              style={{ background: "linear-gradient(135deg,#fbed2b,#e8d800)" }}>
              Explore Collection
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/shop"
              className="rounded-full px-7 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:border-gold hover:text-gold"
              style={{ border: "1px solid rgba(250,248,251,0.25)" }}>
              View Speakers
            </Link>
          </div>

          {/* Mini EQ bars */}
          <div className="flex items-end gap-[3px] pt-2">
            {HERO_EQ.map((b, i) => (
              <div key={i}
                className="w-[4px] origin-bottom rounded-t-sm bg-gold/50"
                style={{ height: `${b.h}px`, animation: `eq-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate` }} />
            ))}
            <span className="ml-3 self-center text-[0.65rem] uppercase tracking-[0.2em] text-white/30">
              Live Audio
            </span>
          </div>
        </div>

        {/* Right — product image */}
        <div className="relative flex items-center justify-center">
          {/* Glow ring */}
          <div
            className="absolute h-[380px] w-[380px] rounded-full opacity-30 blur-3xl sm:h-[480px] sm:w-[480px]"
            style={{ background: "radial-gradient(circle, rgba(251,237,43,0.6) 0%, transparent 70%)" }}
          />

          {/* Ripple rings */}
          {[0, 1.0, 2.0].map((delay) => (
            <span key={delay}
              className="absolute h-[300px] w-[300px] rounded-full sm:h-[400px] sm:w-[400px]"
              style={{
                border: "1px solid rgba(251,237,43,0.18)",
                animation: `ripple-ring 3s ease-out ${delay}s infinite`,
              }} />
          ))}

          {/* Product image */}
          <div className="relative z-10 h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]">
            <Image
              src="/products/legend.png"
              alt="Leisure LEGEND Speaker"
              fill
              className="object-contain drop-shadow-[0_0_60px_rgba(251,237,43,0.25)]"
              priority
            />
          </div>

          {/* Floating spec chips */}
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-3 lg:right-4">
            {SPECS.map((s) => (
              <div key={s.label}
                className="flex flex-col rounded-2xl px-4 py-2.5 backdrop-blur-md"
                style={{ background: "rgba(251,237,43,0.07)", border: "1px solid rgba(251,237,43,0.18)" }}>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gold/70">{s.label}</span>
                <span className="font-display text-base font-semibold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
