"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll, pushHide, popHide, requestVisible } from "@/lib/scrollStore";
import SpecRow from "./SpecRow";

export default function SpecsSection() {
  const product = useProductExperience();
  const pinRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const sm = product.specsModel;

  useEffect(() => {
    const el = pinRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const restX = sm?.x ?? 0;
    const FROM_X = 1.6; // off the right edge (model was hidden through Feature Grid)
    let held = false;
    const hold = () => {
      if (held) return;
      held = true;
      scroll.holdY = 0;
      scroll.holdRY = sm?.ry ?? 0;
      scroll.holdRX = 0;
      scroll.holdS = sm?.scale ?? 1;
      scroll.holdCount += 1;
    };
    const release = () => {
      if (!held) return;
      held = false;
      scroll.holdCount -= 1;
    };
    let hidden = false;
    const armHide = () => {
      if (hidden) return;
      hidden = true;
      pushHide();
    };
    const disarmHide = () => {
      if (!hidden) return;
      hidden = false;
      popHide();
    };
    const ctx = gsap.context(() => {
      if (sm) {
        // hold + reveal the model for the whole time Specs is in view
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => {
            requestVisible();
            scroll.holdX = FROM_X;
            hold();
          },
          onEnterBack: () => {
            requestVisible();
            hold();
          },
          onLeave: () => release(),
          onLeaveBack: () => release(),
        });
        // slide it IN from the right as the section rises into view — spread
        // over the full approach (top bottom -> top top) so it eases in slowly
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: (self) => {
            scroll.holdX = FROM_X + (restX - FROM_X) * self.progress;
          },
        });
      } else {
        // No specsModel configured for this product — the speaker doesn't
        // fit the design language of this section, so keep it fully hidden
        // for as long as Specifications is in view (mirrors FeatureGrid's
        // own hide-while-in-view pattern).
        // The window is measured in PIXELS, because none of ScrollTrigger's
        // keyword ranges describe how long this section is actually on
        // screen. The pin below runs "top top" -> "+=110%" with
        // pinSpacing:true, so the section's life on screen is three parts:
        //   1. scrolling in   — viewportHeight     (top hits bottom -> top top)
        //   2. pinned         — 110% viewportHeight (the pin's own distance)
        //   3. scrolling out  — its own height      (unpins at the spacer's
        //      bottom minus its height, then scrolls off the top normally)
        // Ranges tried before that all FAILED, for the record: "top 80%"/
        // "bottom 20%" and "top bottom"/"bottom top" resolve against the
        // element's natural (pre-pin) box and so miss part 2, while copying
        // the pin's own "top top"/"+=110%" covers part 2 but misses part 3 —
        // and part 3 is exactly where the speaker was reappearing over the
        // still-visible spec rows (row 01 already scrolled past the top).
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: () => `+=${window.innerHeight * 2.1 + el.offsetHeight}`,
          onEnter: armHide,
          onEnterBack: armHide,
          onLeave: disarmHide,
          onLeaveBack: disarmHide,
        });
      }

      // Pin the section and scrub the list UP so all spec rows (01 → 06) pass
      // through while the model stays parked. y recomputed on refresh.
      gsap.to(inner, {
        y: () => {
          const over = inner.scrollHeight - window.innerHeight * 0.92;
          return over > 0 ? -over : 0;
        },
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=110%",
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, pinRef);
    return () => {
      release();
      disarmHide();
      ctx.revert();
    };
  }, [sm]);

  return (
    <section className="specs specs--scroll" id="specs" ref={pinRef}>
      <div className="specs__inner" ref={innerRef}>
        <header className="specs__head">
          <span className="eyebrow">Engineered to roam</span>
          <h2 className="specs__title">Specifications</h2>
        </header>
        <div className="specs__list">
          {product.specs.map((s, i) => (
            <SpecRow key={s.k} k={s.k} v={s.v} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
