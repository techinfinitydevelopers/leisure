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
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function SpinStage() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const cfg = product.spinStage;
  const om = product.overviewModel;

  useEffect(() => {
    if (!cfg) return;
    // Overview's docked pose is pre-armed in the last stretch of the spin
    // (still pinned, still on-screen as the spin stage) so the turn toward
    // it has already caught up by the time the pin releases — otherwise
    // that turn visibly plays out AFTER Overview has scrolled into view,
    // reading as leftover speaker movement in the wrong section.
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      scroll.holdCount += 1;
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      scroll.holdCount -= 1;
    };
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=140%",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          scroll.spin = self.progress;
          if (om) {
            const t = clamp01((self.progress - 0.82) / 0.18);
            if (t > 0) {
              arm();
              scroll.holdX = om.x ?? 0.36;
              scroll.holdY = 0;
              scroll.holdRY = om.ry ?? 0;
              scroll.holdRX = 0;
              scroll.holdS = om.scale ?? 1;
            } else {
              disarm();
            }
          }
        },
        // release the spin once the section is gone so roam resumes
        onLeave: () => {
          scroll.spin = 0;
          disarm();
        },
        onLeaveBack: () => {
          scroll.spin = 0;
          disarm();
        },
      });
    }, root);
    return () => {
      scroll.spin = 0;
      disarm();
      ctx.revert();
    };
  }, [cfg, om]);

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
