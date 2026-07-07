"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Pinned guided feature tour. As you scroll, the centered 3D model eases through
// each stop's orientation (scroll.focusRX/RY) while that stop's title + copy
// fades in. Mirrors the site's RevolveShowcase idea, driven by the real model.
export default function FeatureSequence() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const texts = useRef<HTMLDivElement[]>([]);
  const stops = product.featureStops ?? [];
  const header = product.featureFocus;

  useEffect(() => {
    if (!stops.length) return;
    const n = stops.length;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${n * 110}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const p = clamp01(self.progress);
          // trapezoid: ease the model in at the start, hold, ease out at the end
          scroll.focus = clamp01(Math.min(p / 0.1, (1 - p) / 0.1, 1));

          // position along the stops and interpolate orientation
          const pos = p * (n - 1);
          const i0 = Math.min(Math.floor(pos), n - 1);
          const i1 = Math.min(i0 + 1, n - 1);
          const t = smooth(pos - i0);
          scroll.focusRX = stops[i0].rx + (stops[i1].rx - stops[i0].rx) * t;
          scroll.focusRY = stops[i0].ry + (stops[i1].ry - stops[i0].ry) * t;
          const x0 = stops[i0].x ?? 0;
          const x1 = stops[i1].x ?? 0;
          scroll.focusX = x0 + (x1 - x0) * t;

          // fade the nearest stop's text in; others out
          for (let i = 0; i < n; i++) {
            const op = clamp01(1 - Math.abs(pos - i) * 1.6);
            const el = texts.current[i];
            if (el) {
              el.style.opacity = String(op);
              el.style.transform = `translate(-50%, ${(1 - op) * 18}px)`;
            }
          }
        },
      });
    }, root);
    return () => {
      scroll.focus = 0;
      ctx.revert();
    };
  }, [stops]);

  if (!stops.length) return null;

  return (
    <section className="featureseq" ref={root}>
      {header && (
        <div className="featureseq__head">
          <span className="eyebrow">{header.eyebrow}</span>
          <h2 className="featureseq__caption">{header.caption}</h2>
        </div>
      )}

      <div className="featureseq__stops">
        {stops.map((s, i) => (
          <div
            key={s.title}
            className="featureseq__stop"
            ref={(el) => {
              if (el) texts.current[i] = el;
            }}
          >
            <h3 className="featureseq__title">{s.title}</h3>
            <p className="featureseq__copy">{s.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
