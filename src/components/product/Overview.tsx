"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";

export default function Overview() {
  const product = useProductExperience();
  const ref = useRef<HTMLElement>(null);

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
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

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
