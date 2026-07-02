"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";

type FaqItemProps = {
  q: string;
  a: string;
  index: number;
  open: boolean;
  onToggle: () => void;
};

function FaqItem({ q, a, index, open, onToggle }: FaqItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const tween = gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className={`faq-item${open ? " is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="faq-item__q"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="faq-item__n">{String(index + 1).padStart(2, "0")}</span>
        <span className="faq-item__qt">{q}</span>
        <span className="faq-item__icon" aria-hidden="true" />
      </button>
      <div className="faq-item__a" role="region">
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const product = useProductExperience();
  const [openIdx, setOpenIdx] = useState<number>(0);

  if (!product.faq?.length) return null;
  return (
    <section className="faq" id="faq">
      <header className="faq__head">
        <span className="eyebrow">Good to know</span>
        <h2 className="faq__title">FAQ</h2>
      </header>
      <div className="faq__list">
        {product.faq.map((f, i) => (
          <FaqItem
            key={f.q}
            {...f}
            index={i}
            open={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}
