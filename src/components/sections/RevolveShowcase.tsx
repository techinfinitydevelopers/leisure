"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Scene = {
  tag: string;
  title: string;
  body: string;
  textSide: "left" | "right";
  vy: string;
  x: number; // xPercent
  y: number; // yPercent
  tilt: number; // rotationZ deg
  tint: string; // rgba tint (0 alpha = natural)
  glow: string;
};

const SCENES: Scene[] = [
  {
    tag: "01 — Engineered Sound",
    title: "Crafted to move you",
    body: "Hand-tuned drivers and a sealed acoustic chamber push sound that's warm, weighted, and unmistakably alive — from the first note to the last.",
    textSide: "left",
    vy: "44%",
    x: 46,
    y: -12,
    tilt: -5,
    tint: "rgba(255,255,255,0)",
    glow: "rgba(251,237,43,0.18)",
  },
  {
    tag: "02 — Sunset Ember",
    title: "Turn it, own it",
    body: "Grab the strap and go. Every angle catches the light differently — pick the finish that sounds like you and take it anywhere.",
    textSide: "right",
    vy: "52%",
    x: -46,
    y: 4,
    tilt: 4,
    tint: "rgba(255,110,24,0.85)",
    glow: "rgba(255,138,42,0.22)",
  },
  {
    tag: "03 — Wild Green",
    title: "Made to roam",
    body: "Rugged, weather-ready, and rated for days off the charger. Follow the moment — beach, balcony, or somewhere off the map.",
    textSide: "left",
    vy: "62%",
    x: 46,
    y: 24,
    tilt: -4,
    tint: "rgba(40,190,118,0.8)",
    glow: "rgba(74,222,128,0.16)",
  },
];

// Pre-extracted 360° frames of the real Legend speaker (scrubbed for rotation).
const FRAME_COUNT = 121;
const framePath = (i: number) =>
  `/products/legend360/frame_${String(i).padStart(4, "0")}.jpg`;

export default function RevolveShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tint = useRef<HTMLDivElement>(null);
  const texts = useRef<HTMLDivElement[]>([]);
  const glow = useRef<HTMLDivElement>(null);
  const progressTarget = useRef(0);

  useGSAP(
    () => {
      if (!root.current || !stage.current || !canvas.current) return;
      const cvs = canvas.current;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const images: HTMLImageElement[] = [];

      const setSize = () => {
        cvs.width = cvs.clientWidth * dpr;
        cvs.height = cvs.clientHeight * dpr;
      };

      // object-cover draw of a frame into the square canvas.
      const draw = (idx: number) => {
        const img = images[idx];
        if (!img || !img.complete || !img.naturalWidth) return;
        const cw = cvs.width;
        const ch = cvs.height;
        ctx.clearRect(0, 0, cw, ch);
        const ir = img.naturalWidth / img.naturalHeight;
        const cr = cw / ch;
        let dw: number, dh: number, dx: number, dy: number;
        if (cr > ir) {
          dw = cw;
          dh = cw / ir;
          dx = 0;
          dy = (ch - dh) / 2;
        } else {
          dh = ch;
          dw = ch * ir;
          dy = 0;
          dx = (cw - dw) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
      };

      setSize();
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const im = new Image();
        im.src = framePath(i);
        if (i === 1) im.onload = () => draw(0);
        images.push(im);
      }

      // Initial state
      gsap.set(spinner.current, {
        xPercent: SCENES[0].x,
        yPercent: SCENES[0].y,
        rotationZ: SCENES[0].tilt,
      });
      gsap.set(tint.current, { backgroundColor: SCENES[0].tint });
      gsap.set(glow.current, { backgroundColor: SCENES[0].glow });
      texts.current.forEach((el, i) =>
        gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 })
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressTarget.current = self.progress;
          },
        },
      });

      // Smoothly ease the rotation frame toward the scroll target.
      let shown = 0;
      let lastIdx = -1;
      const tick = () => {
        const target = progressTarget.current * (FRAME_COUNT - 1);
        shown += (target - shown) * 0.16;
        const idx = Math.round(shown);
        if (idx !== lastIdx) {
          draw(idx);
          lastIdx = idx;
        }
      };
      gsap.ticker.add(tick);

      const travel = (from: number, to: number, at: string) => {
        tl
          .to(
            spinner.current,
            {
              xPercent: SCENES[to].x,
              yPercent: SCENES[to].y,
              rotationZ: SCENES[to].tilt,
              ease: "power2.inOut",
              duration: 2.6,
            },
            at
          )
          .to(
            tint.current,
            { backgroundColor: SCENES[to].tint, ease: "power1.inOut", duration: 2.4 },
            at + "+=0.2"
          )
          .to(glow.current, { backgroundColor: SCENES[to].glow, duration: 2.4 }, at)
          .to(
            texts.current[from],
            { autoAlpha: 0, y: -24, ease: "power1.in", duration: 0.9 },
            at
          )
          .fromTo(
            texts.current[to],
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, ease: "power2.out", duration: 1 },
            at + "+=1.3"
          );
      };

      tl.addLabel("s0").to({}, { duration: 1.2 });
      tl.addLabel("t1");
      travel(0, 1, "t1");
      tl.to({}, { duration: 1.5 }, ">");
      tl.addLabel("t2");
      travel(1, 2, "t2");
      tl.to({}, { duration: 3 }, ">");

      const onResize = () => {
        setSize();
        lastIdx = -1;
      };
      window.addEventListener("resize", onResize);

      ScrollTrigger.refresh();

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative h-[420vh] w-full bg-black"
      aria-label="Speaker showcase"
    >
      <div ref={stage} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient backdrop */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_55%_45%_at_50%_18%,rgba(251,237,43,0.05),transparent_60%)]" />
        {/* Colour-shifting glow behind the speaker */}
        <div
          ref={glow}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[54vh] max-h-[500px] w-[54vh] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        />

        {/* Section eyebrow */}
        <div className="absolute left-1/2 top-9 z-10 -translate-x-1/2 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-gold/70">
            One Speaker · Infinite Moments
          </p>
        </div>

        {/* Real speaker frame-sequence — scrubbed on scroll, recoloured per stop */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            ref={spinner}
            className="relative aspect-square w-[72vw] max-w-[500px] sm:w-[50vw] md:w-[40vw]"
            style={{
              isolation: "isolate",
              willChange: "transform",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 50%, #000 50%, transparent 74%)",
              maskImage:
                "radial-gradient(circle at 50% 50%, #000 50%, transparent 74%)",
            }}
          >
            <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
            {/* Colour tint — black frame bg stays black under 'color' blend */}
            <div ref={tint} className="absolute inset-0 mix-blend-color" />
          </div>
        </div>

        {/* Write-ups (one visible per stop) */}
        {SCENES.map((s, i) => (
          <div
            key={s.tag}
            ref={(el) => {
              if (el) texts.current[i] = el;
            }}
            style={{ top: s.vy }}
            className={`pointer-events-none absolute z-10 w-[80%] max-w-sm -translate-y-1/2 ${
              s.textSide === "left"
                ? "left-[6%] text-left md:left-[8%]"
                : "right-[6%] text-right md:right-[8%]"
            }`}
          >
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-gold">
              {s.tag}
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-offwhite sm:text-5xl">
              {s.title}
            </h2>
            <p
              className={`mt-5 text-base leading-relaxed text-offwhite/65 ${
                s.textSide === "right" ? "ml-auto" : ""
              }`}
            >
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
