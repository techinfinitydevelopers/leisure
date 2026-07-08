"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scroll } from "@/lib/scrollStore";

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
    const st = ScrollTrigger.create({
      trigger: rootRef.current!,
      start: "top 75%",
      end: "bottom 25%",
      onToggle: (self) => {
        if (self.isActive) {
          scroll.holdX = -0.28;
          scroll.holdY = 0;
          scroll.holdRX = 0.6; // tilt toward top-front
          scroll.holdRY = 0; // front-on
          scroll.holdS = 0.55;
          scroll.holdCount += 1;
        } else {
          scroll.holdCount -= 1;
        }
      },
    });
    return () => {
      st.kill();
      scroll.holdCount = 0;
    };
  }, []);

  const phrase = "SOUND THAT TRAVELS — RAIN OR SHINE — ";

  return (
    <section className="loop" id="loop" aria-hidden="true" ref={rootRef}>
      <div className="loop__track" ref={trackRef}>
        <span className="loop__text">{phrase.repeat(4)}</span>
        <span className="loop__text">{phrase.repeat(4)}</span>
      </div>
    </section>
  );
}
