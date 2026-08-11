"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import ProductShowcase from "@/components/sections/ProductShowcase";
import ParallaxGrid from "@/components/sections/ParallaxGrid";
import TestimonialSection from "@/components/sections/TestimonialSection";
import MarqueeBand from "@/components/sections/MarqueeBand";
import RevolveShowcase from "@/components/sections/RevolveShowcase";
import LiquidEtherHero from "@/components/sections/LiquidEtherHero";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// End the scrub on the branded hero (~179); a separate overlay handles a
// slow, smooth fade to black (later frames fade too fast on their own).
const FRAME_COUNT = 179;
// Bump when the frames are re-exported, to bust the browser cache.
const FRAME_VERSION = 4;
const framePath = (i: number) =>
  `/frames/frame_${String(i).padStart(4, "0")}.jpg?v=${FRAME_VERSION}`;

// Scroll distance (in viewport-heights) for each phase of the pinned stage,
// measured from the container's top. SCRUB_VH: video plays. FADE_VH: fades
// to black after that. HOLD_VH: the stage stays genuinely pinned (truly
// motionless, full-screen black — not just faded) for this much extra
// scroll past FADE_VH, before the next section is allowed to appear.
// TRANSITION_VH is NOT extra pause time — it's the one-viewport-height of
// scroll GSAP's own unpin mechanics need to hand off to normal document
// flow (see pinTrigger below). It must stay exactly 100; shrinking it just
// makes MarqueeBand/RevolveShowcase peek in from the bottom edge before the
// screen has finished being solid black.
const SCRUB_VH = 644; // 92% of the original 700vh track
const FADE_VH = 700;
const HOLD_VH = 50;
const TRANSITION_VH = 100;
const TOTAL_VH = FADE_VH + HOLD_VH + TRANSITION_VH;

/**
 * Full-screen scroll-scrubbed video, rendered as a preloaded image sequence
 * drawn to a <canvas>. Scrolling top -> bottom plays the whole clip
 * frame-by-frame. Canvas avoids the seek-jank of scrubbing a <video>.
 */
