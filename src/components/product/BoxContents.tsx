"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";

type BoxItemProps = {
  name: string;
  note: string;
  index: number;
};

function BoxItem({ name, note, index }: BoxItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const tween = gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);
  return (
    <div className="box-item" ref={ref}>
      <span className="box-item__n">{String(index + 1).padStart(2, "0")}</span>
      <h3 className="box-item__name">{name}</h3>
      <p className="box-item__note">{note}</p>
    </div>
  );
}

export default function BoxContents() {
  const product = useProductExperience();
  return (
    <section className="box" id="box">
      <header className="box__head">
        <span className="eyebrow">What&apos;s inside</span>
        <h2 className="box__title">In the Box</h2>
      </header>
      <div className="box__grid">
        {product.box.map((b, i) => (
          <BoxItem key={b.name} name={b.name} note={b.note} index={i} />
        ))}
      </div>
    </section>
  );
}
