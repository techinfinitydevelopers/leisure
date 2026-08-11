"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll, pushHide, popHide } from "@/lib/scrollStore";

gsap.registerPlugin(ScrollTrigger);

// Full-bleed image break. The background image parallaxes (moves slower than
// scroll) and, while the section is on screen, the roaming WebGL product fades
// out (scroll.productHide -> 1) so the break stands alone — then fades back in.
export default function ParallaxBreak() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const parallax = product.parallax;

  // Holds the current trigger's release fn so unmount can settle whichever
  // counter (hide or slide-aside) this break happens to have pushed.
  const disarmRef = useRef<(() => void) | null>(null);

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
      let armed = false;
      const arm = () => {
        if (armed) return;
        armed = true;
        if (parallax.slideAside) scroll.sideCount += 1;
        else pushHide();
      };
      const disarm = () => {
        if (!armed) return;
        armed = false;
        if (parallax.slideAside) scroll.sideCount = Math.max(0, scroll.sideCount - 1);
        else popHide();
      };
      disarmRef.current = disarm;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 70%",
        end: "bottom 30%",
        onEnter: arm,
        onEnterBack: arm,
        onLeave: disarm,
        onLeaveBack: disarm,
      });
    }, root);
    return () => {
      disarmRef.current?.();
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
