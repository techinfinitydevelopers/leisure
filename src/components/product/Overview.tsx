"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

export default function Overview() {
  const product = useProductExperience();
  const ref = useRef<HTMLElement>(null);
  const om = product.overviewModel;

  useEffect(() => {
    const el = ref.current!;
    const tween = gsap.from(el.querySelectorAll(".reveal"), {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 80%" },
    });

    // The model docks on the right, then slides OFF the right edge as you
    // scroll through Overview (a disappearing exit). It stays gone through the
    // Feature Grid; the Specs section brings it back in from the right.
    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const restX = om?.x ?? 0.36;
    const OFF_X = 1.6; // off the right edge
    let held = false;
    const hold = () => {
      if (held) return;
      held = true;
      scroll.holdRY = om?.ry ?? 0;
      scroll.holdRX = 0;
      scroll.holdY = 0;
      scroll.holdS = om?.scale ?? 1;
      scroll.holdCount += 1;
    };
    const release = () => {
      if (!held) return;
      held = false;
      scroll.holdCount -= 1;
    };
    let st: ScrollTrigger | undefined;
    if (om) {
      st = ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        end: "bottom top",
        scrub: true,
        onEnter: () => {
          scroll.productHide = 0;
          hold();
        },
        onEnterBack: () => {
          scroll.productHide = 0;
          hold();
        },
        onLeave: () => {
          // slid off the right and now into the Feature Grid — keep it gone
          scroll.productHide = 1;
          release();
        },
        onLeaveBack: () => release(),
        onUpdate: (self) => {
          // docked for the first bit, then eases off the right edge
          const t = clamp01((self.progress - 0.4) / 0.6);
          scroll.holdX = restX + (OFF_X - restX) * t;
        },
      });
    }

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      release();
      st?.kill();
    };
  }, [om]);

  return (
    <section className="overview" id="overview" ref={ref}>
      <div className="overview__inner">
        <span className="eyebrow reveal">Say hello</span>
        <h2 className="overview__title reveal">Overview</h2>
        <p className="overview__copy reveal">{product.overview}</p>
      </div>
    </section>
  );
}
