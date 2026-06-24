"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProduct, getProductImages } from "@/lib/products";

const SLUG = "edge";
const product = getProduct(SLUG)!;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function productImg(folderSlug: string, index = 1): string {
  return getProductImages(SLUG, folderSlug, index)[index - 1];
}

export default function V5Page() {
  const [cidx, setCidx] = useState(0);
  const color = product.colors[cidx];

  return (
    <>
      <style>{`
        @keyframes v5-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes v5-glow-pulse {
          0%,100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 0.65; transform: scale(1.12); }
        }
        .v5-wrap { scroll-snap-type: y mandatory; }
        .v5-sec  { scroll-snap-align: start; }
        .v5-img-fade { transition: opacity 0.4s ease; }
      `}</style>

      <div className="v5-wrap fixed inset-0 z-[100] overflow-y-auto">

        {/* ── 01  HERO ── */}
        <section
          className="v5-sec relative flex h-dvh flex-col overflow-hidden"
          style={{ background: "#e8ecef" }}
        >
          {/* Minimal nav */}
          <nav className="relative z-10 flex items-center justify-between px-10 py-6">
            <div className="flex items-center gap-7">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setCidx(i)}
                  style={{
                    color: i === cidx ? "#111" : "#aaa",
                    fontWeight: i === cidx ? 700 : 400,
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "color 0.2s",
                  }}
                >
                  {c.name.toUpperCase()}
                </button>
              ))}
            </div>

            <span style={{ fontSize: "15px", fontWeight: 900, letterSpacing: "0.25em", color: "#111" }}>
              LEISURE.
            </span>

            <Link
              href="/shop"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#111",
                color: "#fff",
                padding: "10px 22px",
                borderRadius: "100px",
                fontSize: "11px",
                letterSpacing: "0.08em",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Shop now →
            </Link>
          </nav>

          {/* Floating product */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                position: "relative",
                width: "min(640px, 74vw)",
                height: "min(360px, 45vh)",
                animation: "v5-float 4s ease-in-out infinite",
              }}
            >
              <Image
                key={color.folderSlug}
                src={productImg(color.folderSlug, 1)}
                alt={`Leisure EDGE — ${color.name}`}
                fill
                style={{ objectFit: "contain" }}
                className="v5-img-fade"
                priority
              />
            </div>
          </div>

          {/* Giant outline text */}
          <div className="mt-auto overflow-hidden">
            <p
              style={{
                fontSize: "clamp(76px, 20vw, 220px)",
                fontWeight: 900,
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.6)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                textAlign: "center",
                margin: 0,
                padding: "0 16px",
              }}
            >
              EDGE
            </p>
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-10 flex items-center gap-3">
            {["01", "02", "03"].map((n, i) => (
              <span
                key={n}
                style={{ fontSize: "10px", letterSpacing: "0.08em", color: i === 0 ? "#444" : "#bbb" }}
              >
                {n}
              </span>
            ))}
          </div>

          {/* Designed by credit */}
          <div className="absolute bottom-6 right-10">
            <span style={{ fontSize: "10px", letterSpacing: "0.08em", color: "#bbb" }}>
              by <span style={{ color: "#888", fontWeight: 600 }}>Leisure Audio</span>
            </span>
          </div>
        </section>

        {/* ── 02  PHILOSOPHY ── */}
        <section
          className="v5-sec flex h-dvh flex-col justify-center"
          style={{ background: "#fff", padding: "80px clamp(24px,8vw,120px)" }}
        >
          <p
            style={{
              fontSize: "clamp(20px, 3.4vw, 46px)",
              fontWeight: 300,
              color: "#c0c0c0",
              lineHeight: 1.35,
              maxWidth: "840px",
            }}
          >
            {product.description}
          </p>

          {/* Color pickers */}
          <div style={{ marginTop: "60px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "28px" }}>
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setCidx(i)}
                style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <span
                  style={{
                    display: "block",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: c.hex,
                    boxShadow: cidx === i
                      ? `0 0 0 2px #fff, 0 0 0 4px ${c.hex}`
                      : "0 0 0 1px rgba(0,0,0,0.15)",
                    transition: "box-shadow 0.2s",
                  }}
                />
                <span style={{ fontSize: "10px", letterSpacing: "0.12em", color: "#b0b0b0" }}>
                  {c.name.toUpperCase()}
                </span>
              </button>
            ))}

            {/* Variants label */}
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ fontSize: "10px", letterSpacing: "0.15em", color: "#d0d0d0" }}>STARTING AT</p>
              <p style={{ marginTop: "4px", fontSize: "24px", fontWeight: 700, color: "#111" }}>
                {inr.format(product.price)}
              </p>
            </div>
          </div>

          {/* Spec pills */}
          <div style={{ marginTop: "40px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {product.specs.slice(0, 4).map((s) => (
              <span
                key={s.label}
                style={{
                  padding: "6px 14px",
                  background: "#f5f5f5",
                  borderRadius: "100px",
                  fontSize: "10px",
                  letterSpacing: "0.06em",
                  color: "#888",
                }}
              >
                {s.label}: <strong style={{ color: "#444" }}>{s.value}</strong>
              </span>
            ))}
          </div>
        </section>

        {/* ── 03  COLOR SPLIT ── */}
        <section className="v5-sec relative flex h-dvh items-center overflow-hidden">
          {/* Left half — dark */}
          <div className="absolute inset-y-0 left-0 w-1/2" style={{ background: "#1a1e24" }} />
          {/* Right half — warm */}
          <div className="absolute inset-y-0 right-0 w-1/2" style={{ background: "#c6b49a" }} />

          {/* Speaker centered */}
          <div
            className="relative z-10 mx-auto"
            style={{ width: "min(600px, 70vw)", height: "min(340px, 44vh)" }}
          >
            <Image
              key={`split-${color.folderSlug}`}
              src={productImg(color.folderSlug, 1)}
              alt="EDGE color split"
              fill
              style={{ objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }}
              className="v5-img-fade"
            />
          </div>

          {/* Big overlay text — thin tracked */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p
              style={{
                fontSize: "clamp(36px, 8.5vw, 110px)",
                fontWeight: 100,
                letterSpacing: "0.28em",
                color: "rgba(255,255,255,0.55)",
                textAlign: "center",
                mixBlendMode: "overlay",
                lineHeight: 1,
              }}
            >
              SOUND YOUR WAY
            </p>
          </div>

          {/* Color dots overlay bottom */}
          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-4">
            {product.colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setCidx(i)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: c.hex,
                  border: "none",
                  cursor: "pointer",
                  outline: cidx === i ? `2px solid rgba(255,255,255,0.7)` : "none",
                  outlineOffset: "3px",
                  transition: "outline 0.2s",
                }}
              />
            ))}
          </div>
        </section>

        {/* ── 04  FEATURES CALLOUT ── */}
        <section
          className="v5-sec relative flex h-dvh items-center overflow-hidden"
          style={{ background: "#e8ecef" }}
        >
          {/* Speaker — large left */}
          <div
            style={{
              position: "absolute",
              left: "-2%",
              top: 0,
              bottom: 0,
              width: "55%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: "70%" }}>
              <Image
                key={`feat-${color.folderSlug}`}
                src={productImg(color.folderSlug, 1)}
                alt="EDGE features"
                fill
                style={{ objectFit: "contain", objectPosition: "left center" }}
                className="v5-img-fade"
              />
            </div>
          </div>

          {/* Callout annotations — right */}
          <div
            style={{
              position: "absolute",
              right: "5%",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: "48px",
            }}
          >
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12h8M12 8v8" />
                  </svg>
                ),
                title: "Fabric mesh grille.",
                desc: "Woven acoustic fabric disperses\nsound evenly in every direction.",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                title: "50W multi-driver array.",
                desc: "Dual tweeters + dual 58mm bass\ndrivers — room-filling clarity.",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                    <path d="M2 8h3l2-3h10l2 3h3v11H2z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                ),
                title: "5-in-1 connectivity.",
                desc: "BT / AUX / USB / TWS / Optical —\nconnect anything, anywhere.",
              },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        display: "block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        border: "1px solid #aaa",
                        background: "#fff",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ display: "block", width: "64px", height: "1px", background: "#c0c0c0" }} />
                  </div>
                  {item.icon}
                </div>
                <h3 style={{ marginTop: "10px", fontSize: "13px", fontWeight: 600, color: "#333", letterSpacing: "0.02em" }}>
                  {item.title}
                </h3>
                <p style={{ marginTop: "4px", fontSize: "11px", lineHeight: 1.7, color: "#999", whiteSpace: "pre-line", maxWidth: "220px" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 05  DIMENSIONS ── */}
        <section
          className="v5-sec relative flex h-dvh items-center justify-center overflow-hidden"
          style={{ background: "#e8ecef" }}
        >
          {/* Colour orbs */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,160,160,0.5), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "60px", right: 0, width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(160,220,160,0.45), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "60px", right: "40px", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, rgba(160,160,240,0.4), transparent 70%)", pointerEvents: "none" }} />

          {/* Dashed container + product */}
          <div style={{ position: "relative", width: "min(780px, 88vw)", height: "min(420px, 56vh)" }}>
            <div
              style={{
                position: "absolute",
                top: "12%",
                left: "8%",
                right: "8%",
                bottom: "12%",
                border: "1px dashed rgba(0,0,0,0.16)",
                borderRadius: "4px",
              }}
            />
            <Image
              key={`dim-${color.folderSlug}`}
              src={productImg(color.folderSlug, 1)}
              alt="EDGE dimensions"
              fill
              style={{ objectFit: "contain", padding: "10%" }}
              className="v5-img-fade"
            />

            {/* Dimension labels */}
            <div style={{ position: "absolute", top: "10%", left: "10%", fontSize: "11px", color: "#aaa" }}>
              <div style={{ fontWeight: 600, color: "#777", letterSpacing: "0.04em" }}>W – Width</div>
              <div style={{ marginTop: "2px" }}>500 mm</div>
            </div>
            <div style={{ position: "absolute", bottom: "8%", left: "10%", fontSize: "11px", color: "#aaa" }}>
              <div style={{ fontWeight: 600, color: "#777", letterSpacing: "0.04em" }}>H – Height</div>
              <div style={{ marginTop: "2px" }}>94 mm</div>
            </div>
            <div style={{ position: "absolute", top: "28%", right: "1%", fontSize: "11px", color: "#aaa", textAlign: "right" }}>
              <div style={{ fontWeight: 600, color: "#777", letterSpacing: "0.04em" }}>D – Depth</div>
              <div style={{ marginTop: "2px" }}>93 mm</div>
            </div>
          </div>

          {/* Weight label */}
          <div style={{ position: "absolute", bottom: "28px", left: "0", right: "0", textAlign: "center", fontSize: "10px", letterSpacing: "0.18em", color: "#bbb" }}>
            PRODUCT WEIGHT — 2.17 KG
          </div>
        </section>

        {/* ── 06  ATMOSPHERIC DARK ── */}
        <section
          className="v5-sec relative flex h-dvh items-center justify-center overflow-hidden"
          style={{ background: "#090909" }}
        >
          {/* Gold glow */}
          <div
            style={{
              position: "absolute",
              width: "55vw",
              height: "55vw",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(251,237,43,0.16), transparent 65%)",
              animation: "v5-glow-pulse 3.2s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Speaker */}
          <div style={{ position: "relative", zIndex: 1, width: "min(700px, 82vw)", height: "min(400px, 50vh)" }}>
            <Image
              src={productImg("black", 1)}
              alt="EDGE atmospheric"
              fill
              style={{ objectFit: "contain", filter: "brightness(0.9)" }}
            />
          </div>

          {/* Tagline */}
          <div style={{ position: "absolute", bottom: "60px", left: 0, right: 0, textAlign: "center" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)" }}>
              SLEEK LOOK. UNSTOPPABLE SOUND.
            </p>
          </div>
        </section>

        {/* ── 07  BRAND CLOSER ── */}
        <section
          className="v5-sec relative flex h-dvh items-center justify-center overflow-hidden"
          style={{ background: "#06060a" }}
        >
          {/* Silhouette */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "min(820px, 92vw)", height: "min(440px, 54vh)" }}>
              <Image
                src={productImg("black", 1)}
                alt="Leisure EDGE"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "center bottom",
                  filter: "brightness(0.08) contrast(2)",
                  mixBlendMode: "luminosity",
                }}
              />
            </div>
          </div>

          {/* Brand + CTA */}
          <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
            <p style={{ fontSize: "11px", letterSpacing: "0.55em", color: "rgba(255,255,255,0.25)", marginBottom: "32px" }}>
              LEISURE.
            </p>
            <p style={{ fontSize: "clamp(10px, 1.2vw, 13px)", letterSpacing: "0.3em", color: "rgba(255,255,255,0.15)", marginBottom: "48px" }}>
              EDGE — SLEEK LOOK. UNSTOPPABLE SOUND.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <Link
                href="/product/edge"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "#fbed2b",
                  color: "#111",
                  padding: "14px 32px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                EXPLORE EDGE →
              </Link>
              <Link
                href="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.5)",
                  padding: "14px 32px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  fontWeight: 400,
                  textDecoration: "none",
                }}
              >
                VIEW ALL SPEAKERS
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
