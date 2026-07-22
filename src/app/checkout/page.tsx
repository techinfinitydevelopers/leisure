"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createShopifyCheckout } from "@/lib/shopify-checkout";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  const hasLocalOnlyItems = items.some((i) => !i.variantId);

  async function handleCheckout() {
    setError("");
    setRedirecting(true);
    try {
      const lines = items
        .filter((i) => !!i.variantId)
        .map((i) => ({ variantId: i.variantId!, quantity: i.qty }));
      if (lines.length === 0) {
        throw new Error(
          "None of the items in your cart are available for Shopify checkout yet. Please add these products in Shopify first.",
        );
      }
      const url = await createShopifyCheckout(lines);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed. Please try again.");
      setRedirecting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#000" }}
      >
        <div className="text-center flex flex-col items-center gap-5">
          <p className="text-white/40 text-sm uppercase tracking-[0.14em]">
            Your cart is empty
          </p>
          <Link
            href="/shop"
            className="text-[0.78rem] uppercase tracking-[0.14em] font-bold transition-colors"
            style={{ color: "#fbed2b" }}
          >
            Browse Products →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6" style={{ background: "#000" }}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/shop"
          className="text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Back to shop
        </Link>
        <h1 className="mt-6 text-4xl font-black text-white tracking-tight">
          Review your order
        </h1>
        <p className="mt-2 text-sm text-white/50">
          You&apos;ll be redirected to secure checkout to enter delivery details, apply
          discount codes, and complete payment.
        </p>

        {error && (
          <p
            className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        {hasLocalOnlyItems && !error && (
          <p
            className="mt-6 rounded-xl border border-yellow-400/40 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200"
            role="alert"
          >
            Some items in your cart aren&apos;t set up in Shopify yet — only the items marked as available below will be checked out. Add the remaining products in Shopify to include them.
          </p>
        )}

        <div
          className="mt-8 rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/60">
            Order Summary
          </h2>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div
                  className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden"
                  style={{ background: "#1a1a1a" }}
                >
                  <Image
                    src={item.image}
                    alt={item.model}
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{item.model}</p>
                  <p className="text-white/40 text-[0.65rem] uppercase tracking-[0.1em]">
                    {item.color} × {item.qty}
                    {!item.variantId && (
                      <span className="ml-2 text-yellow-400">not available</span>
                    )}
                  </p>
                </div>
                <p
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color: "#fbed2b" }}
                >
                  {inr.format(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-white/50">
              <span>Subtotal</span>
              <span>{inr.format(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-white/50">
              <span>Shipping & taxes</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={redirecting}
          className="mt-8 w-full rounded-full py-4 text-[0.82rem] font-black uppercase tracking-[0.18em] text-black transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(251,237,43,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#fbed2b" }}
        >
          {redirecting ? "Redirecting to checkout…" : "Continue to Secure Checkout"}
        </button>

        <p className="mt-4 text-center text-[0.65rem] text-white/25 leading-relaxed">
          Secure checkout by Shopify · Apply discount codes on the next page · 1-year warranty
        </p>
      </div>
    </main>
  );
}
