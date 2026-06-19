"use client";

import { useCart } from "@/context/CartContext";

export default function CartIcon() {
  const { count, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      aria-label="Open cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110"
      style={{ border: "1px solid rgba(255,255,255,0.15)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      {count > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[0.55rem] font-black text-black"
          style={{ background: "#fbed2b" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
