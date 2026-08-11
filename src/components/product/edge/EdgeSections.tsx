"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll, pushHide, popHide, requestVisible } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// ─── 1. Stat Ribbon ─────────────────────────────────────────────────────
// Small band right after the hero. Model floats large-and-quiet behind while
// ribbon is on screen (holdRX top-tilt, holdS bigger scale).
export function EdgeStatRibbon() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const highlights = product.highlights ?? [];

  useEffect(() => {
    const el = trackRef.current;
    if (!el || highlights.length === 0) return;
    const tween = gsap.to(el, { xPercent: -50, ease: "none", duration: 40, repeat: -1 });
    return () => { tween.kill(); };
  }, [highlights.length]);

  // Hold model gently centred-back while ribbon is in view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      end: "bottom 10%",
      onToggle: (self) => {
        if (self.isActive) {
          scroll.holdX = 0;
          scroll.holdY = 0.05;
          scroll.holdRX = 0.25;
          scroll.holdRY = -0.15;
          scroll.holdS = 1.15;
          scroll.holdCount += 1;
        } else {
          scroll.holdCount -= 1;
        }
      },
    });
    return () => { st.kill(); scroll.holdCount = 0; };
  }, []);

  if (highlights.length === 0) return null;
  const pairs = highlights.map((h) => (h.label ? `${h.value} · ${h.label}` : h.value));
  const line = pairs.concat(pairs).concat(pairs).join("   ✦   ");

  return (
    <section className="edge-ribbon" aria-hidden="true" ref={rootRef}>
      <div className="edge-ribbon__track" ref={trackRef}>
        <span className="edge-ribbon__text">{line}</span>
        <span className="edge-ribbon__text">{line}</span>
      </div>
    </section>
  );
}

// ─── 2. Spin Stage (pinned 360°) ───────────────────────────────────────
// Like DRIFT's spin stage but styled full-black cinema with a minimalist band
// of chapter dots. The `scroll.spin` value comes from useProductScroll's
// SpinStage helper — we set it via ScrollTrigger here.
export function EdgeSpin() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=180%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => { scroll.spin = self.progress; },
        onEnter: () => { scroll.spin = 0.001; },
        onLeave: () => { scroll.spin = 0; },
        onEnterBack: () => { scroll.spin = 1; },
        onLeaveBack: () => { scroll.spin = 0; },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="edge-spin" ref={rootRef}>
      <div className="edge-spin__inner">
        <span className="eyebrow">Every angle</span>
        <h2 className="edge-spin__title">Turn it, tilt it, own it.</h2>
        <p className="edge-spin__note">Scroll to rotate</p>
        <div className="edge-spin__dots" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </div>
    </section>
  );
}

