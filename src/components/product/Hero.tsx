"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import ColorSwatches from "./ColorSwatches";
import Thumbnails from "./Thumbnails";
import BuyBar from "./BuyBar";

gsap.registerPlugin(ScrollTrigger);

type HeroProps = {
  colorIndex: number;
  viewIndex: number;
  onColor?: (i: number) => void;
  onView?: (i: number) => void;
  productId: number;
};

export default function Hero({ colorIndex, viewIndex, onColor, onView, productId }: HeroProps) {
  const product = useProductExperience();
  const variant: string = product.perspective?.heroVariant ?? "split";
  const rootRef = useRef<HTMLElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);

  // Show a still product image at rest; fade it out as the user first scrolls
  // (the 3D model reveals + slides down to take its place).
  useEffect(() => {
    const still = stillRef.current;
    const root = rootRef.current;
    if (!still || !root) return;
    const tween = gsap.fromTo(
      still,
      { opacity: 1 },
      {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "35% top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  if (variant === "center") {
    return (
      <section className="hero hero--center">
        <div className="hero--center__inner">
          <header className="hero--center__head">
            <span className="eyebrow">{product.tagline}</span>
            <h1 className="hero__title hero--center__title">{product.name}</h1>
          </header>

          {/* empty framed stage — the WebGL plane parks here center-stage at rest */}
          <div className="hero--center__stage">
            <div className="hero__frame" aria-hidden="true" />
          </div>

          <div className="hero--center__info">
            <ColorSwatches value={colorIndex} onChange={onColor} />
            <Thumbnails
              images={product.colors[colorIndex].images}
              value={viewIndex}
              onChange={onView}
            />
            <BuyBar productId={productId} colorIndex={colorIndex} />
          </div>
        </div>
        <div className="hero__scroll">SCROLL TO EXPLORE</div>
      </section>
    );
  }

  // 'split' (default / DRIFT)
  return (
    <section className="hero" ref={rootRef}>
      <div className="hero__grid">
        {/* framed grid slot — still image at rest; the 3D model reveals here on scroll */}
        <div className="hero__slot">
          <div className="hero__frame" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={stillRef}
              className="hero__still"
              src={
                product.colors[colorIndex].images[viewIndex] ??
                product.colors[colorIndex].images[0]
              }
              alt={product.name}
            />
          </div>
          <Thumbnails
            images={product.colors[colorIndex].images}
            value={viewIndex}
            onChange={onView}
          />
        </div>

        <div className="hero__info">
          <span className="eyebrow">{product.tagline}</span>
          <h1 className="hero__title">{product.name}</h1>
          {product.blurbHtml ? (
            <div
              className="hero__sub blog-content"
              dangerouslySetInnerHTML={{ __html: product.blurbHtml }}
            />
          ) : (
            <p className="hero__sub">{product.blurb}</p>
          )}
          <ColorSwatches value={colorIndex} onChange={onColor} />
          <BuyBar productId={productId} colorIndex={colorIndex} />
        </div>
      </div>
      <div className="hero__scroll">SCROLL TO EXPLORE</div>
    </section>
  );
}
