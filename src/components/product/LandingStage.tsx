"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Pinned finale after the FAQ: an empty band where the roaming model glides to
// centre and rests, front-on, before the footer.
export default function LandingStage() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const cfg = product.landingStage;

  useEffect(() => {
    if (!cfg) return;
    // The model's journey ENDS here: it glides in and stays STUCK below the
    // caption for the whole finale — it does not scroll up and does not fade.
    let held = false;
    const hold = () => {
      scroll.productHide = 0; // ensure visible here (FAQ hides it just before)
      if (held) return;
      held = true;
      scroll.holdX = 0;
      scroll.holdY = -0.14; // sit a little below centre (under the caption)
      scroll.holdRY = 0;
      scroll.holdRX = 0.85; // tilt for a top-front view
      scroll.holdS = 1.0;
      scroll.holdCount += 1;
    };
    const release = () => {
      if (!held) return;
      held = false;
      scroll.holdY = 0;
      scroll.holdCount -= 1;
    };
    const footer = document.querySelector<HTMLElement>(".leisure-xp ~ footer");
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onEnter: hold,
        onEnterBack: hold,
        onLeaveBack: release, // only lets go if you scroll back UP above it
      });

      // The footer (z-index above the WebGL layer) slides up like a parallax
      // panel, covering the model that stays stuck in this section.
      if (footer) {
        gsap.fromTo(
          footer,
          { yPercent: 14 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "top 45%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, root);
    return () => {
      release();
      if (footer) gsap.set(footer, { yPercent: 0 });
      ctx.revert();
    };
  }, [cfg]);

  if (!cfg) return null;

  return (
    <section className="landing" ref={root}>
      <div className="landing__caption">
        <span className="eyebrow">{cfg.eyebrow}</span>
        <h2 className="landing__title">{cfg.caption}</h2>
      </div>
    </section>
  );
}
