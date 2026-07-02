"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";

type DeepDiveRowProps = {
  title: string;
  copy: string;
  index: number;
};

function DeepDiveRow({ title, copy, index }: DeepDiveRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const flipped = index % 2 === 1;

  useEffect(() => {
    const el = ref.current!;
    const tween = gsap.from(el.querySelectorAll(".reveal"), {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className={`deepdive-row${flipped ? " deepdive-row--flip" : ""}`} ref={ref}>
      <span className="deepdive-row__n reveal">{String(index + 1).padStart(2, "0")}</span>
      <div className="deepdive-row__body">
        <h3 className="deepdive-row__title reveal">{title}</h3>
        <p className="deepdive-row__copy reveal">{copy}</p>
      </div>
    </div>
  );
}

export default function FeatureDeepDive() {
  const product = useProductExperience();
  if (!product.deepDives?.length) return null;
  return (
    <section className="deepdive" id="deepdive">
      <header className="deepdive__head">
        <span className="eyebrow">Why DRIFT</span>
        <h2 className="deepdive__title">Made for the move</h2>
      </header>
      <div className="deepdive__list">
        {product.deepDives.map((d, i) => (
          <DeepDiveRow key={d.title} {...d} index={i} />
        ))}
      </div>
    </section>
  );
}
