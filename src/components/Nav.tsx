"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const [speakersOpen, setProductsOpen] = useState(false);
  const pathname = usePathname();
  const open = menuOpenAt === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Desktop floating pill nav */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden md:block">
        <div className="mx-auto mt-4 max-w-5xl px-4">
          <nav
            className={`pointer-events-auto flex h-16 items-center justify-between rounded-full px-5 transition-all duration-500 ${
              scrolled
                ? "border border-white/10 bg-[rgba(0,0,0,0.88)] shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
                : "border border-white/8 bg-[rgba(0,0,0,0.72)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <Image
                src="/brand/leisure-logo.png"
                alt="Leisure"
                width={90}
                height={90}
                priority
                className="h-14 w-14 brightness-0 invert"
              />
            </Link>

            {/* Center nav links */}
            <ul className="flex items-center gap-7 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-offwhite/80">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-gold"
                >
                  Home
                </Link>
              </li>

              {/* Products dropdown */}
              <li
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <Link
                  href="/shop"
                  className="flex items-center gap-1 transition-colors hover:text-gold"
                >
                  Products
                  <span className={`text-[0.6rem] transition-transform duration-300 ${speakersOpen ? "rotate-180" : ""}`}>▾</span>
                </Link>

                <div
                  className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-300 ${
                    speakersOpen ? "visible opacity-100" : "invisible -translate-y-1 opacity-0"
                  }`}
                >
                  <div className="glass w-64 rounded-2xl p-2">
                    {products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/product/${p.slug}`}
                        className="flex items-center justify-between rounded-xl px-4 py-2.5 transition-colors hover:bg-white/5"
                      >
                        <span className="font-display text-base tracking-wide text-offwhite">{p.model}</span>
                        <span className="text-xs normal-case tracking-normal text-gold">₹{p.price.toLocaleString("en-IN")}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              <li>
                <Link href="/shop" className="transition-colors hover:text-gold">
                  Collection
                </Link>
              </li>

              <li>
                <Link href="/" className="transition-colors hover:text-gold">
                  About
                </Link>
              </li>
            </ul>

            {/* CTA pill button */}
            <Link
              href="/shop"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-5 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-deepblack transition-all duration-300 hover:bg-gold/90 hover:shadow-[0_0_20px_rgba(251,237,43,0.4)]"
            >
              Shop Now
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile header — full width */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 md:hidden ${
          scrolled || open
            ? "border-b border-white/10 bg-[rgba(0,0,0,0.88)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          {/* Logo */}
          <Link href="/" className="relative z-50 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" />
            <Image
              src="/brand/leisure-logo.png"
              alt="Leisure"
              width={120}
              height={120}
              priority
              className="h-14 w-14 brightness-0 invert"
            />
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpenAt((v) => (v === pathname ? null : pathname))}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
          >
            <span className={`block h-px w-6 bg-offwhite transition-all duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-offwhite transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-offwhite transition-all duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.98)" }}
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <div className="flex h-full flex-col justify-center gap-8 px-8">
          <Link href="/" className="font-display text-4xl text-offwhite transition-colors hover:text-gold">Home</Link>
          <Link href="/shop" className="font-display text-4xl text-offwhite transition-colors hover:text-gold">Collection</Link>
          <div className="border-t border-white/10 pt-6">
            <p className="mb-4 font-pinyon text-2xl text-gold">Products</p>
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="flex items-center justify-between text-offwhite/85 transition-colors hover:text-gold"
                >
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
