// Server-only: overlays live DB (dashboard) data onto the static R3F experience
// config. Content + images come from the DB when present; animation/choreography
// (track, deep-dives, feature stops, 3D model, parallax) stays in the static file.
import { getProductExperience } from "@/lib/product-experience";
import type { ProductExperience, ExpColor } from "@/lib/product-experience";
import { getStorefrontProductBySlug } from "@/lib/products-source";

function slugifyId(name: string, i: number): string {
  const s = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s || `c${i}`;
}

/**
 * Returns the experience for a slug with DB values merged in. Falls back to the
 * pure static config when there's no matching experience or no DB row. Empty DB
 * fields never blank out rich static content — each field only overrides when
 * the DB actually has a value.
 */
export async function getMergedExperience(
  slug: string,
): Promise<ProductExperience | null> {
  const base = getProductExperience(slug);
  if (!base) return null;

  const db = await getStorefrontProductBySlug(slug);
  if (!db) return base;

  // colors + per-color images from the DB; fall back to the static cutouts when
  // a DB colour has no images yet (keeps the page looking right pre-upload).
  const colors: ExpColor[] =
    db.colors.length > 0
      ? db.colors.map((c, i) => {
          const fallback =
            base.colors[i]?.images ?? (db.imageUrl ? [db.imageUrl] : []);
          const images =
            c.images && c.images.length > 0 ? c.images : fallback;
          return {
            id: slugifyId(c.name, i),
            name: c.name,
            hex: c.hex,
            images,
            variantId: c.variantId,
          };
        })
      : base.colors;

  const discountPct =
    db.mrp > 0 && db.price > 0
      ? Math.round(((db.mrp - db.price) / db.mrp) * 100)
      : base.discountPct;

  return {
    ...base,
    name: db.model || base.name,
    tagline: db.tagline || base.tagline,
    blurb: db.description || base.blurb,
    blurbHtml: db.descriptionHtml || base.blurbHtml,
    overview: db.overview || db.description || base.overview,
    price: db.price || base.price,
    mrp: db.mrp || base.mrp,
    discountPct,
    colors,
    specs:
      db.specs.length > 0
        ? db.specs.map((s) => ({ k: s.label, v: s.value }))
        : base.specs,
    technical:
      db.technical.length > 0
        ? db.technical.map((s) => ({ k: s.label, v: s.value }))
        : base.technical,
    box:
      db.inBox.length > 0
        ? db.inBox.map((name) => ({ name, note: "" }))
        : base.box,
    // Optional marketing extras from Shopify metafields — only override when
    // the metafield actually has values, so static content isn't wiped out.
    // Highlights: comma-separated entries in the metafield support an optional
    // "value | label" split (e.g. "10W | Power" -> value=10W label=Power).
    highlights:
      db.highlights && db.highlights.length > 0
        ? db.highlights.map((raw) => {
            const parts = raw.split(/\s*\|\s*/);
            return parts.length > 1
              ? { value: parts[0], label: parts.slice(1).join(" | ") }
              : { value: raw, label: "" };
          })
        : base.highlights,
    faq: db.faq && db.faq.length > 0 ? db.faq : base.faq,
    deepDives:
      db.deepDives && db.deepDives.length > 0 ? db.deepDives : base.deepDives,
    features:
      db.features && db.features.length > 0
        ? db.features.map((f) => ({
            icon: f.icon ?? "sparkle",
            label: f.label,
            sub: f.sub ?? "",
          }))
        : base.features,
    landingStage:
      db.landingEyebrow || db.landingCaption
        ? {
            eyebrow: db.landingEyebrow ?? base.landingStage?.eyebrow ?? "",
            caption: db.landingCaption ?? base.landingStage?.caption ?? "",
          }
        : base.landingStage,
    lifestyleLoop: db.lifestyleLoop || base.lifestyleLoop,
  };
}
