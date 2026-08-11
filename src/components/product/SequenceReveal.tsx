"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { pushHide, popHide } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Scroll distance of the pin, as a multiple of the viewport height. MUST stay a
// number we turn into pixels ourselves — a percentage `end` string ("+=350%")
// resolves against the pinned container, and because pinSpacing grows that same
// container, every ScrollTrigger.refresh() would measure a taller element and
// compound the pin distance a little further on each refresh.
const SCROLL_VH = 3.5;
// Fraction of the scroll spent on the card -> full-bleed expansion. The frame
// sequence plays across the remaining (1 - EXPAND_END).
const EXPAND_END = 0.28;
// The stage fades out over the tail end of the pin. The section carries a
// -100vh bottom margin (see the CSS) so the next section starts exactly as the
// pin releases, but this 100vh stage still physically slides its own height out
// afterwards — opaque, on z-index 40, straight over the next section while that
// section is already running its own pinned scrub underneath. Fading the stage
// first means it slides away invisibly and the next section is never covered.
const FADE_START = 0.94;
// Below this viewport width we load the lighter mobile frame set.
const MOBILE_MAX_W = 768;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const framePath = (set: "desktop" | "mobile", i: number) =>
  `/products/dominator/legend-seq/${set}/frame_${String(i).padStart(3, "0")}.webp`;

