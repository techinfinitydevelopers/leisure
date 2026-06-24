"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// 3D scene is client-only (WebGL) — never SSR it.
const Speaker3D = dynamic(() => import("@/components/sections/Speaker3D"), {
  ssr: false,
});

type Scene = {
  tag: string;
  title: string;
  body: string;
  textSide: "left" | "right";
  /** Vertical centre of this stop (matches the speaker's height on screen). */
  vy: string;
  glow: string;
};

const SCENES: Scene[] = [
  {
    tag: "01 — Engineered Sound",
    title: "Crafted to move you",
    body: "Hand-tuned drivers and a sealed acoustic chamber push sound that's warm, weighted, and unmistakably alive — from the first note to the last.",
    textSide: "left",
    vy: "43%",
    glow: "rgba(251,237,43,0.18)",
  },
  {
    tag: "02 — Sunset Ember",
    title: "Turn it, own it",
    body: "Grab the strap and go. Every angle catches the light differently — pick the finish that sounds like you and take it anywhere.",
    textSide: "right",
    vy: "53%",
    glow: "rgba(255,138,42,0.22)",
  },
  {
    tag: "03 — Wild Green",
    title: "Made to roam",
    body: "Rugged, weather-ready, and rated for days off the charger. Follow the moment — beach, balcony, or somewhere off the map.",
    textSide: "left",
    vy: "63%",
    glow: "rgba(74,222,128,0.16)",
  },
];

export default function RevolveShowcase() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const texts = useRef<HTMLDivElement[]>([]);
  const glow = useRef<HTMLDivElement>(null);
  // Shared scroll progress (0..1) consumed by the 3D scene's render loop.
  const progress = useRef(0);

  useGSAP(
    () => {
      if (!root.current || !stage.current) return;

      texts.current.forEach((el, i) =>
        gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 })
      );
      gsap.set(glow.current, { backgroundColor: SCENES[0].glow });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          pin: stage.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        },
      });

      // Swap write-ups + ambient glow as the speaker travels (the 3D motion
      // itself is driven directly from `progress` inside Speaker3D).
      const swap = (from: number, to: number, at: string) => {
        tl
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

      tl.addLabel("s0").to({}, { duration: 1 });
      tl.addLabel("t1");
      swap(0, 1, "t1");
      tl.to({}, { duration: 1 }, ">");
      tl.addLabel("t2");
      swap(1, 2, "t2");
      tl.to({}, { duration: 1 }, ">");

      ScrollTrigger.refresh();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative h-[340vh] w-full bg-black"
      aria-label="Speaker showcase"
    >
      <div ref={stage} className="relative h-screen w-full overflow-hidden">
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

        {/* True 3D speaker (WebGL) — travels the path, revolves, recolours */}
        <Speaker3D progress={progress} />

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
