"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProducts } from "@/lib/products";

gsap.registerPlugin(ScrollTrigger);

// ── Product / image data ──────────────────────────────────────────────────────
const products = getAllProducts();

const GALLERY_IMAGES = [
  { file: "/gallery/BLACK.png",  label: "Black",   hex: "#1c1c1c" },
  { file: "/gallery/brown.png",  label: "Brown",   hex: "#5a3b28" },
  { file: "/gallery/green.png",  label: "Forest",  hex: "#2f4a3a" },
  { file: "/gallery/old.png",    label: "Vintage", hex: "#8d7a5e" },
  { file: "/gallery/orange.png", label: "Blaze",   hex: "#c1502e" },
  { file: "/gallery/white.png",  label: "White",   hex: "#e8e0d4" },
];

// Map each gallery image to a product for the collection grid
const COLLECTION_ITEMS = products.map((p, i) => ({
  ...p,
  image: GALLERY_IMAGES[i % GALLERY_IMAGES.length].file,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-[300] flex items-center justify-between px-6 py-4 sm:px-10"
      style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.85),transparent)" }}
    >
      {/* Logo */}
      <span
        className="text-lg font-black uppercase tracking-[0.18em]"
        style={{ color: "#fbed2b", fontFamily: "'SF Pro Display', system-ui, sans-serif" }}
      >
        Leisure
      </span>

      {/* Links */}
      <ul className="hidden gap-8 sm:flex">
        {["Home", "Collection", "About"].map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-[0.7rem] uppercase tracking-[0.18em] text-white/60 transition-colors hover:text-white"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#v4-collection"
        className="rounded-full px-5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] transition-all hover:scale-105"
        style={{ background: "#fbed2b", color: "#000" }}
      >
        Shop Now
      </a>
    </nav>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="fixed top-0 inset-x-0 z-[400] h-[2px] bg-white/5 pointer-events-none">
      <div
        className="h-full origin-left"
        style={{
          background: "#fbed2b",
          transform: `scaleX(${progress})`,
          willChange: "transform",
        }}
      />
    </div>
  );
}

// ── Wavy SVG line ─────────────────────────────────────────────────────────────
function WavyLine() {
  return (
    <svg
      viewBox="0 0 600 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg opacity-30"
      style={{ overflow: "visible" }}
    >
      <path
        d="M0 30 C50 10, 100 50, 150 30 S250 10, 300 30 S400 50, 450 30 S550 10, 600 30"
        stroke="#fbed2b"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        fill="none"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-100"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

// ── Concentric rings SVG ──────────────────────────────────────────────────────
function ConcentricRings() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const TICKS = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 2 * Math.PI;
    const r1 = 165, r2 = 172;
    return {
      x1: (200 + r1 * Math.cos(angle)).toFixed(4),
      y1: (200 + r1 * Math.sin(angle)).toFixed(4),
      x2: (200 + r2 * Math.cos(angle)).toFixed(4),
      y2: (200 + r2 * Math.sin(angle)).toFixed(4),
    };
  });

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 m-auto w-[340px] h-[340px] pointer-events-none"
    >
      {[160, 130, 100, 70, 40].map((r, i) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          stroke="#fbed2b"
          strokeWidth="0.8"
          strokeOpacity={0.12 + i * 0.04}
          fill="none"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 200 200`}
            to={`${i % 2 === 0 ? 360 : -360} 200 200`}
            dur={`${12 + i * 3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      {TICKS.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="#fbed2b"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />
      ))}
    </svg>
  );
}

// ── Animated progress bar ─────────────────────────────────────────────────────
function MetricBar({
  label,
  pct,
  visible,
}: {
  label: string;
  pct: number;
  visible: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[0.65rem] uppercase tracking-[0.16em]">
        <span className="text-white/50">{label}</span>
        <span style={{ color: "#fbed2b" }}>{pct}%</span>
      </div>
      <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: visible ? `${pct}%` : "0%",
            background: "linear-gradient(90deg, #fbed2b, #e8d800)",
          }}
        />
      </div>
    </div>
  );
}

// ── Badge icon ────────────────────────────────────────────────────────────────
function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: "#1a1a1a", border: "1px solid rgba(251,237,43,0.2)" }}
      >
        {icon}
      </div>
      <span className="text-[0.7rem] uppercase tracking-[0.14em] text-white/60">{label}</span>
    </div>
  );
}