export default function SequenceReveal() {
  const product = useProductExperience();
  const cfg = product.sequenceReveal;

  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progressPct, setProgressPct] = useState(0);
  const [ready, setReady] = useState(false);

  const captions = cfg?.captions ?? [];
  const frameCount = cfg?.frameCount ?? 120;

  useEffect(() => {
    if (!cfg) return;
    const el = root.current;
    const canvas = canvasRef.current;
    const stageEl = stage.current;
    if (!el || !canvas || !stageEl) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const set: "desktop" | "mobile" =
      window.innerWidth <= MOBILE_MAX_W ? "mobile" : "desktop";

    // ── frame preload ────────────────────────────────────────────────────────
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    let disposed = false;
    let current = -1;

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    const sizeCanvas = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const r = dpr();
      const bw = Math.round(w * r);
      const bh = Math.round(h * r);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
    };

    // cover-fit: scale to fill the canvas box, centre-crop the overflow
    const draw = (index: number) => {
      const img = images[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;
      ctx2d.fillStyle = "#000";
      ctx2d.fillRect(0, 0, cw, ch);
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number, dh: number;
      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
      } else {
        dh = ch;
        dw = ch * ir;
      }
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      current = index;
    };

    const redraw = () => {
      if (current >= 0) draw(current);
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(set, i);
      img.onload = () => {
        loaded += 1;
        if (disposed) return;
        setProgressPct(Math.round((loaded / frameCount) * 100));
        if (i === 1) {
          // first frame: paint the resting state as soon as it lands
          sizeCanvas();
          draw(0);
          setReady(true);
        }
        if (loaded === frameCount) ScrollTrigger.refresh();
      };
      img.onerror = () => {
        loaded += 1;
        if (!disposed) setProgressPct(Math.round((loaded / frameCount) * 100));
      };
      images.push(img);
    }

    // Recalculate the cover-fit crop against the canvas's own box (not the
    // window) so it stays correct while the card expands to full-bleed.
    const ro = new ResizeObserver(() => {
      sizeCanvas();
      redraw();
    });
    ro.observe(canvas);

    // ── reduced motion: straight to the resting full-bleed state ─────────────
    if (reduceMotion) {
      stageEl.style.setProperty("--seq-inset", "0%");
      stageEl.style.setProperty("--seq-radius", "0px");
      if (overlay.current) overlay.current.style.opacity = "1";
      captionRefs.current.forEach((c, i) => {
        if (c) c.style.opacity = i === 0 ? "1" : "0";
      });
      return () => {
        disposed = true;
        ro.disconnect();
      };
    }

    // ── scroll choreography ─────────────────────────────────────────────────
    let hidden = false;
    const armHide = () => {
      if (hidden) return;
      hidden = true;
      pushHide();
    };
    const disarmHide = () => {
      if (!hidden) return;
      hidden = false;
      popHide();
    };

    const applyProgress = (p: number) => {
      // phase 1 — inset card expands to full bleed, overlay fades in
      const expand = clamp01(p / EXPAND_END);
      stageEl.style.setProperty("--seq-inset", `${(1 - expand) * 6}%`);
      stageEl.style.setProperty("--seq-radius", `${(1 - expand) * 28}px`);
      if (overlay.current) overlay.current.style.opacity = String(expand);

      // hand off to the next section: fade the stage out before it starts
      // sliding over it (see FADE_START)
      stageEl.style.opacity = String(1 - clamp01((p - FADE_START) / (1 - FADE_START)));

      // phase 2 — linear scroll-to-frame lookup, no easing
      const play = clamp01((p - EXPAND_END) / (1 - EXPAND_END));
      const idx = Math.min(frameCount - 1, Math.floor(play * frameCount));
      if (idx !== current) draw(idx);

      // captions: each owns an equal slice of the playback phase and
      // fades in / holds / fades out inside it
      const n = captions.length;
      if (n) {
        const slice = 1 / n;
        captionRefs.current.forEach((node, i) => {
          if (!node) return;
          const local = (play - i * slice) / slice; // 0..1 inside my slice
          let o = 0;
          if (local > 0 && local < 1) {
            if (local < 0.25) o = local / 0.25;
            else if (local > 0.75) o = (1 - local) / 0.25;
            else o = 1;
          }
          node.style.opacity = String(o);
          node.style.transform = `translate3d(0, ${(1 - o) * 18}px, 0)`;
        });
      }
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      // fixed pixel distance, recomputed on refresh — never a percentage
      end: () => `+=${Math.round(window.innerHeight * SCROLL_VH)}`,
      // Pin the SECTION itself, not the stage child: .seqreveal is a fixed
      // 100vh box, so a spacer created inside it would have nowhere to grow
      // and the pin's scroll distance would collapse to zero (progress would
      // read 1 immediately and the pin would never engage).
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // NOTE: deliberately NOT given a raised refreshPriority. A global
      // ScrollTrigger.refresh() reverts every pin first (the page collapses to
      // its unpinned height) and then re-measures triggers in priority order,
      // highest first. This section sits mid-page with pinned sections ABOVE
      // it, so measuring it early read its position from the collapsed layout
      // (start landed ~4200px too high and the pin never engaged). Leaving the
      // priority at the default 0 means it refreshes in creation order, which
      // for sibling sections is DOM order: after the pins above it (so its
      // start is correct) and before the ones below (so their starts account
      // for this pin's spacer).
      onEnter: armHide,
      onEnterBack: armHide,
      onLeave: disarmHide,
      onLeaveBack: disarmHide,
      onUpdate: (self) => applyProgress(self.progress),
      onRefresh: (self) => applyProgress(self.progress),
    });

    applyProgress(st.progress);

    return () => {
      disposed = true;
      ro.disconnect();
      disarmHide();
      st.kill();
    };
  }, [cfg, frameCount, captions.length]);

  if (!cfg) return null;

  return (
    <section className="seqreveal" ref={root} id="sequence">
      <div className="seqreveal__stage" ref={stage}>
        <div className="seqreveal__frame">
          <canvas className="seqreveal__canvas" ref={canvasRef} />
          <div className="seqreveal__overlay" ref={overlay} />

          {captions.map((c, i) => (
            <div
              className="seqreveal__caption"
              key={c.text}
              ref={(node) => {
                captionRefs.current[i] = node;
              }}
            >
              {c.eyebrow && <span className="eyebrow">{c.eyebrow}</span>}
              <p className="seqreveal__caption-text">{c.text}</p>
            </div>
          ))}

          {!ready && (
            <div className="seqreveal__loader" aria-hidden="true">
              <span className="seqreveal__loader-bar">
                <span
                  className="seqreveal__loader-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
