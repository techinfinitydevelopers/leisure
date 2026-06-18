import Link from "next/link";
import type { Metadata } from "next";
import { getAllProductsDB } from "@/lib/db-products";
import ProductPlaceholder from "@/components/ProductPlaceholder";

export const dynamic = "force-dynamic";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const metadata: Metadata = {
  title: "The Collection — Leisure",
  description:
    "Explore the full range of Leisure premium retro Bluetooth speakers. Sound Your Wild.",
};

export default async function Shop() {
  const products = await getAllProductsDB();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-16 text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight text-offwhite sm:text-6xl">
          The Collection
        </h1>
        <p className="font-pinyon mt-3 text-4xl text-gold sm:text-5xl">
          Sound Your Wild.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const savePercent = Math.round(
            ((product.mrp - product.price) / product.mrp) * 100,
          );

          return (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="glass group flex flex-col overflow-hidden rounded-3xl p-5 transition duration-300 hover:-translate-y-2 hover:border-gold/40 hover:gold-glow"
            >
              <div className="h-56">
                <ProductPlaceholder
                  model={product.model}
                  slug={product.slug}
                  imageUrl={product.imageUrl}
                />
              </div>

              <div className="mt-5 flex flex-1 flex-col">
                <h2 className="font-display text-2xl font-bold text-offwhite">
                  {product.model}
                </h2>
                <p className="font-pinyon mt-1 text-2xl text-gold">
                  {product.tagline}
                </p>

                <div className="mt-4 flex items-end gap-3">
                  <span className="font-display text-2xl font-bold text-gold">
                    {inr.format(product.price)}
                  </span>
                  <span className="font-sans text-sm text-offwhite/40 line-through">
                    {inr.format(product.mrp)}
                  </span>
                  {savePercent > 0 && (
                    <span className="ml-auto font-sans text-xs font-semibold uppercase tracking-wider text-gold">
                      −{savePercent}%
                    </span>
                  )}
                </div>

                {/* Color dots */}
                <div className="mt-5 flex gap-2">
                  {product.colors.map((color) => (
                    <span
                      key={color.name}
                      className="h-5 w-5 rounded-full ring-1 ring-offwhite/30"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
