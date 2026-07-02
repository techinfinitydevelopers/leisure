"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function LifestyleLoop() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    // single half (the content is duplicated for a seamless wrap)
    const tween = gsap.to(el, {
      xPercent: -50,
      ease: "none",
      duration: 22,
      repeat: -1,
    });
    return () => {
      tween.kill();
    };
  }, []);

  const phrase = "SOUND THAT TRAVELS — RAIN OR SHINE — ";

  return (
    <section className="loop" id="loop" aria-hidden="true">
      <div className="loop__track" ref={trackRef}>
        <span className="loop__text">{phrase.repeat(4)}</span>
        <span className="loop__text">{phrase.repeat(4)}</span>
      </div>
    </section>
  );
}
