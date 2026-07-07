import { gsap } from "gsap";

// Flies a product image from a source rect (usually the clicked button) in an
// arc into the cart icon in the nav, then bumps the icon. `onDone` fires when
// the flight lands (use it to add the item / redirect).
export function flyToCart(image: string, from: DOMRect, onDone?: () => void) {
  if (typeof document === "undefined") {
    onDone?.();
    return;
  }
  const target = document.querySelector<HTMLElement>("[data-cart-icon]");
  const size = 120;
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;

  const el = document.createElement("img");
  el.src = image;
  el.alt = "";
  el.style.cssText =
    `position:fixed;left:${startX}px;top:${startY}px;width:${size}px;height:auto;` +
    `z-index:2000;pointer-events:none;object-fit:contain;` +
    `filter:drop-shadow(0 12px 30px rgba(0,0,0,0.5));will-change:transform,opacity;`;
  document.body.appendChild(el);

  const tRect = target?.getBoundingClientRect();
  const endX = tRect ? tRect.left + tRect.width / 2 : window.innerWidth - 48;
  const endY = tRect ? tRect.top + tRect.height / 2 : 48;

  const tl = gsap.timeline({
    onComplete: () => {
      el.remove();
      if (target) {
        gsap.fromTo(
          target,
          { scale: 1 },
          { scale: 1.35, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" },
        );
      }
      onDone?.();
    },
  });

  // small lift, then arc into the cart while shrinking + fading
  tl.to(el, { y: -90, duration: 0.22, ease: "power2.out" }).to(el, {
    x: endX - startX,
    y: endY - startY,
    scale: 0.12,
    opacity: 0.35,
    duration: 0.62,
    ease: "power2.in",
  });
}
