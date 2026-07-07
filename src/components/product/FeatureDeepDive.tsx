"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll } from "@/lib/scrollStore";

type DeepDiveRowProps = {
  title: string;
  copy: string;
  index: number;
};

function DeepDiveRow({ title, copy, index }: DeepDiveRowProps) {
  const product = useProductExperience();
  const ref = useRef<HTMLDivElement>(null);
  const flipped = index % 2 === 1;
  const dm = product.deepDiveModel;

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

    // As each row crosses the centre, move the model to that row's EMPTY side
    // (text-left row -> model right; flipped row -> model left).
    let st: ScrollTrigger | undefined;
    if (dm) {
      st = ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          scroll.holdX = (flipped ? -1 : 1) * (dm.x ?? 0.34);
        },
        onEnterBack: () => {
          scroll.holdX = (flipped ? -1 : 1) * (dm.x ?? 0.34);
        },
      });
    }

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      st?.kill();
    };
  }, [dm, flipped]);

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
  const root = useRef<HTMLElement>(null);
  const dm = product.deepDiveModel;

  // Hold the model (steady scale/heading) for as long as the deep-dive section
  // is in view; the per-row triggers above swap which side it sits on.
  useEffect(() => {
    if (!dm) return;
    const el = root.current!;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 30%",
      onToggle: (self) => {
        if (self.isActive) {
          scroll.holdS = dm.scale ?? 1;
          scroll.holdRY = dm.ry ?? 0;
          scroll.holdX = dm.x ?? 0.34; // default side until a row sets it
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
  }, [dm]);

  if (!product.deepDives?.length) return null;
  return (
    <section className="deepdive" id="deepdive" ref={root}>
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
