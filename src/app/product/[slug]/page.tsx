import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlugDB } from "@/lib/db-products";
import { getMergedExperience } from "@/lib/merge-experience";
import { getStorefrontProductBySlug } from "@/lib/products-source";
import ProductExperience from "@/components/product/ProductExperience";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Rich R3F experience carries its own marketing copy — prefer it for metadata.
  const experience = await getMergedExperience(slug);
  if (experience) {
    return {
      title: `Leisure ${experience.name} — ${experience.tagline}`,
      description: experience.blurb,
    };
  }

  const product = await getStorefrontProductBySlug(slug);
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

  // If a rich scroll-animated experience exists for this slug, render it. It is
  // self-contained (own hero, pricing, specs, 3D roaming plane) and works even
  // for showcase-only slugs (e.g. drift2) that aren't in the commerce DB.
  //
  // The classic (pre-R3F) static page below is now only a safety net for a
  // storefront product with no experience entry — e.g. a Shopify handle that
  // isn't in PRODUCT_EXPERIENCES. The `drift-classic` alias that used to force
  // this path for DRIFT has been removed.
  const experience = await getMergedExperience(slug);
  if (experience) {
    // resolve the commerce product id (Shopify first, then DB) so cart works
    const db = await getStorefrontProductBySlug(slug);
    // Every rich slug — EDGE included — renders through the one shared
    // component, so section placement is identical across product pages.
    // EDGE used to branch off to a bespoke cinema-mode layout
    // (components/product/edge/) which is now unreferenced.
    return <ProductExperience product={experience} productId={db?.id ?? 0} />;
  }

  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/shop"
        className="font-sans text-sm tracking-wide text-offwhite/60 transition hover:text-gold"
      >
        ← All Speakers
      </Link>

      {/* Minimal header. The old rich <ProductHero> branch was unreachable —
          it only rendered when getProduct(slug) matched, and every slug in
          products.ts also has a PRODUCT_EXPERIENCES entry, so those all
          returned above. A slug that lands here is by definition one we have
          no static data for (e.g. a Shopify handle with no experience). */}
      <section className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="min-h-[420px] rounded-3xl border border-white/10 bg-[#0d0d0d]" />
        <div>
          <h1 className="font-display text-5xl font-bold text-offwhite">{product.model}</h1>
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
        <p className="font-pinyon text-4xl text-gold sm:text-5xl">
          Sound Your Wild.
        </p>
        <Link href="/shop" className="btn-outline">
          Explore All Speakers
        </Link>
      </section>
    </main>
  );
}
