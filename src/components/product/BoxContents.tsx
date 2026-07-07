"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Callout anchor points around the centred model (viewport %). `side` controls
// which way each label reads so it points inward toward the packshot.
const POSITIONS: { x: number; y: number; side: "left" | "right" }[] = [
  { x: 16, y: 34, side: "left" },
  { x: 84, y: 34, side: "right" },
  { x: 15, y: 68, side: "left" },
  { x: 85, y: 68, side: "right" },
  { x: 22, y: 50, side: "left" },
  { x: 78, y: 50, side: "right" },
];

export default function BoxContents() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const items = product.box;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let held = false;
    const hold = () => {
      if (held) return;
      held = true;
      scroll.holdX = 0;
      scroll.holdY = 0;
      scroll.holdRX = 0;
      scroll.holdRY = 0;
      scroll.holdS = 1.0;
      scroll.holdCount += 1;
    };
    const release = () => {
      if (!held) return;
      held = false;
      scroll.holdCount -= 1;
    };
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=120%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onToggle: (self) => (self.isActive ? hold() : release()),
        onUpdate: (self) => {
          // fade the callouts in through the middle of the pin
          const f = Math.sin(clamp01(self.progress) * Math.PI);
          overlay.current?.style.setProperty("--pk", String(f));
        },
      });
    }, root);
    return () => {
      release();
      ctx.revert();
    };
  }, [items]);

  return (
    <section className="packshot" id="box" ref={root}>
      <div className="packshot__head">
        <span className="eyebrow">What&apos;s inside</span>
        <h2 className="packshot__title">In the Box</h2>
      </div>

      <div className="packshot__callouts" ref={overlay}>
        {items.map((b, i) => {
          const p = POSITIONS[i % POSITIONS.length];
          return (
            <div
              key={b.name}
              className={`pk-callout pk-callout--${p.side}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span className="pk-callout__dot" />
              <span className="pk-callout__name">{b.name}</span>
              <span className="pk-callout__note">{b.note}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
