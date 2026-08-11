"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { scroll, pushHide, popHide } from "@/lib/scrollStore";

const ICONS: Record<string, ReactNode> = {
  drop: <path d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11Z" />,
  feather: (
    <>
      <path d="M20 4c-6 0-12 4-12 11v5l11-11" />
      <path d="M8 20h9" />
    </>
  ),
  bluetooth: <path d="M7 7l10 10-5 4V3l5 4L7 17" />,
  battery: (
    <>
      <rect x="3" y="8" width="15" height="9" rx="2" />
      <path d="M21 11v3" />
      <path d="M7 11v3M11 11v3" />
    </>
  ),
  usb: (
    <>
      <circle cx="12" cy="20" r="1.4" />
      <path d="M12 19V5" />
      <path d="M9 8l3-3 3 3" />
      <path d="M12 13l4-3v-2" />
      <circle cx="16" cy="7" r="1.2" />
    </>
  ),
  speaker: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="3" />
      <circle cx="12" cy="14" r="3.4" />
      <circle cx="12" cy="7" r="1" />
    </>
  ),
  // Waveform / equalizer bars — good for "signature sound" style claims.
  sound: (
    <>
      <path d="M4 12h2" />
      <path d="M8 8v8" />
      <path d="M12 5v14" />
      <path d="M16 8v8" />
      <path d="M20 10v4" />
    </>
  ),
  // Lightning bolt — fast charging / power.
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />,
  // Shield — protection / warranty / durability.
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
    </>
  ),
  // Ruler-like — weight / dimensions / portability.
  weight: (
    <>
      <rect x="3" y="10" width="18" height="10" rx="1" />
      <path d="M6 10V7M10 10V7M14 10V7M18 10V7" />
    </>
  ),
  // Signal / stable link / connectivity range.
  signal: (
    <>
      <path d="M4 18l4-6 4 3 4-8 4 11" />
    </>
  ),
  // Two overlapping circles — pair / stereo / TWS.
  pair: (
    <>
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </>
  ),
};

type FeatureCellProps = {
  icon: string;
  label: string;
  sub: string;
  index: number;
};

function FeatureCell({ icon, label, sub, index }: FeatureCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const tween = gsap.from(el, {
      opacity: 0,
      y: 36,
      duration: 0.6,
      ease: "power3.out",
      delay: (index % 3) * 0.08,
      scrollTrigger: { trigger: el, start: "top 90%" },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [index]);

  return (
    <div className="feature-cell" ref={ref}>
      <svg
        className="feature-cell__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONS[icon]}
      </svg>
      <span className="feature-cell__label">{label}</span>
      {sub && <span className="feature-cell__sub">{sub}</span>}
    </div>
  );
}

export default function FeatureGrid() {
  const product = useProductExperience();
  const root = useRef<HTMLElement>(null);

  // Opt-in: slide the roaming plane out to the side while this section is on
  // screen so the icon grid reads clean. Gated by a product flag so other
  // products are unaffected.
  useEffect(() => {
    if (!product.slideAsideOnFeatures) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => {
          scroll.sideCount += self.isActive ? 1 : -1;
        },
      });
    }, root);
    return () => {
      scroll.sideCount = 0;
      ctx.revert();
    };
  }, [product]);

  // Hide the roaming model entirely while the feature grid is in view.
  useEffect(() => {
    if (!product.featuresBackground) return;
    let armed = false;
    const arm = () => {
      if (armed) return;
      armed = true;
      pushHide();
    };
    const disarm = () => {
      if (!armed) return;
      armed = false;
      popHide();
    };
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: arm,
        onEnterBack: arm,
        onLeave: disarm,
        onLeaveBack: disarm,
      });
    }, root);
    return () => {
      disarm();
      ctx.revert();
    };
  }, [product]);

  if (!product.features?.length) return null;
  const cls = product.featuresBackground ? "features features--bg" : "features";
  return (
    <section className={cls} id="features" ref={root}>
      <div className="features__grid">
        {product.features.map((f, i) => (
          <FeatureCell key={f.label} {...f} index={i} />
        ))}
      </div>
    </section>
  );
}
