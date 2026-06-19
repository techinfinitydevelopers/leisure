import type { Metadata } from "next";
import { getAllProductsDB } from "@/lib/db-products";
import ShopProductCard from "@/components/ShopProductCard";

export const dynamic = "force-dynamic";

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
            <ShopProductCard
              key={product.slug}
              slug={product.slug}
              model={product.model}
              tagline={product.tagline}
              price={product.price}
              mrp={product.mrp}
              savePercent={savePercent}
              fallbackImageUrl={product.imageUrl}
            />
          );
        })}
      </section>
    </main>
  );
}
