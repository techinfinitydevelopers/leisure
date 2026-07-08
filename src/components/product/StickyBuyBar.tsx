"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useProductExperience } from "@/lib/product-experience-context";
import { useCart } from "@/context/CartContext";
import { flyToCart } from "@/lib/flyToCart";
import { setBuyBarVisible } from "@/lib/uiStore";

type Props = {
  productId: number;
  colorIndex: number;
};

export default function StickyBuyBar({ productId, colorIndex }: Props) {
  const product = useProductExperience();
  const { addItem, openCart } = useCart();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    gsap.set(el, { autoAlpha: 0, yPercent: 100 });

    // Reveal once the hero buy bar (#buy) has scrolled out of view; hide again
    // when it returns. Toggled by a ScrollTrigger watching the hero CTAs.
    const st = ScrollTrigger.create({
      trigger: "#buy",
      start: "bottom top", // hero CTA passed above the viewport
      onEnter: () => {
        gsap.to(el, { autoAlpha: 1, yPercent: 0, duration: 0.4, ease: "power2.out" });
        setBuyBarVisible(true);
      },
      onLeaveBack: () => {
        gsap.to(el, { autoAlpha: 0, yPercent: 100, duration: 0.3, ease: "power2.in" });
        setBuyBarVisible(false);
      },
    });
    return () => {
      st.kill();
      setBuyBarVisible(false);
    };
  }, []);

  const fmt = (n: number) => product.currency + n.toLocaleString("en-IN");

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    const color = product.colors[colorIndex] ?? product.colors[0];
    flyToCart(color.images[0], e.currentTarget.getBoundingClientRect(), () => {
      addItem({
        productId,
        slug: product.slug,
        model: product.name,
        price: product.price,
        mrp: product.mrp,
        color: color.name,
        image: color.images[0],
      });
      openCart();
    });
  };

  return (
    <div className="stickybuy" ref={ref}>
      <div className="stickybuy__info">
        <span className="stickybuy__name">{product.name}</span>
        <span className="stickybuy__price">{fmt(product.price)}</span>
        <span className="stickybuy__off">{product.discountPct}% OFF</span>
      </div>
      <button
        type="button"
        className="btn btn--primary stickybuy__btn"
        onClick={handleAdd}
      >
        Add to Cart
      </button>
    </div>
  );
}