// ─── 3. Feature Tour (pinned, 3 stops) ──────────────────────────────────
// Model held large-and-centred. Text panels fade in one-by-one on the left as
// scroll progresses. Model rotates to each stop's pose (rx/ry/x).
export function EdgeFeatureTour() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const stops = product.featureStops ?? [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el || stops.length === 0) return;
    const panels = Array.from(el.querySelectorAll<HTMLDivElement>(".edge-tour__panel"));
    if (panels.length === 0) return;

    // Start each panel opaque=0; pin the whole section and drive the model
    // pose through per-stop segments.
    gsap.set(panels, { opacity: 0, y: 30 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=260%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Progress within the pinned band → which stop we're on
          const idx = Math.min(stops.length - 1, Math.floor(self.progress * stops.length));
          const stop = stops[idx];
          scroll.focus = 1;
          scroll.focusX = stop.x ?? 0.3;
          scroll.focusRX = stop.rx ?? 0;
          scroll.focusRY = stop.ry ?? 0;
          panels.forEach((p, i) => gsap.to(p, {
            opacity: i === idx ? 1 : 0,
            y: i === idx ? 0 : 30,
            duration: 0.35,
            overwrite: true,
          }));
        },
        onEnter: () => { scroll.focus = 1; },
        onLeave: () => { scroll.focus = 0; },
        onEnterBack: () => { scroll.focus = 1; },
        onLeaveBack: () => { scroll.focus = 0; },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [stops.length]);

  if (stops.length === 0) return null;

  return (
    <section className="edge-tour" ref={rootRef}>
      <div className="edge-tour__inner">
        <div className="edge-tour__left">
          <span className="eyebrow">A closer look</span>
          {stops.map((s, i) => (
            <div className="edge-tour__panel" key={s.title}>
              <div className="edge-tour__count">{String(i + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}</div>
              <h3 className="edge-tour__title">{s.title}</h3>
              <p className="edge-tour__copy">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 4. Colours Stack (3 vertical panels, model color-shifts) ──────────
// Each colour band is 100vh; as it enters view it triggers the shared
// scroll.colorIndex + pulls the model to a specific pose.
export function EdgeColoursStack({ onColor }: { onColor: (i: number) => void }) {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const bands = Array.from(el.querySelectorAll<HTMLDivElement>(".edge-cols__band"));
    const triggers: ScrollTrigger[] = [];
    bands.forEach((band, i) => {
      const t = ScrollTrigger.create({
        trigger: band,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) {
            onColor(i);
            scroll.holdX = i % 2 === 0 ? -0.28 : 0.28;
            scroll.holdY = 0;
            scroll.holdRX = 0;
            scroll.holdRY = i % 2 === 0 ? 0.4 : -0.4;
            scroll.holdS = 0.85;
            scroll.holdCount += 1;
          } else {
            scroll.holdCount -= 1;
          }
        },
      });
      triggers.push(t);
    });
    return () => { triggers.forEach((t) => t.kill()); scroll.holdCount = 0; };
  }, [onColor]);

  return (
    <section className="edge-cols" ref={rootRef}>
      {product.colors.map((c, i) => (
        <div className="edge-cols__band" key={c.id}>
          <div className={`edge-cols__body edge-cols__body--${i % 2 === 0 ? "left" : "right"}`}>
            <span className="edge-cols__num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="edge-cols__name">{c.name}</h3>
            <p className="edge-cols__copy">One EDGE, a finish for every room. Choose your mood.</p>
            <span className="edge-cols__chip" style={{ background: c.hex }} aria-hidden="true" />
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── 5. Anatomy (pinned, model centre + orbiting callouts) ──────────────
// Model held large in centre, small callouts fade in at four positions around
// it — like an exploded diagram without actually exploding.
export function EdgeAnatomy() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const cards = product.specs?.slice(0, 6) ?? [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll(".edge-ana__cal"));
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=140%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onEnter: () => {
          scroll.holdX = 0;
          scroll.holdY = 0;
          scroll.holdRX = 0.1;
          scroll.holdRY = -0.25;
          scroll.holdS = 1.2;
          scroll.holdCount += 1;
        },
        onEnterBack: () => {
          scroll.holdCount += 1;
        },
        onLeave: () => { scroll.holdCount -= 1; },
        onLeaveBack: () => { scroll.holdCount -= 1; },
      });
      gsap.from(items, {
        opacity: 0, y: 20, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 60%" },
      });
    }, rootRef);
    return () => { ctx.revert(); scroll.holdCount = 0; };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section className="edge-ana" ref={rootRef}>
      <div className="edge-ana__inner">
        <header className="edge-ana__head">
          <span className="eyebrow">The anatomy</span>
          <h2 className="edge-ana__title">Precision, top to bottom.</h2>
        </header>
        <div className="edge-ana__cals">
          {cards.map((s, i) => (
            <div className={`edge-ana__cal edge-ana__cal--${i}`} key={s.k}>
              <span className="edge-ana__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="edge-ana__k">{s.k}</span>
              <span className="edge-ana__v">{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 6. Deep Dive Magazine (rows with model rotation per row) ──────────
// Not the DRIFT-style alternating layout — instead a single-column magazine
// spread with pull-quote sized copy. Model rotates through 3-4 poses as rows
// come into view.
export function EdgeDeepDiveMag() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const dives = (product.deepDives ?? []).slice(0, 4);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || dives.length === 0) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".edge-mag__row"));
    const triggers: ScrollTrigger[] = [];
    rows.forEach((row, i) => {
      const t = ScrollTrigger.create({
        trigger: row,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => {
          if (self.isActive) {
            // Per-row pose: rotate the model to a distinct angle for each row.
            const angles = [
              { rx: 0, ry: -0.5, x: 0.35 },
              { rx: 0.4, ry: 0, x: -0.32 },
              { rx: 0, ry: 0.5, x: 0.35 },
              { rx: -0.2, ry: -0.15, x: -0.32 },
            ];
            const a = angles[i % angles.length];
            scroll.holdX = a.x;
            scroll.holdY = 0;
            scroll.holdRX = a.rx;
            scroll.holdRY = a.ry;
            scroll.holdS = 0.75;
            scroll.holdCount += 1;
          } else {
            scroll.holdCount -= 1;
          }
        },
      });
      triggers.push(t);
      gsap.from(row.querySelectorAll(".edge-mag__title, .edge-mag__copy"), {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.1,
        scrollTrigger: { trigger: row, start: "top 75%" },
      });
    });
    return () => { triggers.forEach((t) => t.kill()); scroll.holdCount = 0; };
  }, [dives.length]);

  if (dives.length === 0) return null;

  return (
    <section className="edge-mag" ref={rootRef}>
      <header className="edge-mag__head">
        <span className="eyebrow">Why EDGE</span>
        <h2 className="edge-mag__hero">Cinematic by design.</h2>
      </header>
      {dives.map((d, i) => (
        <div className={`edge-mag__row edge-mag__row--${i % 2 === 0 ? "left" : "right"}`} key={d.title}>
          <span className="edge-mag__no">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="edge-mag__title">{d.title}</h3>
          <p className="edge-mag__copy">{d.copy}</p>
        </div>
      ))}
    </section>
  );
}

