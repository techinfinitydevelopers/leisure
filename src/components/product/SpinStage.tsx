"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Pinned 360° flip-spin stage. The section pins; as you scroll through it,
// scroll.spin ramps 0 -> 1 and ProductPlane rotates the pinned product a full
// turn, swapping front/back textures at the edge-on points.
export default function SpinStage() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const cfg = product.spinStage;

  useEffect(() => {
    if (!cfg) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=140%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          scroll.spin = self.progress;
        },
      });
    }, root);
    return () => {
      scroll.spin = 0;
      ctx.revert();
    };
  }, [cfg]);

  if (!cfg) return null;

  return (
    <section className="spinstage" ref={root}>
      <div className="spinstage__caption">
        <span className="eyebrow">{cfg.eyebrow}</span>
        <h2 className="spinstage__title">{cfg.caption}</h2>
        <span className="spinstage__hint">Scroll to spin →</span>
      </div>
    </section>
  );
}
