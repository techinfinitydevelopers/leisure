"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

export default function NavV2() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speakersOpen, setSpeakersOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const el = document.getElementById("v2-scroll");
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
                ? "border border-[rgba(251,237,43,0.25)] bg-[rgba(5,5,5,0.92)] shadow-[0_8px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
                : "border border-[rgba(251,237,43,0.12)] bg-[rgba(5,5,5,0.75)] backdrop-blur-xl"
            }`}
          >
            <Link href="/v2" className="flex shrink-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <Image src="/brand/leisure-logo.png" alt="Leisure" width={140} height={42} priority className="h-9 w-auto brightness-0 invert" />
            </Link>

            <ul className="flex items-center gap-7 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-white/75">
              <li><Link href="/v2" className="transition-colors hover:text-gold">Home</Link></li>
              <li
                className="relative"
                onMouseEnter={() => setSpeakersOpen(true)}
                onMouseLeave={() => setSpeakersOpen(false)}
              >
                <Link href="/shop" className="flex items-center gap-1 transition-colors hover:text-gold">
                  Speakers
                  <span className={`text-[0.6rem] transition-transform duration-300 ${speakersOpen ? "rotate-180" : ""}`}>▾</span>
                </Link>
                <div className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-300 ${speakersOpen ? "visible opacity-100" : "invisible -translate-y-1 opacity-0"}`}>
                  <div className="w-64 rounded-2xl border border-[rgba(251,237,43,0.15)] bg-[rgba(5,5,5,0.95)] p-2 backdrop-blur-xl">
                    {products.map((p) => (
                      <Link key={p.slug} href={`/product/${p.slug}`} className="flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors hover:bg-white/5">
                        <span className="font-display text-base tracking-wide text-white">{p.model}</span>
                        <span className="text-xs normal-case tracking-normal text-gold">₹{p.price.toLocaleString("en-IN")}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
              <li><Link href="/shop" className="transition-colors hover:text-gold">Collection</Link></li>
              <li><Link href="/v2" className="transition-colors hover:text-gold">About</Link></li>
            </ul>

            <Link href="/shop" className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#000000] transition-all duration-300 hover:bg-gold/90 hover:shadow-[0_0_20px_rgba(251,237,43,0.45)]">
              Shop Now
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile */}
      <header className={`sticky top-0 z-50 transition-all duration-500 md:hidden ${scrolled || menuOpen ? "border-b border-[rgba(251,237,43,0.12)] bg-[rgba(5,5,5,0.92)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/v2" className="relative z-50 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" />
            <Image src="/brand/leisure-logo.png" alt="Leisure" width={140} height={42} priority className="h-9 w-auto brightness-0 invert" />
          </Link>
          <button type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)} className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px]">
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div style={{ backgroundColor: "rgba(5,5,5,0.98)" }} className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="flex h-full flex-col justify-center gap-8 px-8">
          <Link href="/v2" className="font-display text-4xl text-white transition-colors hover:text-gold">Home</Link>
          <Link href="/shop" className="font-display text-4xl text-white transition-colors hover:text-gold">Collection</Link>
          <div className="border-t border-[rgba(251,237,43,0.15)] pt-6">
            <p className="mb-4 font-pinyon text-2xl text-gold">Speakers</p>
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="flex items-center justify-between text-white/80 transition-colors hover:text-gold">
                  <span className="font-display text-xl tracking-wide">{p.model}</span>
                  <span className="text-sm text-gold">₹{p.price.toLocaleString("en-IN")}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/shop" className="btn-gold mt-2 self-start">Shop Now</Link>
        </div>
      </div>
    </>
  );
}
