// Public storefront product source. Merges Shopify (headless backend) with the
// local Product DB so the frontend shows products from both. Shopify wins when
// the same slug/handle exists in both places (Shopify is the source of truth
// for commerce; local DB acts as a fallback for pre-configured/experience
// products and legacy content).
//
// Dashboard + admin routes deliberately DO NOT use this — they read straight
// from the local DB (that's what they manage).
import {
  getAllProductsDB,
  getProductBySlugDB,
  type DbProduct,
} from "@/lib/db-products";
import {
  getShopifyProducts,
  getShopifyProductByHandle,
  isShopifyConfigured,
} from "@/lib/shopify";

/** Products for the public storefront (Shopify + local, deduped by slug). */
export async function getStorefrontProducts(): Promise<DbProduct[]> {
  if (!isShopifyConfigured()) return getAllProductsDB();

  const [shopify, local] = await Promise.all([
    getShopifyProducts(),
    getAllProductsDB(),
  ]);

  const seen = new Set(shopify.map((p) => p.slug));
  const merged = [...shopify];
  for (const p of local) if (!seen.has(p.slug)) merged.push(p);
  return merged;
}

/** One product by handle/slug for the public storefront. Shopify first, then local. */
export async function getStorefrontProductBySlug(
  slug: string,
): Promise<DbProduct | null> {
  if (isShopifyConfigured()) {
    const shopify = await getShopifyProductByHandle(slug);
    if (shopify) return shopify;
  }
  return getProductBySlugDB(slug);
}
