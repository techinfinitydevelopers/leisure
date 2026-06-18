import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

const quickLinks = [
  { label: "About Us", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Contact", href: "/" },
];

// Waveform bars — flat baseline (60px) + additive sine variation so every
// letter (including E) always has tall enough bars to be clearly visible.
const WAVE_BARS = Array.from({ length: 100 }, (_, i) => {
  const x = i / 99;
  const v =
    32 * Math.sin(x * Math.PI * 2.3 + 0.5) +
    22 * Math.sin(x * Math.PI * 5.1 + 1.7) +
    14 * Math.sin(x * Math.PI * 9.7 + 0.3) +
     8 * Math.sin(x * Math.PI * 15.3 + 2.6);
  const h = Math.round(Math.max(28, Math.min(148, 68 + v)));
  return {
    h,
    dur: 0.44 + (i % 9) * 0.09,
    del: (i % 23) * 0.041,
  };
});

// Deterministic equalizer bar data — no Math.random (avoids hydration mismatch)
const EQ_BARS = [
  { h: 14, dur: 0.90, del: 0.00 }, { h: 28, dur: 1.10, del: 0.06 },
  { h: 38, dur: 0.80, del: 0.12 }, { h: 22, dur: 1.20, del: 0.18 },
  { h: 44, dur: 0.95, del: 0.04 }, { h: 30, dur: 1.00, del: 0.10 },
  { h: 18, dur: 0.85, del: 0.16 }, { h: 40, dur: 1.15, del: 0.02 },
  { h: 24, dur: 0.90, del: 0.08 }, { h: 46, dur: 1.05, del: 0.14 },
  { h: 32, dur: 0.80, del: 0.20 }, { h: 20, dur: 1.20, del: 0.06 },
  { h: 42, dur: 0.95, del: 0.12 }, { h: 28, dur: 0.85, del: 0.18 },
  { h: 16, dur: 1.10, del: 0.04 }, { h: 38, dur: 0.90, del: 0.10 },
  { h: 46, dur: 1.00, del: 0.16 }, { h: 24, dur: 0.85, del: 0.02 },
  { h: 36, dur: 1.15, del: 0.08 }, { h: 18, dur: 0.95, del: 0.14 },
  { h: 44, dur: 0.80, del: 0.20 }, { h: 30, dur: 1.20, del: 0.06 },
  { h: 22, dur: 0.90, del: 0.12 }, { h: 40, dur: 1.05, del: 0.18 },
  { h: 14, dur: 0.85, del: 0.04 }, { h: 34, dur: 1.10, del: 0.10 },
  { h: 26, dur: 0.95, del: 0.16 }, { h: 44, dur: 1.00, del: 0.02 },
  { h: 20, dur: 0.80, del: 0.08 }, { h: 38, dur: 1.20, del: 0.14 },
  { h: 30, dur: 0.90, del: 0.00 }, { h: 16, dur: 1.05, del: 0.06 },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-deepblack">

      {/* ── Equalizer visualizer strip ── */}
      <div className="flex items-end justify-center gap-[3px] px-4 pt-10 pb-0">
        {EQ_BARS.map((b, i) => (
          <div
            key={i}
            className="w-[5px] origin-bottom rounded-t-sm bg-gold/70"
            style={{
              height: `${b.h}px`,
              animation: `eq-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Gold hairline */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand + speaker ripple */}
          <div className="flex flex-col gap-5">
            {/* Speaker ripple icon */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              {/* Ripple rings */}
              {[0, 0.8, 1.6].map((delay) => (
                <span
                  key={delay}
                  className="absolute inset-0 rounded-full border border-gold/30"
                  style={{
                    animation: `ripple-ring 2.4s ease-out ${delay}s infinite`,
                  }}
                />
              ))}
              {/* Speaker cone SVG */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-velvet/60">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" opacity="0.9" />
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor" opacity="0.7" />
                  <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor" opacity="0.4" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <Image
                src="/brand/leisure-logo.png"
                alt="Leisure"
                width={90}
                height={90}
                className="h-[90px] w-[90px] brightness-0 invert"
              />
            </div>

            <p className="text-sm leading-relaxed text-offwhite/55">
              Premium retro Bluetooth speakers — crafted for powerful sound,
              built to turn heads.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { label: "Instagram", icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
                { label: "Facebook",  icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                { label: "LinkedIn",  icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
                { label: "YouTube",   icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#000000"/></svg> },
              ].map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-offwhite/55 transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_12px_rgba(251,237,43,0.3)]"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Speakers */}
          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-offwhite/40">
              Speakers
            </h3>
            <ul className="mt-5 space-y-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="group flex items-center gap-2 text-sm font-medium text-offwhite transition-colors hover:text-gold"
                  >
                    <span className="h-px w-3 bg-offwhite/20 transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
                    {p.model}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-offwhite/40">
              Quick Link
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group flex items-center gap-2 text-sm font-medium text-offwhite transition-colors hover:text-gold"
                  >
                    <span className="h-px w-3 bg-offwhite/20 transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-offwhite/40">
              Contact Us
            </h3>
            <div className="mt-5 space-y-3 text-sm text-offwhite/70">
              <p className="font-medium text-offwhite">Andheri (E), Mumbai 400059</p>
              <p>support@leisureaudio.in</p>
              <p>+91 98200 00000</p>
            </div>

            {/* Newsletter mini */}
            <div className="mt-6">
              <p className="mb-2 text-[0.7rem] uppercase tracking-[0.18em] text-offwhite/35">Stay in the loop</p>
              <form className="flex items-center gap-2 border-b border-white/15 pb-2 focus-within:border-gold transition-colors duration-300">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-transparent text-xs text-offwhite placeholder:text-offwhite/30 focus:outline-none"
                />
                <button type="button" aria-label="Subscribe" className="shrink-0 text-gold transition-transform hover:translate-x-1">
                  →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Giant LEISURE with waveform inside ── */}
      <div className="relative select-none overflow-hidden border-t border-white/8 py-2">
        <svg
          viewBox="0 0 1200 180"
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          style={{ height: "clamp(5rem, 17vw, 15rem)" }}
          aria-hidden
        >
          <defs>
            <clipPath id="leisure-text-clip">
              <text
                x="600"
                y="158"
                fontSize="172"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
                letterSpacing="-3"
              >
                LEISURE
              </text>
            </clipPath>
          </defs>

          {/* Ghost outline */}
          <text
            x="600"
            y="158"
            fontSize="172"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="'SF Pro Display','Helvetica Neue',Arial,sans-serif"
            fill="none"
            stroke="rgba(251,237,43,0.12)"
            strokeWidth="1"
            letterSpacing="-3"
          >
            LEISURE
          </text>

          {/* Animated waveform bars clipped to text shape — bottom-anchored */}
          <g clipPath="url(#leisure-text-clip)">
            {WAVE_BARS.map((b, i) => (
              <rect
                key={i}
                x={i * 12}
                y={180 - b.h}
                width={10}
                height={b.h}
                fill="#fbed2b"
                style={{
                  transformBox: "fill-box" as React.CSSProperties["transformBox"],
                  transformOrigin: "50% 100%",
                  animation: `waveform-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate`,
                }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/8 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-offwhite/35 sm:flex-row">
          <p>© 2026 Leisure. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <Link href="/" className="transition-colors hover:text-offwhite/65">Privacy Policy</Link>
            <span className="mx-1 opacity-50">·</span>
            <Link href="/" className="transition-colors hover:text-offwhite/65">Terms &amp; Condition</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
