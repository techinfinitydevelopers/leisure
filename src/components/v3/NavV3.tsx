"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

export default function NavV3() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speakersOpen, setSpeakersOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const el = document.getElementById("v3-scroll");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 40);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      {/* Desktop floating pill */}
      <header className="pointer-events-none sticky top-0 z-50 hidden md:block">
        <div className="mx-auto mt-4 max-w-5xl px-4">
          <nav
            className={`pointer-events-auto flex h-14 items-center justify-between rounded-full px-4 transition-all duration-500 ${
              scrolled
                ? "border border-[rgba(66,2,6,0.18)] bg-[rgba(247,242,234,0.95)] shadow-[0_8px_40px_rgba(66,2,6,0.12)] backdrop-blur-2xl"
                : "border border-[rgba(66,2,6,0.1)] bg-[rgba(247,242,234,0.82)] backdrop-blur-xl"
            }`}
          >
            <Link href="/v3" className="flex shrink-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#e8d800]" />
              <Image src="/brand/leisure-logo.png" alt="Leisure" width={140} height={42} priority className="h-9 w-auto" />
            </Link>

            <ul className="flex items-center gap-7 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-[#000000]/70">
              <li><Link href="/v3" className="transition-colors hover:text-[#000000]">Home</Link></li>
              <li
                className="relative"
                onMouseEnter={() => setSpeakersOpen(true)}
                onMouseLeave={() => setSpeakersOpen(false)}
              >
                <Link href="/shop" className="flex items-center gap-1 transition-colors hover:text-[#000000]">
                  Speakers
                  <span className={`text-[0.6rem] transition-transform duration-300 ${speakersOpen ? "rotate-180" : ""}`}>▾</span>
                </Link>
                <div className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-300 ${speakersOpen ? "visible opacity-100" : "invisible -translate-y-1 opacity-0"}`}>
                  <div className="w-64 rounded-2xl border border-[rgba(66,2,6,0.12)] bg-[rgba(247,242,234,0.97)] p-2 shadow-xl backdrop-blur-xl">
                    {products.map((p) => (
                      <Link key={p.slug} href={`/product/${p.slug}`} className="flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors hover:bg-[rgba(66,2,6,0.05)]">
                        <span className="font-display text-base tracking-wide text-[#000000]">{p.model}</span>
                        <span className="text-xs normal-case tracking-normal text-[#e8d800]">₹{p.price.toLocaleString("en-IN")}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
              <li><Link href="/shop" className="transition-colors hover:text-[#000000]">Collection</Link></li>
              <li><Link href="/v3" className="transition-colors hover:text-[#000000]">About</Link></li>
            </ul>

            <Link href="/shop"
              className="flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#faf8fb] transition-all duration-300 hover:shadow-[0_0_20px_rgba(66,2,6,0.4)]"
              style={{ background: "linear-gradient(135deg,#000000,#6b0508)" }}>
              Shop Now
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile */}
      <header className={`sticky top-0 z-50 transition-all duration-500 md:hidden ${scrolled || menuOpen ? "border-b border-[rgba(66,2,6,0.12)] bg-[rgba(247,242,234,0.95)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/v3" className="relative z-50 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e8d800]" />
            <Image src="/brand/leisure-logo.png" alt="Leisure" width={140} height={42} priority className="h-9 w-auto" />
          </Link>
          <button type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)} className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px]">
            <span className={`block h-px w-6 bg-[#000000] transition-all duration-300 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-[#000000] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-[#000000] transition-all duration-300 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div style={{ backgroundColor: "rgba(247,242,234,0.99)" }} className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="flex h-full flex-col justify-center gap-8 px-8">
          <Link href="/v3" className="font-display text-4xl text-[#000000] transition-colors hover:text-[#000000]">Home</Link>
          <Link href="/shop" className="font-display text-4xl text-[#000000] transition-colors hover:text-[#000000]">Collection</Link>
          <div className="border-t border-[rgba(66,2,6,0.15)] pt-6">
            <p className="mb-4 font-pinyon text-2xl text-[#e8d800]">Speakers</p>
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="flex items-center justify-between text-[#000000]/80 transition-colors hover:text-[#000000]">
                  <span className="font-display text-xl tracking-wide">{p.model}</span>
                  <span className="text-sm text-[#e8d800]">₹{p.price.toLocaleString("en-IN")}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/shop"
            className="mt-2 self-start rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            style={{ background: "linear-gradient(135deg,#000000,#6b0508)" }}>
            Shop Now
          </Link>
        </div>
      </div>
    </>
  );
}
