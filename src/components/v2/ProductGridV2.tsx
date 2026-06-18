import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

export default function ProductGridV2() {
  return (
    <section className="relative py-20 sm:py-28">
      {/* Subtle side glow */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-[600px] w-[300px] -translate-y-1/2 opacity-20"
        style={{ background: "radial-gradient(ellipse at left, rgba(251,237,43,0.3), transparent 70%)" }} />
      <div className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[300px] -translate-y-1/2 opacity-20"
        style={{ background: "radial-gradient(ellipse at right, rgba(251,237,43,0.3), transparent 70%)" }} />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section heading */}
        <div className="mb-14 text-center">
          <p className="font-pinyon text-4xl text-gold">The Collection</p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Meet the Range
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/45">
            Six speakers. One obsession. Each crafted to own its space.
          </p>
        </div>

        {/* 3-col grid (desktop), 2-col (tablet), 1-col (mobile) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const saving = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <Link key={p.slug} href={`/product/${p.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_60px_rgba(251,237,43,0.12)]"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(251,237,43,0.1)" }}
              >
                {/* Hover gold border reveal */}
                <span className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(251,237,43,0.35)" }} />

                {/* Image area */}
                <div className="relative flex h-52 items-center justify-center p-6"
                  style={{ background: "rgba(251,237,43,0.03)" }}>
                  {/* Background glow */}
                  <div className="absolute inset-0 rounded-t-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(251,237,43,0.08), transparent)" }} />

                  <Image
                    src={`/products/${p.slug}.png`}
                    alt={p.model}
                    width={200}
                    height={200}
                    className="relative z-10 h-40 w-40 object-contain transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Savings badge */}
                  {saving > 0 && (
                    <span className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#000000]"
                      style={{ background: "linear-gradient(135deg,#fbed2b,#e8d800)" }}>
                      -{saving}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h3 className="font-display text-lg font-black uppercase tracking-wide text-white">{p.model}</h3>
                    <p className="font-pinyon text-xl text-gold/80">{p.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-gold">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-white/30 line-through">
                      ₹{p.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Color dots */}
                  <div className="flex items-center gap-1.5">
                    {p.colors.map((c) => (
                      <span key={c.name} title={c.name}
                        className="h-3.5 w-3.5 rounded-full border border-white/10"
                        style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>

                  {/* CTA row */}
                  <div className="mt-auto flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(251,237,43,0.08)" }}>
                    <span className="text-xs font-medium uppercase tracking-wider text-gold/60 transition-colors duration-300 group-hover:text-gold">
                      View Details
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 group-hover:bg-gold group-hover:text-[#000000]"
                      style={{ border: "1px solid rgba(251,237,43,0.2)", color: "rgba(251,237,43,0.6)" }}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all CTA */}
        <div className="mt-12 text-center">
          <Link href="/shop"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#000000] transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,237,43,0.45)]"
            style={{ background: "linear-gradient(135deg,#fbed2b,#e8d800)" }}>
            Shop All Speakers
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
