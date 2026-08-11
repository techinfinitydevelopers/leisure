"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll, pushHide, popHide } from "@/lib/scrollStore";

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
      // turn the front toward the copy: right row (model on right) shows its
      // full side profile (dm.ry ~1.45); left row turns less to a 3/4 front so
      // the carry-handle side doesn't dominate.
      const mag = flipped ? (dm.ry || 1.45) * 0.55 : (dm.ry || 1.45);
      const face = (flipped ? 1 : -1) * mag;
      const sideX = (flipped ? -1 : 1) * (dm.x ?? 0.34);
      const apply = () => {
        scroll.holdX = sideX;
        scroll.holdRY = face;
      };
      st = ScrollTrigger.create({
        trigger: el,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) apply();
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
    const el = root.current!;
    if (!dm) {
      // No deepDiveModel configured for this product — keep the speaker
      // fully hidden for as long as this section is in view (mirrors
      // SpecsSection's own hide-while-in-view pattern).
      let hidden = false;
      const armHide = () => {
        if (hidden) return;
        hidden = true;
        pushHide();
      };
      const disarmHide = () => {
        if (!hidden) return;
        hidden = false;
        popHide();
      };
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: armHide,
        onEnterBack: armHide,
        onLeave: disarmHide,
        onLeaveBack: disarmHide,
      });
      return () => {
        st.kill();
        disarmHide();
      };
    }
    // Guarded like a refcount (armed/disarm), not a bare +=1/-=1 on every
    // onToggle call — onToggle can re-fire for the SAME state (e.g. around a
    // ScrollTrigger.refresh() elsewhere on the page), and an unguarded
    // increment would leak a permanent +1 that's never released, leaving
    // this section's default holdX bleeding into every later section for
    // the rest of the page (confirmed: it was still showing up in Technical
    // Details' model position).
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      scroll.holdS = dm.scale ?? 1;
      scroll.holdX = dm.x ?? 0.34; // default side until a row sets it
      scroll.holdCount += 1;
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      scroll.holdCount -= 1;
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      end: "bottom 30%",
      onEnter: () => arm(),
      onEnterBack: () => arm(),
      onLeave: () => disarm(),
      onLeaveBack: () => disarm(),
    });
    return () => {
      st.kill();
      disarm();
    };
  }, [dm]);

  if (!product.deepDives?.length) return null;
  const heading = product.deepDiveHeading ?? {
    eyebrow: `Why ${product.name}`,
    title: "Made for the move",
  };
  return (
    <section className="deepdive" id="deepdive" ref={root}>
      <header className="deepdive__head">
        <span className="eyebrow">{heading.eyebrow}</span>
        <h2 className="deepdive__title">{heading.title}</h2>
      </header>
      <div className="deepdive__list">
        {product.deepDives.map((d, i) => (
          <DeepDiveRow key={d.title} {...d} index={i} />
        ))}
      </div>
    </section>
  );
}
