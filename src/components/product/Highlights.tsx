"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { pushHide, popHide } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

export default function Highlights() {
  const product = useProductExperience();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!product.highlights?.length) return;
    const el = ref.current!;
    const tween = gsap.from(el.querySelectorAll(".highlights__item"), {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 80%" },
    });
    // hide the roaming product while this centered numbers band is on screen
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      pushHide();
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      popHide();
    };
    const hide = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: arm,
      onEnterBack: arm,
      onLeave: disarm,
      onLeaveBack: disarm,
    });
    return () => {
      disarm();
      hide.kill();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  if (!product.highlights?.length) return null;

  return (
    <section className="highlights" id="highlights" ref={ref}>
      <div className="highlights__inner">
        <span className="eyebrow highlights__eyebrow">By the numbers</span>
        <div className="highlights__grid">
          {product.highlights.map((h) => (
            <div className="highlights__item" key={h.label}>
              <span className="highlights__value">{h.value}</span>
              <span className="highlights__label">{h.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
