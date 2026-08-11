"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scroll } from "@/lib/scrollStore";
import { useProductExperience } from "@/lib/product-experience-context";

gsap.registerPlugin(ScrollTrigger);

export default function LifestyleLoop() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    // single half (the content is duplicated for a seamless wrap)
    const tween = gsap.to(el, {
      xPercent: -50,
      ease: "none",
      duration: 45,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  // While the marquee is in view, hold the model to the left in a steady
  // top-front view (tilted forward so the top + grille read at once).
  useEffect(() => {
    // Guarded (armed/disarm), not a bare +=1/-=1 on every onToggle call —
    // onToggle can re-fire for the SAME state (e.g. around a
    // ScrollTrigger.refresh() elsewhere on the page), and an unguarded
    // increment would leak a permanent +1 that never gets released, leaving
    // this section's hold bleeding into every later section on the page.
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      scroll.holdX = -0.28;
      scroll.holdY = 0;
      scroll.holdRX = 0.6; // tilt toward top-front
      scroll.holdRY = 0; // front-on
      scroll.holdS = 0.55;
      scroll.holdCount += 1;
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      scroll.holdCount -= 1;
    };
    const st = ScrollTrigger.create({
      trigger: rootRef.current!,
      start: "top 75%",
      end: "bottom 25%",
      onEnter: () => arm(),
      onEnterBack: () => arm(),
      onLeave: () => disarm(),
      onLeaveBack: () => disarm(),
    });
    return () => {
      st.kill();
      disarm();
    };
  }, []);

  // Marquee text comes from the `custom.lifestyle_loop` metafield when set,
  // otherwise falls back to a sensible default. Trailing " — " keeps the wrap
  // clean when the phrase repeats.
  const product = useProductExperience();
  const raw = (product.lifestyleLoop || "SOUND THAT TRAVELS — RAIN OR SHINE").trim();
  const phrase = raw.endsWith("—") ? `${raw} ` : `${raw} — `;

  return (
    <section className="loop" id="loop" aria-hidden="true" ref={rootRef}>
      <div className="loop__track" ref={trackRef}>
        <span className="loop__text">{phrase.repeat(4)}</span>
        <span className="loop__text">{phrase.repeat(4)}</span>
      </div>
    </section>
  );
}
