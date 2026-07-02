"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Full-bleed image break. The background image parallaxes (moves slower than
// scroll) and, while the section is on screen, the roaming WebGL product fades
// out (scroll.productHide -> 1) so the break stands alone — then fades back in.
export default function ParallaxBreak() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const parallax = product.parallax;

  useEffect(() => {
    if (!parallax) return;
    const ctx = gsap.context(() => {
      // image drifts up as the section scrolls through — classic parallax
      gsap.fromTo(
        img.current,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      // While this break owns the screen, either FADE the roaming product out
      // (default) or — if the product opts in via `parallax.slideAside` — keep
      // it visible and slide it to the side (scroll.sideCount).
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 70%",
        end: "bottom 30%",
        onToggle: (self) => {
          if (parallax.slideAside) scroll.sideCount += self.isActive ? 1 : -1;
          else scroll.productHide = self.isActive ? 1 : 0;
        },
      });
    }, root);
    return () => {
      scroll.productHide = 0;
      scroll.sideCount = 0;
      ctx.revert();
    };
  }, [parallax]);

  if (!parallax) return null;

  return (
    <section className="parallax-break" ref={root}>
      <div className="parallax-break__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={img} src={parallax.image} alt="" aria-hidden="true" />
      </div>
      {parallax.caption && (
        <div className="parallax-break__caption">
          <span className="eyebrow">{parallax.eyebrow}</span>
          <h2 className="parallax-break__title">{parallax.caption}</h2>
        </div>
      )}
    </section>
  );
}
