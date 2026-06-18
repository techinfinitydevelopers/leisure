import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";

const products = getAllProducts();

export default function ProductGridV3() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="font-pinyon text-4xl text-[#c8922a]">The Collection</p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase tracking-tight text-[#0f0102] sm:text-5xl">
            Meet the Range
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#0f0102]/45">
            Six speakers. One obsession. Each crafted to own its space.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const saving = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <Link key={p.slug} href={`/product/${p.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_60px_rgba(66,2,6,0.12)]"
                style={{ border: "1px solid rgba(66,2,6,0.08)" }}>

                {/* Hover border */}
                <span className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ boxShadow: "inset 0 0 0 1.5px rgba(66,2,6,0.25)" }} />

                {/* Image */}
                <div className="relative flex h-52 items-center justify-center p-6"
                  style={{ background: "rgba(247,242,234,0.7)" }}>
                  <div className="absolute inset-0 rounded-t-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(66,2,6,0.05), transparent)" }} />

                  <Image src={`/products/${p.slug}.png`} alt={p.model} width={200} height={200}
                    className="relative z-10 h-40 w-40 object-contain transition-transform duration-500 group-hover:scale-105" />

                  {saving > 0 && (
                    <span className="absolute right-4 top-4 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white"
                      style={{ background: "linear-gradient(135deg,#420206,#6b0508)" }}>
                      -{saving}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h3 className="font-display text-lg font-black uppercase tracking-wide text-[#0f0102]">{p.model}</h3>
                    <p className="font-pinyon text-xl text-[#c8922a]">{p.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold text-[#420206]">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#0f0102]/30 line-through">
                      ₹{p.mrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.colors.map((c) => (
                      <span key={c.name} title={c.name}
                        className="h-3.5 w-3.5 rounded-full border border-[rgba(15,1,2,0.15)]"
                        style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[rgba(66,2,6,0.07)] pt-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#420206]/50 transition-colors duration-300 group-hover:text-[#420206]">
                      View Details
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(66,2,6,0.2)] text-[#420206]/50 transition-all duration-300 group-hover:bg-[#420206] group-hover:text-white">
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

        {/* View all */}
        <div className="mt-12 text-center">
          <Link href="/shop"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(66,2,6,0.4)]"
            style={{ background: "linear-gradient(135deg,#420206,#6b0508)" }}>
            Shop All Speakers
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
