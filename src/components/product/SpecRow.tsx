"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SpecRowProps = {
  k: string;
  v: string;
  index: number;
};

export default function SpecRow({ k, v, index }: SpecRowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const tween = gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="spec-row" ref={ref}>
      <span className="spec-row__n">{String(index + 1).padStart(2, "0")}</span>
      <span className="spec-row__k">{k}</span>
      <span className="spec-row__v">{v}</span>
    </div>
  );
}