export default function LandingExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const stage = stageRef.current;
      const fade = fadeRef.current;
      const hero = heroRef.current;
      if (!canvas || !container || !stage || !fade || !hero) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const images: HTMLImageElement[] = [];
      const state = { frame: 0 };

      const setCanvasSize = () => {
        // Size the backing store to the canvas's ACTUAL display box (not the
        // window) so the image never stretches, regardless of scrollbars.
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      };

      const render = () => {
        const img = images[Math.round(state.frame)];
        if (!img || !img.complete || !img.naturalWidth) return;
        const cw = canvas.width;
        const ch = canvas.height;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, cw, ch);
        // object-fit: cover — fill the whole viewport (full-bleed, no bars).
        const ir = img.naturalWidth / img.naturalHeight;
        const cr = cw / ch;
        let dw: number, dh: number, dx: number, dy: number;
        if (cr > ir) {
          // viewport wider than frame -> fill width, crop top/bottom
          dw = cw;
          dh = cw / ir;
          dx = 0;
          dy = (ch - dh) / 2;
        } else {
          // viewport taller than frame -> fill height, crop sides
          dh = ch;
          dw = ch * ir;
          dy = 0;
          dx = (cw - dw) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
      };

      setCanvasSize();

      // Smooth (inertia) scrolling, synced to GSAP's ticker + ScrollTrigger.
      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        wheelMultiplier: 0.85,
        touchMultiplier: 1.1,
      });
      lenis.on("scroll", ScrollTrigger.update);
      const tickerFn = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      let firstLoaded = false;
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = framePath(i);
        if (i === 1) {
          img.onload = () => {
            if (!firstLoaded) {
              firstLoaded = true;
              render();
              ScrollTrigger.refresh();
            }
          };
        }
        images.push(img);
      }

      // Pin the video's visual stage for the container's full height, then
      // release with ZERO extra scroll. Plain CSS `position: sticky` (the
      // previous approach) can't do this: unsticking always costs an extra
      // viewportHeight of scroll for the child to physically scroll past —
      // the same as any real block element.
      // GSAP's own unpin also has a version of this cost: when it releases,
      // it freezes the stage in place with a landing transform for one more
      // viewportHeight of scroll before the page's normal flow fully carries
      // it away — otherwise that frozen, still-opaque stage sits on top of
      // MarqueeBand/RevolveShowcase, hiding them. Ending the pin one
      // viewportHeight before the container's true bottom makes that frozen
      // tail play out INSIDE the container's own remaining height instead of
      // bleeding into the next section.
      const pinTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: () => `+=${container.offsetHeight - window.innerHeight}`,
        pin: stage,
        pinSpacing: false,
      });

      // Video plays across the first SCRUB_VH of the pin, settling on the
      // hero. Pixel offsets (not "X% top") so growing the container for the
      // HOLD_VH pause below doesn't also stretch out the video/fade timing.
      const tween = gsap.to(state, {
        frame: FRAME_COUNT - 1,
        ease: "none",
        snap: "frame",
        onUpdate: render,
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${(SCRUB_VH / 100) * window.innerHeight}`,
          scrub: 1,
        },
      });

      // Fades to black over the held hero shot, completing at FADE_VH. The
      // remaining HOLD_VH of scroll (up to the container's true end) then
      // just holds on that solid black before the next section appears —
      // the pin's landing transform (see pinTrigger below) keeps the stage
      // visually frozen in place through that whole stretch.
      const fadeTween = gsap.fromTo(
        fade,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: container,
            start: () => `top+=${(SCRUB_VH / 100) * window.innerHeight}px top`,
            end: () => `top+=${(FADE_VH / 100) * window.innerHeight}px top`,
            scrub: 1,
          },
        }
      );

      // First ~8% of the track: the liquid-ether hero fades off, revealing the
      // video behind it. autoAlpha (not plain opacity) so the faded-out
      // overlay stops swallowing the cursor once it's invisible.
      const heroTween = gsap.to(hero, {
        autoAlpha: 0,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "8% top",
          scrub: 1,
        },
      });

      // Once it's fully gone, drop it out of layout entirely. LiquidEther only
      // pauses its WebGL loop when its container has no box — visibility:hidden
      // still reads as "intersecting", and this sticky stage stays on screen
      // for the full 800vh, so without this the sim would run the whole way.
      // onEnter/onLeaveBack are symmetric, so scrolling back up restores it.
      const heroToggle = ScrollTrigger.create({
        trigger: container,
        start: "9% top",
        onEnter: () => gsap.set(hero, { display: "none" }),
        onLeaveBack: () => gsap.set(hero, { display: "" }),
      });

      const onResize = () => {
        setCanvasSize();
        render();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      return () => {
        pinTrigger.kill();
        tween.scrollTrigger?.kill();
        tween.kill();
        fadeTween.scrollTrigger?.kill();
        fadeTween.kill();
        heroTween.scrollTrigger?.kill();
        heroTween.kill();
        heroToggle.kill();
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(tickerFn);
        lenis.destroy();
      };
    },
    { scope: containerRef }
  );

  return (
    <>
      {/* Scroll track: its height IS the pin's scroll distance (see the
          pinTrigger's pinSpacing:false above) — no extra height needed for
          an "unstick" tail the way CSS position:sticky would require. The
          video scrubs and fades to black within the first FADE_VH of this;
          the remaining HOLD_VH is a deliberate pause on solid black before
          the next section appears. */}
      <div
        ref={containerRef}
        className="relative w-full bg-black"
        style={{ height: `${TOTAL_VH}vh` }}
      >
        {/* z-10: GSAP's pin sets this to position:fixed, which drops it out
            of normal document flow — unlike the old sticky approach, it's no
            longer constrained to its own document position, so once later
            sections (MarqueeBand, RevolveShowcase — both position:relative)
            scroll into view, they'd otherwise paint OVER this on z-index:auto
            DOM order alone, showing through the still-pinned video. Kept
            below Nav's z-50 so nav stays clickable throughout. */}
        <div ref={stageRef} className="relative z-10 h-screen w-full overflow-hidden">
          <canvas ref={canvasRef} className="block h-full w-full" />
          {/* Smooth fade-to-black overlay (driven by scroll, last ~20%). */}
          <div
            ref={fadeRef}
            className="pointer-events-none absolute inset-0 bg-black opacity-0"
          />
          {/* Liquid-ether hero, laid OVER the video's first frames. Fades out
              on scroll (see heroTween) to reveal the video underneath. */}
          <div ref={heroRef} className="absolute inset-0">
            <LiquidEtherHero />
          </div>
        </div>
      </div>

      {/* Marquee band — visual bridge after the video's black fade-out */}
      <MarqueeBand />

      {/* Revolving speaker showcase — 3 scenes: turn, recolour, swap sides */}
      <RevolveShowcase />

      {/* Section 2 — branded product showcase */}
      <section id="section-2" className="relative w-full">
        <ParallaxGrid />
        <ProductShowcase />
        <TestimonialSection />
      </section>
    </>
  );
}