// ─── 7. Specs Marquee ─────────────────────────────────────────────────
export function EdgeSpecsMarquee() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const specs = product.specs ?? [];

  useEffect(() => {
    const el = trackRef.current;
    if (!el || specs.length === 0) return;
    const tween = gsap.to(el, { xPercent: -50, ease: "none", duration: 55, repeat: -1 });
    return () => { tween.kill(); };
  }, [specs.length]);

  // Model shrinks and rests centre-behind while the marquee runs.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      end: "bottom 10%",
      onToggle: (self) => {
        if (self.isActive) {
          scroll.holdX = 0;
          scroll.holdY = -0.05;
          scroll.holdRX = 0.4;
          scroll.holdRY = 0;
          scroll.holdS = 0.55;
          scroll.holdCount += 1;
        } else {
          scroll.holdCount -= 1;
        }
      },
    });
    return () => { st.kill(); scroll.holdCount = 0; };
  }, []);

  if (specs.length === 0) return null;
  const chips = specs.map((s) => `${s.k}: ${s.v}`);
  const line = chips.concat(chips).join("   ›   ");

  return (
    <section className="edge-specs-m" aria-label="Specifications" ref={rootRef}>
      <div className="edge-specs-m__track" ref={trackRef}>
        <span className="edge-specs-m__text">{line}</span>
        <span className="edge-specs-m__text">{line}</span>
      </div>
    </section>
  );
}

