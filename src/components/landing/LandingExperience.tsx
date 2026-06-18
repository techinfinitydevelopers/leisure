"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import ProductShowcase from "@/components/sections/ProductShowcase";
import ParallaxGrid from "@/components/sections/ParallaxGrid";
import TestimonialSection from "@/components/sections/TestimonialSection";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// End the scrub on the branded hero (~180); a separate overlay handles a
// slow, smooth fade to black (frames 181-193 fade too fast on their own).
const FRAME_COUNT = 180;
// Bump when the frames are re-exported, to bust the browser cache.
const FRAME_VERSION = 2;
const framePath = (i: number) =>
  `/frames/frame_${String(i).padStart(4, "0")}.jpg?v=${FRAME_VERSION}`;

/**
 * Full-screen scroll-scrubbed video, rendered as a preloaded image sequence
 * drawn to a <canvas>. Scrolling top -> bottom plays the whole clip
 * frame-by-frame. Canvas avoids the seek-jank of scrubbing a <video>.
 */
export default function LandingExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const fade = fadeRef.current;
      if (!canvas || !container || !fade) return;
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

      // Video plays across the first ~80% of the scroll, settling on the hero.
      const tween = gsap.to(state, {
        frame: FRAME_COUNT - 1,
        ease: "none",
        snap: "frame",
        onUpdate: render,
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "80% bottom",
          scrub: 1,
        },
      });

      // Last ~20%: a slow, smooth fade to black over the held hero shot.
      const fadeTween = gsap.fromTo(
        fade,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: container,
            start: "80% bottom",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      const onResize = () => {
        setCanvasSize();
        render();
      };
      window.addEventListener("resize", onResize);

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        fadeTween.scrollTrigger?.kill();
        fadeTween.kill();
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(tickerFn);
        lenis.destroy();
      };
    },
    { scope: containerRef }
  );

  return (
    <>
      {/* Tall scroll track: more height = slower, smoother per-scroll scrub.
          The video scrubs to its end (fully black) right as this ends. */}
      <div ref={containerRef} className="relative h-[1000vh] w-full bg-black">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas ref={canvasRef} className="block h-full w-full" />
          {/* Smooth fade-to-black overlay (driven by scroll, last ~20%). */}
          <div
            ref={fadeRef}
            className="pointer-events-none absolute inset-0 bg-black opacity-0"
          />
        </div>
      </div>

      {/* Section 2 — branded product showcase (seamless from the video's
          black fade-out). */}
      <section id="section-2" className="relative w-full">
        <ParallaxGrid />
        <ProductShowcase />
        <TestimonialSection />
      </section>
    </>
  );
}
