"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { useCart } from "@/context/CartContext";
import { flyToCart } from "@/lib/flyToCart";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  productId: number;
  colorIndex: number;
  onColor: (i: number) => void;
};

// Cinematic hero — letterboxed 21:9-feel band, tagline overlaid huge, colour
// pills bottom-right, buy CTA bottom-left. Deliberately different from DRIFT's
// split hero. The 3D roaming model floats in the same fixed Canvas behind this.
export default function EdgeHero({ productId, colorIndex, onColor }: Props) {
  const product = useProductExperience();
  const { addItem, openCart } = useCart();
  const rootRef = useRef<HTMLElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const color = product.colors[colorIndex] ?? product.colors[0];
  const [imgSrc, setImgSrc] = useState<string>(color.images[0] ?? "");

  useEffect(() => {
    setImgSrc(color.images[0] ?? "");
  }, [color]);

  useEffect(() => {
    const still = stillRef.current;
    const root = rootRef.current;
    if (!still || !root) return;
    const tween = gsap.fromTo(
      still,
      { opacity: 1, scale: 1.02 },
      {
        opacity: 0.15,
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const fmt = (n: number) => product.currency + n.toLocaleString("en-IN");

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    flyToCart(color.images[0] ?? "", e.currentTarget.getBoundingClientRect(), () => {
      addItem({
        productId,
        slug: product.slug,
        model: product.name,
        price: product.price,
        mrp: product.mrp,
        color: color.name,
        image: color.images[0] ?? "",
        variantId: color.variantId,
      });
      openCart();
    });
  };

  return (
    <section className="edge-hero" ref={rootRef} id="buy">
      <div className="edge-hero__frame">
        {imgSrc ? (
          <Image
            ref={stillRef}
            src={imgSrc}
            alt={product.name}
            fill
            priority
            sizes="100vw"
            className="edge-hero__still"
          />
        ) : null}
        <div className="edge-hero__gradient" aria-hidden="true" />

        <div className="edge-hero__eyebrow">{product.tagline}</div>

        <h1 className="edge-hero__title">{product.name}</h1>

        <p className="edge-hero__sub">{product.blurb}</p>

        <div className="edge-hero__cta">
          <div className="edge-hero__price">
            <span className="edge-hero__now">{fmt(product.price)}</span>
            {product.mrp > product.price && (
              <span className="edge-hero__mrp">{fmt(product.mrp)}</span>
            )}
            {product.discountPct > 0 && (
              <span className="edge-hero__off">{product.discountPct}% OFF</span>
            )}
          </div>
          <button type="button" className="edge-hero__buy" onClick={handleAdd}>
            Add to Cart →
          </button>
        </div>

        <div className="edge-hero__colors" role="group" aria-label="Colour">
          <span className="edge-hero__colors-label">{color.name}</span>
          <div className="edge-hero__colors-row">
            {product.colors.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.name}
                aria-pressed={colorIndex === i}
                className={`edge-hero__swatch ${colorIndex === i ? "is-active" : ""}`}
                style={{ background: c.hex }}
                onClick={() => onColor(i)}
              />
            ))}
          </div>
        </div>

        <div className="edge-hero__scroll">SCROLL</div>
      </div>
    </section>
  );
}