// ─── 8. Box Strip (horizontal chip strip; model floats top-right) ──────
export function EdgeBoxStrip() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const items = product.box ?? [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "bottom 20%",
      onToggle: (self) => {
        if (self.isActive) {
          scroll.holdX = 0.28;
          scroll.holdY = 0.12;
          scroll.holdRX = -0.15;
          scroll.holdRY = -0.5;
          scroll.holdS = 0.55;
          scroll.holdCount += 1;
        } else {
          scroll.holdCount -= 1;
        }
      },
    });
    const tween = gsap.from(el.querySelectorAll(".edge-strip__chip"), {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.08,
      scrollTrigger: { trigger: el, start: "top 80%" },
    });
    return () => { st.kill(); tween.scrollTrigger?.kill(); tween.kill(); scroll.holdCount = 0; };
  }, []);

  if (items.length === 0) return null;
  return (
    <section className="edge-strip" ref={rootRef}>
      <header className="edge-strip__head">
        <span className="eyebrow">In the box</span>
        <h2 className="edge-strip__title">Everything you need.</h2>
      </header>
      <div className="edge-strip__row">
        {items.map((it, i) => (
          <div className="edge-strip__chip" key={it.name}>
            <span className="edge-strip__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="edge-strip__name">{it.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 9. FAQ Grid (2-column tiles, not accordion) ────────────────────────
export function EdgeFAQGrid() {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const items = product.faq ?? [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el || items.length === 0) return;
    // Hide model while FAQ is centre-stage — copy reads clean.
    let hidden = false;
    const armHide = () => { if (hidden) return; hidden = true; pushHide(); };
    const disarmHide = () => { if (!hidden) return; hidden = false; popHide(); };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: armHide,
      onEnterBack: armHide,
      onLeave: disarmHide,
      onLeaveBack: disarmHide,
    });
    const tween = gsap.from(el.querySelectorAll(".edge-faqg__cell"), {
      opacity: 0, y: 24, duration: 0.6, stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 75%" },
    });
    return () => { st.kill(); tween.scrollTrigger?.kill(); tween.kill(); disarmHide(); };
  }, [items.length]);

  if (items.length === 0) return null;
  return (
    <section className="edge-faqg" ref={rootRef} id="faq">
      <header className="edge-faqg__head">
        <span className="eyebrow">Good to know</span>
        <h2 className="edge-faqg__title">Questions, answered.</h2>
      </header>
      <div className="edge-faqg__grid">
        {items.map((q, i) => (
          <div className="edge-faqg__cell" key={q.q}>
            <span className="edge-faqg__n">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="edge-faqg__q">{q.q}</h3>
            <p className="edge-faqg__a">{q.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 10. CTA Band + Landing (model rests in final pose) ─────────────────
export function EdgeCtaBand({ onBuy }: { onBuy: () => void }) {
  const product = useProductExperience();
  const rootRef = useRef<HTMLElement>(null);
  const ls = product.landingStage;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Model returns to a hero-like resting pose above the CTA text.
    let held = false;
    const hold = () => {
      if (held) return;
      held = true;
      requestVisible();
      scroll.holdX = 0;
      scroll.holdY = 0.2;
      scroll.holdRX = 0.35;
      scroll.holdRY = -0.25;
      scroll.holdS = 0.9;
      scroll.holdCount += 1;
    };
    const release = () => {
      if (!held) return;
      held = false;
      scroll.holdCount -= 1;
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 30%",
      onToggle: (self) => { self.isActive ? hold() : release(); },
    });
    return () => { st.kill(); release(); };
  }, []);

  return (
    <section className="edge-cta" ref={rootRef}>
      <span className="eyebrow">{ls?.eyebrow ?? "Ready?"}</span>
      <h2 className="edge-cta__title">{ls?.caption ?? "Turn every night into a premiere."}</h2>
      <button type="button" className="edge-cta__btn" onClick={onBuy}>
        Buy {product.name} — {product.currency}
        {product.price.toLocaleString("en-IN")}
      </button>
    </section>
  );
}

// Legacy re-exports so callers of the old v1 names still compile — they map to
// the newer names above.
export const EdgeSoundStage = EdgeAnatomy;
export const EdgeCinemaCards = EdgeDeepDiveMag;
export const EdgeInputsGrid = EdgeAnatomy;
export const EdgeSilhouette = ({ onColor }: { colorIndex: number; onColor: (i: number) => void }) => (
  <EdgeColoursStack onColor={onColor} />
);
export const EdgeBox = EdgeBoxStrip;
export const EdgeFAQ = EdgeFAQGrid;
