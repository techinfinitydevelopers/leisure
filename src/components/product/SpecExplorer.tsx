"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";

gsap.registerPlugin(ScrollTrigger);

// Interactive spec explorer: click/hover a spec on the left, its value animates
// into the big display on the right.
export default function SpecExplorer() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number>(0);
  const specs = product.specs;
  const cur = specs[active];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // reveal heading + rows on scroll-in
      gsap.from(
        root.current!.querySelectorAll(
          ".specx__title, .specx__item, .specx__display",
        ),
        {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        },
      );
      // NOTE: the roaming plane is NOT hidden here. The .specx section sits above
      // the WebGL layer (z-index:40 > 30) so the plane simply passes behind it.
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="specx" id="specs" ref={root}>
      <div className="specx__head">
        <span className="eyebrow">Engineered to impress</span>
        <h2 className="specx__title">Specifications</h2>
      </div>

      <div className="specx__grid">
        <ul className="specx__list">
          {specs.map((s, i) => (
            <li key={s.k}>
              <button
                type="button"
                className={`specx__item ${i === active ? "is-active" : ""}`}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-pressed={i === active}
              >
                <span className="specx__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="specx__k">{s.k}</span>
                <span className="specx__arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="specx__display">
          <span className="specx__display-label">{cur.k}</span>
          {/* key={active} remounts the value so the CSS enter-animation replays */}
          <span className="specx__display-value" key={active}>
            {cur.v}
          </span>
        </div>
      </div>
    </section>
  );
}
