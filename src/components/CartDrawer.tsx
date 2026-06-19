"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function CartDrawer() {
  const { items, count, total, removeItem, updateQty, closeCart, isOpen } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[600] h-full w-full max-w-[420px] flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "#0d0d0d", borderLeft: "1px solid rgba(251,237,43,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black uppercase tracking-[0.12em] text-white">Cart</span>
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold text-black" style={{ background: "#fbed2b" }}>
                {count}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="text-4xl opacity-30">🛒</div>
              <p className="text-white/40 text-sm uppercase tracking-[0.14em]">Your cart is empty</p>
              <button onClick={closeCart} className="text-[0.72rem] uppercase tracking-[0.14em] font-semibold transition-colors hover:text-white" style={{ color: "#fbed2b" }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl p-3" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Image */}
                <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: "#1a1a1a" }}>
                  <Image src={item.image} alt={item.model} fill className="object-contain p-1" sizes="80px" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-sm tracking-[0.06em]">{item.model}</p>
                  <p className="text-[0.65rem] uppercase tracking-[0.1em] text-white/40 mt-0.5">{item.color}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: "#fbed2b" }}>{inr.format(item.price)}</p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 rounded-full px-2 py-1" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">−</button>
                      <span className="text-white text-xs font-semibold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-white transition-colors text-sm">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[0.6rem] uppercase tracking-[0.12em] text-white/30 hover:text-red-400 transition-colors">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50 uppercase tracking-[0.12em]">Total</span>
              <span className="text-xl font-black text-white">{inr.format(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-full py-3.5 text-[0.78rem] font-black uppercase tracking-[0.16em] text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(251,237,43,0.35)]"
              style={{ background: "#fbed2b" }}
            >
              Proceed to Checkout →
            </Link>
            <button onClick={closeCart} className="w-full text-center text-[0.68rem] uppercase tracking-[0.14em] text-white/35 hover:text-white/60 transition-colors py-1">
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
