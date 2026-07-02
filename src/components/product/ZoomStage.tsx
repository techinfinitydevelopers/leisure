"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Full-bleed "dive into the product" stage. As the section scrolls through the
// viewport, scroll.zoom ramps 0 -> 1 -> 0 (peak when centered), and ProductPlane
// reads it to dolly the product toward the viewer for a close-up, then back out.
export default function ZoomStage() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const cfg = (product as { zoomStage?: { eyebrow: string; caption: string } })
    .zoomStage;

  useEffect(() => {
    if (!cfg) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          // triangle: 0 at edges, 1 at center
          scroll.zoom = 1 - Math.abs(self.progress - 0.5) * 2;
        },
      });
    }, root);
    return () => {
      scroll.zoom = 0;
      ctx.revert();
    };
  }, [cfg]);

  if (!cfg) return null;

  return (
    <section className="zoomstage" ref={root}>
      <div className="zoomstage__caption">
        <span className="eyebrow">{cfg.eyebrow}</span>
        <h2 className="zoomstage__title">{cfg.caption}</h2>
      </div>
    </section>
  );
}