// ── Social icon ───────────────────────────────────────────────────────────────
function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
      style={{ border: "1px solid rgba(255,255,255,0.15)" }}
    >
      {children}
    </a>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function V4Page() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeColor, setActiveColor] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Section visibility states driven by scroll
  const [specsVisible, setSpecsVisible] = useState(false);
  const [waveVisible,  setWaveVisible]  = useState(false);
  const [craftVisible, setCraftVisible] = useState(false);

  const currentProduct = products[activeColor] ?? products[0];
  const currentImage   = GALLERY_IMAGES[activeColor];

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;

      const prog = scrollTop / maxScroll;
      setScrollProgress(Math.min(1, Math.max(0, prog)));

      // 6 sections total; each section is 1/6 of full scroll
      const totalSections = 6;
      const sectionProg = prog * totalSections;

      // Sections 2, 3, 4 become visible when entering their viewport range
      setSpecsVisible(sectionProg > 0.85);
      setWaveVisible(sectionProg  > 1.85);
      setCraftVisible(sectionProg > 2.85);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    // Initial call
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      id="v4-scroll"
      ref={scrollRef}
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{
        backgroundColor: "#000000",
        fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
      }}
    >
      <Nav />
      <ProgressBar progress={scrollProgress} />

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Ambient radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(251,237,43,0.12), transparent 70%)",
          }}
        />

        {/* Giant title — upper half */}
        <div
          className="absolute top-[10vh] inset-x-0 text-center pointer-events-none select-none"
          style={{ zIndex: 10 }}
        >
          <div
            style={{
              fontSize: "clamp(3.5rem, 15vw, 14rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 0.88,
              WebkitTextStroke: "2px #fbed2b",
              color: "transparent",
            }}
          >
            SOUND
          </div>
          <div
            style={{
              fontSize: "clamp(3.5rem, 15vw, 14rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 0.88,
              color: "#fbed2b",
            }}
          >
            YOUR WILD.
          </div>
        </div>

        {/* Speaker image — center stage */}
        <div
          className="relative z-20 flex items-center justify-center"
          style={{ marginTop: "4vh" }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage.file}
              src={currentImage.file}
              alt={`Leisure speaker — ${currentImage.label}`}
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="select-none pointer-events-none"
              style={{
                height: "55vh",
                maxHeight: "520px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 60px rgba(251,237,43,0.2))",
                willChange: "opacity, transform",
              }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Bottom bar: price / CTA / swatches */}
        <div className="absolute bottom-10 inset-x-0 flex items-end justify-between px-6 sm:px-12 z-30">
          {/* Price — bottom left */}
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/35 mb-1">
              Starting at
            </p>
            <p className="text-2xl font-black text-white leading-none">
              {formatPrice(currentProduct.price)}
            </p>
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-white/30 mt-1">
              {currentProduct.model}
            </p>
          </div>

          {/* Add to cart — bottom center */}
          <a
            href="#v4-collection"
            className="rounded-full px-8 py-3 text-[0.75rem] font-bold uppercase tracking-[0.18em] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(251,237,43,0.4)]"
            style={{ background: "#fbed2b", color: "#000" }}
          >
            Add to Cart
          </a>

          {/* Color swatches — bottom right */}
          <div className="flex flex-col items-end gap-2">
            <p className="text-[0.58rem] uppercase tracking-[0.2em] text-white/28">
              {currentImage.label}
            </p>
            <div className="flex gap-2">
              {GALLERY_IMAGES.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActiveColor(i)}
                  aria-label={`Select ${g.label}`}
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: g.hex,
                    border:
                      activeColor === i
                        ? "2.5px solid #fbed2b"
                        : "2px solid rgba(255,255,255,0.15)",
                    transform: activeColor === i ? "scale(1.3)" : "scale(1)",
                    transition: "transform 0.2s, border-color 0.2s",
                    outline: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-2 pointer-events-none z-10">
          <p className="text-white/22 text-[0.55rem] uppercase tracking-[0.24em]">Scroll</p>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <rect
              x="1" y="1" width="12" height="18" rx="6"
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"
            />
            <rect x="6" y="4" width="2" height="5" rx="1" fill="rgba(255,255,255,0.25)">
              <animate attributeName="y" values="4;9;4" dur="1.6s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — SPECS / PURE CONTROL
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative h-screen flex items-center overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Vertical divider */}
        <div
          className="absolute top-0 bottom-0 left-1/2 w-px pointer-events-none hidden lg:block"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        <div className="w-full max-w-6xl mx-auto px-6 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left panel */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={specsVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p
              className="text-[0.65rem] uppercase tracking-[0.24em] mb-4"
              style={{ color: "#fbed2b" }}
            >
              Pure Audio Engineering
            </p>
            <div
              style={{
                fontSize: "clamp(3.5rem, 9vw, 8rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 0.88,
              }}
            >
              <div style={{ color: "#fff" }}>PURE</div>
              <div style={{ color: "#fbed2b" }}>CONTROL</div>
            </div>

            {/* Stat cards */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { stat: "360°", label: "Sound" },
                { stat: "IPX5", label: "Rated" },
              ].map(({ stat, label }) => (
                <div
                  key={stat}
                  className="rounded-xl p-5 flex flex-col gap-1"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    className="text-3xl font-black leading-none"
                    style={{ color: "#fbed2b" }}
                  >
                    {stat}
                  </span>
                  <span className="text-[0.62rem] uppercase tracking-[0.16em] text-white/40">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right panel — metric bars */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={specsVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="flex flex-col gap-6"
          >
            <div
              className="rounded-2xl p-8 flex flex-col gap-7"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <MetricBar label="Bass Response" pct={95} visible={specsVisible} />
              <MetricBar label="Battery Life"  pct={99} visible={specsVisible} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { v: "50K+", l: "Happy Listeners" },
                { v: "4.9★", l: "Avg Rating" },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  className="rounded-xl p-5 text-center"
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="text-2xl font-black leading-none"
                    style={{ color: "#fbed2b" }}
                  >
                    {v}
                  </div>
                  <div className="text-[0.6rem] uppercase tracking-[0.14em] text-white/38 mt-1.5">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — WIRELESS / ZERO LIMITS
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative h-screen flex items-center overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Left decorative circle rings */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 opacity-20"
          aria-hidden="true"
          style={{ width: "320px", height: "320px" }}
        >
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[150, 120, 90, 60].map((r) => (
              <circle
                key={r}
                cx="160" cy="160" r={r}
                stroke="#fbed2b"
                strokeWidth="0.8"
                strokeDasharray="4 3"
              />
            ))}
          </svg>
        </div>

        <div className="w-full max-w-6xl mx-auto px-6 sm:px-12">
          {/* Right-aligned content block */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={waveVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="ml-auto max-w-xl"
          >
            <p
              className="text-[0.65rem] uppercase tracking-[0.24em] mb-4"
              style={{ color: "#fbed2b" }}
            >
              Wireless Freedom
            </p>

            <div
              style={{
                fontSize: "clamp(3.5rem, 9vw, 8rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 0.88,
              }}
            >
              <div
                style={{
                  WebkitTextStroke: "2px #fbed2b",
                  color: "transparent",
                }}
              >
                ZERO
              </div>
              <div style={{ color: "#fbed2b" }}>LIMITS</div>
            </div>

            <div className="mt-10 flex flex-col gap-4">
              <Badge icon="📡" label="Range: 30m Bluetooth" />
              <Badge icon="🔋" label="Playtime: Up to 20h" />
              <Badge icon="💧" label="IPX5 Waterproof" />
              <Badge icon="🔗" label="TWS Stereo Pairing" />
            </div>

            <div className="mt-10">
              <WavyLine />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Bluetooth 5.3", "AUX / USB", "Optical", "TWS"].map((tag) => (
                <div
                  key={tag}
                  className="rounded-full px-5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    background: "#1a1a1a",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — DESIGN / CRAFTED
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{ background: "#000" }}
      >
        {/* Animated concentric rings (positioned absolute via SVG) */}
        <ConcentricRings />

        {/* Center text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={craftVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          <p
            className="text-[0.62rem] uppercase tracking-[0.3em] mb-5"
            style={{ color: "rgba(251,237,43,0.45)" }}
          >
            Design Language
          </p>
          <div
            style={{
              fontSize: "clamp(4rem, 12vw, 11rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 0.9,
              color: "#fff",
            }}
          >
            CRAFTED
          </div>
          <p className="mt-5 text-white/38 text-[0.85rem] max-w-[260px] leading-relaxed">
            Every detail deliberate. Every curve a choice.
          </p>
        </motion.div>

        {/* Left annotation */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={craftVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
          className="absolute left-8 sm:left-14 top-1/2 -translate-y-1/2"
        >
          <span
            className="block text-[0.62rem] uppercase tracking-[0.22em]"
            style={{ color: "#fbed2b" }}
          >
            Retro Soul
          </span>
          <div
            className="mt-1.5 h-px w-14"
            style={{ background: "rgba(251,237,43,0.3)" }}
          />
        </motion.div>

        {/* Right annotation */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={craftVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.32 }}
          className="absolute right-8 sm:right-14 top-1/2 -translate-y-1/2 flex flex-col items-end"
        >
          <span
            className="block text-[0.62rem] uppercase tracking-[0.22em]"
            style={{ color: "#fbed2b" }}
          >
            Modern Power
          </span>
          <div
            className="mt-1.5 h-px w-14"
            style={{ background: "rgba(251,237,43,0.3)" }}
          />
        </motion.div>

        {/* Bottom labels */}
        <div className="absolute bottom-10 inset-x-0 flex justify-center gap-10 sm:gap-16">
          {["Precision Drivers", "Premium Build", "Iconic Design"].map((label) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "#fbed2b" }}
              />
              <span className="text-[0.58rem] uppercase tracking-[0.16em] text-white/30">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 5 — COLLECTION
      ════════════════════════════════════════════════════════════════ */}
      <section
        id="v4-collection"
        className="relative min-h-screen py-20 overflow-hidden"
        style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-12">
          {/* Heading row */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p
                className="text-[0.65rem] uppercase tracking-[0.24em] mb-3"
                style={{ color: "#fbed2b" }}
              >
                Our Range
              </p>
              <h2
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                COLLECTION
              </h2>
            </div>
            <a
              href="/collection"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] transition-all hover:scale-105"
              style={{ background: "#fbed2b", color: "#000" }}
            >
              View All
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {COLLECTION_ITEMS.map((item) => (
              <a
                key={item.slug}
                href={`/product/${item.slug}`}
                className="group rounded-2xl overflow-hidden block"
                style={{
                  background: "#111111",
                  border: "1px solid rgba(255,255,255,0.07)",
                  transition: "border-color 0.25s ease, transform 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(251,237,43,0.4)";
                  el.style.transform   = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                  el.style.transform   = "translateY(0)";
                }}
              >
                {/* Image area */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ background: "#0d0d0d", height: "180px", overflow: "hidden" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.model}
                    className="transition-transform duration-500 group-hover:scale-110"
                    style={{
                      height: "145px",
                      width: "auto",
                      objectFit: "contain",
                      filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
                    }}
                  />
                </div>

                {/* Info row */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-black text-white text-sm tracking-[0.06em] leading-tight">
                        {item.model}
                      </p>
                      <p className="text-[0.62rem] text-white/38 mt-0.5 leading-tight truncate">
                        {item.tagline}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-black text-sm leading-tight"
                        style={{ color: "#fbed2b" }}
                      >
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-[0.58rem] text-white/28 line-through mt-0.5">
                        {formatPrice(item.mrp)}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* View All — mobile only */}
          <div className="flex sm:hidden justify-center mt-10">
            <a
              href="/collection"
              className="rounded-full px-8 py-3 text-[0.75rem] font-bold uppercase tracking-[0.18em]"
              style={{ background: "#fbed2b", color: "#000" }}
            >
              View All
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6 — FOOTER CTA
      ════════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-14"
        style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 60%, rgba(251,237,43,0.08), transparent 70%)",
          }}
        />

        {/* Giant footer text */}
        <div
          className="text-center select-none pointer-events-none relative z-10 px-4 leading-none"
          style={{ lineHeight: 0.85 }}
        >
          <div
            style={{
              fontSize: "clamp(4rem, 18vw, 18rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
              WebkitTextStroke: "2px #fbed2b",
              color: "transparent",
            }}
          >
            SOUND
          </div>
          <div
            style={{
              fontSize: "clamp(4rem, 18vw, 18rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
              color: "#fbed2b",
            }}
          >
            YOUR WILD.
          </div>
        </div>

        {/* Shop Now CTA */}
        <a
          href="/collection"
          className="relative z-10 mt-12 rounded-full px-10 py-4 text-[0.8rem] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 hover:shadow-[0_0_48px_rgba(251,237,43,0.35)]"
          style={{ background: "#fbed2b", color: "#000" }}
        >
          Shop Now
        </a>

        {/* Social icons */}
        <div className="relative z-10 flex gap-4 mt-10">
          {/* Instagram */}
          <SocialIcon href="#">
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.9" fill="rgba(255,255,255,0.55)" stroke="none" />
            </svg>
          </SocialIcon>
          {/* YouTube */}
          <SocialIcon href="#">
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96C1 8.13 1 12 1 12s0 3.87.46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96C23 15.87 23 12 23 12s0-3.87-.46-5.58z" />
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="rgba(255,255,255,0.55)" stroke="none" />
            </svg>
          </SocialIcon>
          {/* X / Twitter */}
          <SocialIcon href="#">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.855L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </SocialIcon>
        </div>

        {/* Divider */}
        <div
          className="relative z-10 w-full max-w-3xl mx-auto mt-12 mb-6"
          style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
        />

        {/* Copyright */}
        <div className="relative z-10 flex flex-col items-center gap-2 text-center px-6">
          <p className="text-[0.58rem] uppercase tracking-[0.22em] text-white/22">
            © 2026 Leisure Audio. All rights reserved.
          </p>
          <div className="flex gap-6 mt-1">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[0.58rem] uppercase tracking-[0.16em] text-white/18 hover:text-white/45 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
