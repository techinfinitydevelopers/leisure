import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();
const quickLinks = [
  { label: "About Us", href: "/v2" },
  { label: "Products", href: "/shop" },
  { label: "Contact", href: "/v2" },
];

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

const WAVE_BARS = Array.from({ length: 100 }, (_, i) => ({
  dur: 0.6 + (i % 7) * 0.1,
  del: (i % 20) * 0.04,
}));

const socials = [
  { label: "Instagram", icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
  { label: "Facebook",  icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  { label: "LinkedIn",  icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
  { label: "YouTube",   icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#070707"/></svg> },
];

export default function FooterV2() {
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#050505" }}>
      {/* EQ strip */}
      <div className="flex items-end justify-center gap-[3px] px-4 pt-10 pb-0">
        {EQ_BARS.map((b, i) => (
          <div key={i} className="w-[5px] origin-bottom rounded-t-sm bg-gold/60"
            style={{ height: `${b.h}px`, animation: `eq-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate` }} />
        ))}
      </div>

      {/* Gold hairline */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div className="relative flex h-16 w-16 items-center justify-center">
              {[0, 0.8, 1.6].map((delay) => (
                <span key={delay} className="absolute inset-0 rounded-full border border-gold/25"
                  style={{ animation: `ripple-ring 2.4s ease-out ${delay}s infinite` }} />
              ))}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 bg-[rgba(237,196,132,0.06)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gold">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" opacity="0.9" />
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor" opacity="0.7" />
                  <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor" opacity="0.4" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <Image src="/brand/leisure-logo.png" alt="Leisure" width={130} height={40} className="h-7 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,251,0.5)" }}>
              Premium retro Bluetooth speakers — crafted for powerful sound, built to turn heads.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/15 text-white/50 transition-all duration-300 hover:border-gold hover:text-gold hover:shadow-[0_0_12px_rgba(237,196,132,0.35)]"
                >{icon}</a>
              ))}
            </div>
          </div>

          {/* Speakers */}
          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(237,196,132,0.5)" }}>Speakers</h3>
            <ul className="mt-5 space-y-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} className="group flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-gold">
                    <span className="h-px w-3 bg-white/15 transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
                    {p.model}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(237,196,132,0.5)" }}>Quick Link</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="group flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-gold">
                    <span className="h-px w-3 bg-white/15 transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.22em]" style={{ color: "rgba(237,196,132,0.5)" }}>Contact Us</h3>
            <div className="mt-5 space-y-3 text-sm text-white/65">
              <p className="font-medium text-white">Andheri (E), Mumbai 400059</p>
              <p>support@leisureaudio.in</p>
              <p>+91 98200 00000</p>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-[0.7rem] uppercase tracking-[0.18em]" style={{ color: "rgba(237,196,132,0.35)" }}>Stay in the loop</p>
              <form className="flex items-center gap-2 border-b pb-2 transition-colors duration-300" style={{ borderColor: "rgba(237,196,132,0.15)" }}>
                <input type="email" placeholder="your@email.com" className="w-full bg-transparent text-xs text-white placeholder:text-white/25 focus:outline-none" />
                <button type="button" aria-label="Subscribe" className="shrink-0 text-gold transition-transform hover:translate-x-1">→</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Giant LEISURE waveform */}
      <div className="relative select-none overflow-hidden py-2" style={{ borderTop: "1px solid rgba(237,196,132,0.08)" }}>
        <svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMid meet" className="w-full" style={{ height: "clamp(5rem,17vw,15rem)" }} aria-hidden>
          <defs>
            <clipPath id="leisure-clip-v2">
              <text x="600" y="158" fontSize="172" fontWeight="900" textAnchor="middle" fontFamily="'SF Pro Display','Helvetica Neue',Arial,sans-serif" letterSpacing="-3">LEISURE</text>
            </clipPath>
          </defs>
          <text x="600" y="158" fontSize="172" fontWeight="900" textAnchor="middle" fontFamily="'SF Pro Display','Helvetica Neue',Arial,sans-serif" fill="none" stroke="rgba(237,196,132,0.1)" strokeWidth="1" letterSpacing="-3">LEISURE</text>
          <g clipPath="url(#leisure-clip-v2)">
            {WAVE_BARS.map((b, i) => (
              <rect key={i} x={i * 12} y={0} width={11} height={180} fill="#edc484"
                style={{ transformBox: "fill-box" as React.CSSProperties["transformBox"], transformOrigin: "center", animation: `waveform-bar ${b.dur}s ease-in-out ${b.del}s infinite alternate` }} />
            ))}
          </g>
        </svg>
      </div>

      {/* Bottom bar */}
      <div className="px-5 py-5 sm:px-8" style={{ borderTop: "1px solid rgba(237,196,132,0.08)" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs sm:flex-row" style={{ color: "rgba(250,248,251,0.3)" }}>
          <p>© 2026 Leisure. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <Link href="/v2" className="transition-colors hover:text-white/60">Privacy Policy</Link>
            <span className="mx-1 opacity-40">·</span>
            <Link href="/v2" className="transition-colors hover:text-white/60">Terms &amp; Condition</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
