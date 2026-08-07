import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

const quickLinks = [
  { label: "About Us", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Contact", href: "/" },
];

// Waveform bars — heights are a direct percentage (25–45%) of each
// letter's own internal height, not the word-wide/absolute-unit scheme
// used previously. Available height per letter (baseline to cap-top) was
// measured by rasterizing this exact text against the real embedded font
// (SF Pro Display Black, 172px): caps top out at y≈34.8, baseline at
// y=158, so 123.2 viewBox units are available — 25% = 31, 45% = 55.
const LETTER_HEIGHT = 123.2;
const MIN_H = Math.round(LETTER_HEIGHT * 0.25); // 31
const MAX_H = Math.round(LETTER_HEIGHT * 0.45); // 55
// Measured x-ranges (viewBox units) of each letter's glyph, L→E→I→S→U→R→E.
const LETTER_RANGES: [number, number][] = [
  [277, 356],
  [367, 446],
  [459, 497],
  [511, 601],
  [610, 718],
  [736, 841],
  [850, 929],
];
function letterIndexAt(x: number) {
  for (let k = 0; k < LETTER_RANGES.length; k++) {
    const [a, b] = LETTER_RANGES[k];
    if (x >= a - 2 && x <= b + 2) return k;
  }
  return -1;
}
// Each letter's bars are generated from their OWN local sine wave (phase
// offset by the letter's index k) instead of one continuous wave across the
// whole word — a single word-wide wave let some letters (e.g. "L") land
// entirely in a trough while others hit every peak, so only a couple of
// letters ever showed tall bars. Per-letter waves, plus a clamp tuned so
// the amplitude reliably exceeds the ±(MAX_H-MIN_H)/2 swing needed, mean
// every letter independently reaches the same 25–45% band and touches (or
// nearly touches) 45% at its own peak — verified per-letter, not assumed.
const WAVE_BARS = Array.from({ length: 100 }, (_, i) => {
  const x = i * 12;
  const k = letterIndexAt(x);
  let h = MIN_H;
  if (k !== -1) {
    const [a, b] = LETTER_RANGES[k];
    const lx = (x - a) / (b - a);
    const v =
      11 * Math.sin(lx * Math.PI * 2.6 + k * 1.7) +
       7 * Math.sin(lx * Math.PI * 5.9 + k * 0.9 + 1) +
       4 * Math.sin(lx * Math.PI * 10.3 + k * 2.3 + 2);
    h = Math.round(Math.max(MIN_H, Math.min(MAX_H, 43 + v)));
  }
  return {
    h,
    dur: 0.44 + (i % 9) * 0.09,
    del: (i % 23) * 0.041,
  };
});

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-deepblack">

      {/* Gold hairline */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-5">

            <div className="flex items-center">
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
            stroke="rgba(251,237,43,0.45)"
            strokeWidth="1.5"
            letterSpacing="-3"
          >
            LEISURE
          </text>

          {/* Animated waveform bars clipped to text shape — bottom-anchored
              at y=160 (the letters' true bottom, incl. the slight round-
              letter overshoot on S/U below the y=158 baseline), not the old
              y=180: that left 22 wasted units below anything the clip path
              could ever show, which is what freed up the extra headroom
              used above. */}
          <g clipPath="url(#leisure-text-clip)">
            {WAVE_BARS.map((b, i) => (
              <rect
                key={i}
                x={i * 12}
                y={160 - b.h}
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
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            <p>© 2026 Leisure. All rights reserved.</p>
            <span className="opacity-30">·</span>
            <p>
              Designed &amp; Developed by{" "}
              <a
                href="http://techinfinity.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold/60 transition-colors hover:text-gold"
              >
                TechInfinity
              </a>
            </p>
          </div>
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
