"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";

export default function StickyBuyBar() {
  const product = useProductExperience();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    gsap.set(el, { autoAlpha: 0, yPercent: 100 });

    // Reveal once the hero buy bar (#buy) has scrolled out of view; hide again
    // when it returns. Toggled by a ScrollTrigger watching the hero CTAs.
    const st = ScrollTrigger.create({
      trigger: "#buy",
      start: "bottom top", // hero CTA passed above the viewport
      onEnter: () =>
        gsap.to(el, { autoAlpha: 1, yPercent: 0, duration: 0.4, ease: "power2.out" }),
      onLeaveBack: () =>
        gsap.to(el, { autoAlpha: 0, yPercent: 100, duration: 0.3, ease: "power2.in" }),
    });
    return () => {
      st.kill();
    };
  }, []);

  const fmt = (n: number) => product.currency + n.toLocaleString("en-IN");

  return (
    <div className="stickybuy" ref={ref}>
      <div className="stickybuy__info">
        <span className="stickybuy__name">{product.name}</span>
        <span className="stickybuy__price">{fmt(product.price)}</span>
        <span className="stickybuy__off">{product.discountPct}% OFF</span>
      </div>
      <button type="button" className="btn btn--primary stickybuy__btn">
        Add to Cart
      </button>
    </div>
  );
}
