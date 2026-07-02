"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import SpecRow from "./SpecRow";

export default function SpecsSection() {
  const product = useProductExperience();
  const pinRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = pinRef.current;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=200%",
      pin: true,
      scrub: true,
    });
    return () => {
      st.kill();
    };
  }, []);

  return (
    <section className="specs" id="specs" ref={pinRef}>
      <div className="specs__inner">
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
