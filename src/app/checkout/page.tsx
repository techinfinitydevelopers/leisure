"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

const EMPTY: FormData = { name: "", email: "", phone: "", address: "", city: "", pincode: "" };

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.phone.match(/^\+?[0-9]{10,13}$/)) e.phone = "Valid phone required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.pincode.match(/^[0-9]{6}$/)) e.pincode = "6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total,
          items: items.map((i) => ({
            productId: i.productId,
            color: i.color,
            qty: i.qty,
            price: i.price,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const { id } = await res.json();
      setOrderId(id);
      clearCart();
      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function field(key: keyof FormData, label: string, type = "text", placeholder = "") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[0.68rem] uppercase tracking-[0.16em] text-white/50">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(ev) => setForm((p) => ({ ...p, [key]: ev.target.value }))}
          placeholder={placeholder}
          className="rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition-all"
          style={{
            background: "#141414",
            border: errors[key] ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
          }}
          onFocus={(ev) => (ev.currentTarget.style.borderColor = "#fbed2b")}
          onBlur={(ev) => (ev.currentTarget.style.borderColor = errors[key] ? "#ef4444" : "rgba(255,255,255,0.1)")}
        />
        {errors[key] && <p className="text-[0.65rem] text-red-400">{errors[key]}</p>}
      </div>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000" }}>
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl" style={{ background: "#fbed2b" }}>
            ✓
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Order Placed!</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Thank you, <span className="text-white font-semibold">{form.name}</span>! Your order #{orderId} has been received. We&apos;ll reach out on <span className="text-white font-semibold">{form.phone}</span> to confirm.
          </p>
          <Link
            href="/shop"
            className="rounded-full px-8 py-3 text-[0.78rem] font-black uppercase tracking-[0.16em] text-black transition-all hover:scale-105"
            style={{ background: "#fbed2b" }}
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000" }}>
        <div className="text-center flex flex-col items-center gap-5">
          <p className="text-white/40 text-sm uppercase tracking-[0.14em]">Your cart is empty</p>
          <Link href="/shop" className="text-[0.78rem] uppercase tracking-[0.14em] font-bold transition-colors" style={{ color: "#fbed2b" }}>
            Browse Products →
          </Link>
        </div>
      </main>
    );
  }

  const shipping = 0;
  const grandTotal = total + shipping;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6" style={{ background: "#000" }}>
      <div className="mx-auto max-w-5xl">
        <Link href="/shop" className="text-sm text-white/40 hover:text-white/70 transition-colors">← Back to shop</Link>
        <h1 className="mt-6 text-4xl font-black text-white tracking-tight">Checkout</h1>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/60">Delivery Details</h2>
              {field("name", "Full Name", "text", "Rahul Sharma")}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {field("email", "Email", "email", "you@email.com")}
                {field("phone", "Phone", "tel", "+91 98765 43210")}
              </div>
              {field("address", "Address", "text", "123, MG Road, Apt 4B")}
              <div className="grid grid-cols-2 gap-5">
                {field("city", "City", "text", "Mumbai")}
                {field("pincode", "Pincode", "text", "400001")}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full py-4 text-[0.82rem] font-black uppercase tracking-[0.18em] text-black transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(251,237,43,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#fbed2b" }}
            >
              {submitting ? "Placing Order…" : `Place Order — ${inr.format(grandTotal)}`}
            </button>
          </form>

          {/* ── Order summary ── */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white/60">Order Summary</h2>

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden" style={{ background: "#1a1a1a" }}>
                      <Image src={item.image} alt={item.model} fill className="object-contain p-1" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{item.model}</p>
                      <p className="text-white/40 text-[0.65rem] uppercase tracking-[0.1em]">{item.color} × {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0" style={{ color: "#fbed2b" }}>{inr.format(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/8 pt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-white/50">
                  <span>Subtotal</span><span>{inr.format(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/50">
                  <span>Shipping</span><span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-base font-black text-white mt-1">
                  <span>Total</span><span style={{ color: "#fbed2b" }}>{inr.format(grandTotal)}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[0.65rem] text-white/25 leading-relaxed">
              Orders confirmed via phone call · Free shipping across India · 1-year warranty
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
