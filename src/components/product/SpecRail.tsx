"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

export default function SpecRail() {
  const product = useProductExperience();
  const wrapRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => "+=" + (track.scrollWidth - window.innerWidth),
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      // hide the roaming product while this full-width rail owns the screen
      ScrollTrigger.create({
        trigger: wrap,
        start: "top 80%",
        end: "bottom 20%",
        onToggle: (self) => {
          scroll.productHide = self.isActive ? 1 : 0;
        },
      });
    }, wrap);
    return () => {
      scroll.productHide = 0;
      ctx.revert();
    };
  }, []);

  return (
    <section className="specrail" id="specs" ref={wrapRef}>
      <div className="specrail__track" ref={trackRef}>
        <div className="specrail__head">
          <span className="eyebrow">Engineered to impress</span>
          <h2 className="specrail__title">Specifications</h2>
        </div>
        {product.specs.map((s) => (
          <div className="specrail__card" key={s.k}>
            <span className="specrail__value">{s.v}</span>
            <span className="specrail__label">{s.k}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
