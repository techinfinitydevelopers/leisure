import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlugDB } from "@/lib/db-products";
import { getProduct } from "@/lib/products";
import ProductActions from "@/components/ProductActions";

export const dynamic = "force-dynamic";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugDB(slug);

  if (!product) {
    return { title: "Leisure — Speaker not found" };
  }

  return {
    title: `Leisure ${product.model} — ${product.tagline}`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugDB(slug);

  if (!product) {
    notFound();
  }

  // Static product data has color+image metadata; DB product has pricing/specs
  const staticProduct = getProduct(slug);

  const savePercent = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/shop"
        className="font-sans text-sm tracking-wide text-offwhite/60 transition hover:text-gold"
      >
        ← All Speakers
      </Link>

      {/* Hero */}
      <section className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        {/* Gallery + color switcher + action buttons (client component) */}
        {staticProduct ? (
          <ProductActions
            productId={product.id}
            slug={slug}
            model={product.model}
            price={product.price}
            mrp={product.mrp}
            colors={staticProduct.colors}
          />
        ) : (
          <div className="min-h-[420px] rounded-3xl border border-white/10 bg-[#0d0d0d] lg:min-h-[560px]" />
        )}

        <div className="flex flex-col justify-center">
          <h1 className="font-display text-5xl font-bold tracking-tight text-offwhite sm:text-6xl">
            {product.model}
          </h1>
          <p className="font-pinyon mt-3 text-3xl text-gold sm:text-4xl">
            {product.tagline}
          </p>

          {/* Price block */}
          <div className="mt-8 flex flex-wrap items-end gap-4">
            <span className="font-display text-4xl font-bold text-gold sm:text-5xl">
              {inr.format(product.price)}
            </span>
            <span className="font-sans text-lg text-offwhite/40 line-through">
              {inr.format(product.mrp)}
            </span>
            {savePercent > 0 && (
              <span className="rounded-full border border-gold/40 px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider text-gold">
                Save {savePercent}%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="mt-24">
        <h2 className="font-display text-3xl font-bold text-gold">Overview</h2>
        <div className="glass mt-6 rounded-3xl p-8 sm:p-10">
          <p className="max-w-3xl text-lg font-light leading-relaxed text-offwhite/80 sm:text-xl">
            {product.description}
          </p>
        </div>
      </section>

      {/* Specifications */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold text-gold">
          Specifications
        </h2>
        <div className="glass mt-6 rounded-3xl p-8 sm:p-10">
          <dl className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-4 border-b border-offwhite/10 pb-4"
              >
                <dt className="font-sans text-sm uppercase tracking-wider text-offwhite/50">
                  {spec.label}
                </dt>
                <dd className="text-right font-display text-lg text-offwhite">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What's in the Box */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold text-gold">
          What&apos;s in the Box
        </h2>
        <div className="glass mt-6 rounded-3xl p-8 sm:p-10">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.inBox.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-gold gold-glow" />
                <span className="font-sans text-lg text-offwhite/90">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Technical Details */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold text-gold">
          Technical Details
        </h2>
        <div className="glass mt-6 rounded-3xl p-8 sm:p-10">
          <dl className="grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2">
            {product.technical.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between gap-4 border-b border-offwhite/10 pb-4"
              >
                <dt className="font-sans text-sm uppercase tracking-wider text-offwhite/50">
                  {spec.label}
                </dt>
                <dd className="text-right font-display text-lg text-offwhite">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Footer CTA band */}
      <section className="mt-28 flex flex-col items-center justify-center gap-6 rounded-3xl border border-offwhite/10 bg-gradient-to-br from-velvet via-nearblack to-deepblack py-20 text-center gold-glow">
        <p className="font-pinyon text-5xl text-gold sm:text-6xl">
          Sound Your Wild.
        </p>
        <Link href="/shop" className="btn-outline">
          Explore All Speakers
        </Link>
      </section>
    </main>
  );
}
