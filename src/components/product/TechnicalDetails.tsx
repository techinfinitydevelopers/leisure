"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";
import SpecRow from "./SpecRow";

gsap.registerPlugin(ScrollTrigger);

// Model poses cycled per spec — front, 3/4, top, side, 3/4 — all parked right.
const POSES = [
  { ry: 0, rx: 0, s: 0.66 },
  { ry: -0.7, rx: -0.15, s: 0.66 },
  { ry: 0, rx: 1.0, s: 0.62 },
  { ry: -1.4, rx: 0, s: 0.66 },
  { ry: 0.7, rx: -0.15, s: 0.66 },
];
const HOLD_X = 0.26; // model parked on the right (kept in-frame), opposite the spec list

function TechnicalSplit() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const rows = product.technical;

  useEffect(() => {
    const el = root.current!;
    const n = rows.length;
    let idx = -1;
    const applyPose = (i: number) => {
      const p = POSES[i % POSES.length];
      scroll.holdX = HOLD_X;
      scroll.holdRY = p.ry;
      scroll.holdRX = p.rx;
      scroll.holdS = p.s;
      setActive(i);
    };
    // Guarded like a refcount (armed/disarm), not a bare +=1/-=1 on every
    // onToggle call — see FeatureDeepDive.tsx's arm/disarm for why an
    // unguarded increment/decrement (or a hard reset to 0) can leave
    // `scroll.holdCount` desynced if another pinned section's hold overlaps
    // this one's mount/unmount.
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      applyPose(idx < 0 ? 0 : idx);
      scroll.holdCount += 1;
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      scroll.holdCount -= 1;
    };
    const ctx = gsap.context(() => {
      // Pin the whole section so the spec list stays on the left for the entire
      // beat; the model (right) changes pose per spec as you scroll through.
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: `+=${n * 70}%`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onToggle: (self) => {
          if (self.isActive) arm();
          else disarm();
        },
        onUpdate: (self) => {
          const i = Math.min(n - 1, Math.max(0, Math.floor(self.progress * n)));
          if (i !== idx) {
            idx = i;
            applyPose(i);
          }
        },
      });
    }, root);
    return () => {
      disarm();
      scroll.holdRX = 0;
      ctx.revert();
    };
  }, [rows]);

  return (
    <section className="techsplit" id="technical" ref={root}>
      <div className="techsplit__inner">
        <span className="eyebrow">Under the hood</span>
        <h2 className="techsplit__title">Technical Details</h2>
        <ul className="techsplit__list">
          {rows.map((s, i) => (
            <li
              key={s.k}
              className={`techsplit__row${i === active ? " is-active" : ""}`}
            >
              <span className="techsplit__n">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="techsplit__k">{s.k}</span>
              <span className="techsplit__v">{s.v}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function TechnicalDetails() {
  const product = useProductExperience();

  if (product.technicalSplit) return <TechnicalSplit />;

  return (
    <section className="specs specs--tech" id="technical">
      <div className="specs__inner">
        <header className="specs__head">
          <span className="eyebrow">Under the hood</span>
          <h2 className="specs__title">Technical Details</h2>
        </header>
        <div className="specs__list">
          {product.technical.map((s, i) => (
            <SpecRow key={s.k} k={s.k} v={s.v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
