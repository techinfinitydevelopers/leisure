// Shopify Storefront API client (headless commerce). Fetches products from the
// Shopify store and adapts them to the DbProduct shape so the existing pages
// (shop grid + product detail + experience overlay) keep working unchanged.
//
// Storefront token is safe to expose in the browser but we still call from
// server components (avoids CORS + keeps the network graph in-process).
import type { DbProduct, ProductColor, SpecPair } from "@/lib/db-products";

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

export function isShopifyConfigured(): boolean {
  return Boolean(DOMAIN && TOKEN);
}

type GqlResult<T> = { data?: T; errors?: unknown };

async function storefront<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  if (!isShopifyConfigured()) return null;
  try {
    const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
      // short cache so admin edits show up quickly, but we don't hammer the API
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GqlResult<T>;
    if (json.errors) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Raw Shopify types (only the fields we consume) ───────────────────────

type Money = { amount: string; currencyCode: string };
type ShopifyImage = { url: string; altText: string | null };
type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
};
type ShopifyMetafield = {
  namespace: string;
  key: string;
  type: string;
  value: string;
} | null;

type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariant }[] };
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  options: { name: string; values: string[] }[];
  metafields: ShopifyMetafield[];
};

// Product metafields to pull from Shopify (namespace:key) and how to display
// them. `spec` entries fill the DbProduct.specs list (label + value pairs);
// `technical` entries fill DbProduct.technical.
const SPEC_METAFIELDS: { key: string; label: string }[] = [
  { key: "output_power", label: "Output Power" },
  { key: "battery_capacity", label: "Battery Capacity" },
  { key: "playtime", label: "Playtime" },
  { key: "connectivity", label: "Connectivity" },
  { key: "charging_time", label: "Charging Time" },
  { key: "charging_input", label: "Charging Input" },
];
const TECHNICAL_METAFIELDS: { key: string; label: string }[] = [
  { key: "frequency_response", label: "Frequency Response" },
  { key: "input_sensitivity", label: "Input Sensitivity" },
  { key: "driver_size", label: "Driver Size" },
  { key: "product_weight", label: "Product Weight" },
  { key: "product_size", label: "Product Size" },
];
const METAFIELD_IDENTIFIERS = [
  { namespace: "custom", key: "overview" },
  { namespace: "custom", key: "what_s_in_the_box" },
  { namespace: "custom", key: "highlights" },
  { namespace: "custom", key: "faq" },
  { namespace: "custom", key: "deep_dives" },
  { namespace: "custom", key: "features" },
  { namespace: "custom", key: "landing_caption" },
  { namespace: "custom", key: "lifestyle_loop" },
  ...SPEC_METAFIELDS.map((m) => ({ namespace: "custom", key: m.key })),
  ...TECHNICAL_METAFIELDS.map((m) => ({ namespace: "custom", key: m.key })),
];

// Note: inventory fields (totalInventory, quantityAvailable) require the
// `unauthenticated_read_product_inventory` scope which the default Storefront
// token doesn't have. We rely on `availableForSale` (which any token can read).
const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    featuredImage { url altText }
    # High enough to cover every colour variant's full image set (e.g. 2
    # colours x 6 images = 12) — was 10, which silently truncated later
    # variants' images once a product had enough colours/photos combined.
    images(first: 50) { edges { node { url altText } } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    options { name values }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText }
        }
      }
    }
    metafields(identifiers: [
      ${METAFIELD_IDENTIFIERS.map((m) => `{namespace:"${m.namespace}",key:"${m.key}"}`).join(",")}
    ]) { namespace key type value }
  }
`;

// ─── Adapter ──────────────────────────────────────────────────────────────
// Convert a Shopify Product to the DbProduct shape our storefront expects.

// Common spelling variations for color names so filename-based image matching
// works even when the merchant's variant name and asset filename differ
// (e.g. variant "Gray" ↔ asset "grey-...png").
function colorAliases(name: string): string[] {
  const n = name.toLowerCase().trim();
  const groups: string[][] = [
    ["gray", "grey"],
    ["colour", "color"],
    ["silver", "chrome"],
  ];
  const out = new Set<string>([n]);
  // Split multi-word names ("Light Grey" → ["light grey","light","grey"]) so
  // filename heuristics still catch images tagged with a shorter color name.
  for (const word of n.split(/\s+/)) if (word.length > 2) out.add(word);
  for (const g of groups)
    for (const term of Array.from(out))
      if (g.includes(term)) for (const a of g) out.add(a);
  return Array.from(out);
}

function pickHex(colorName: string): string {
  const map: Record<string, string> = {
    black: "#1c1c1c", white: "#f3efe6", grey: "#8a8a8a", gray: "#8a8a8a",
    red: "#c81f1f", blue: "#1f4bc8", green: "#1f8a4c", yellow: "#fbed2b",
    brown: "#5a3a1e", silver: "#c0c0c0", gold: "#c8a13a", pink: "#e07a9b",
    orange: "#f08a1e", purple: "#7a3ec4",
  };
  return map[colorName.toLowerCase()] ?? "#333333";
}

// Deterministic small positive int from a Shopify gid (used as a stand-in for
// the numeric productId that cart/order code expects).
function gidToInt(gid: string): number {
  let h = 0;
  for (let i = 0; i < gid.length; i++) h = (h * 31 + gid.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function shopifyToDbProduct(p: ShopifyProduct): DbProduct {
  const price = Math.round(Number(p.priceRange.minVariantPrice.amount));
  const mrpRaw = p.compareAtPriceRange?.minVariantPrice?.amount;
  const mrpNum = mrpRaw ? Number(mrpRaw) : 0;
  const mrp = mrpNum > 0 ? Math.round(mrpNum) : price;
  const allImages = [
    ...(p.featuredImage ? [p.featuredImage.url] : []),
    ...p.images.edges.map((e) => e.node.url),
  ];
  const uniqueImages = Array.from(new Set(allImages));

  // Colors: pull from a "Color" option if present, else synthesise a single
  // "Default" swatch so downstream code (which iterates colors[i].images) still
  // has the product's images to show.
  const colorOption = p.options.find((o) => /colou?r/i.test(o.name));
  // Product-level images that don't match any color name (e.g. a generic
  // "dominator.png" cover shot) are treated as shared images — included after
  // each variant's own images so they appear regardless of the selected color.
  const allColorNeedles = colorOption
    ? colorOption.values.flatMap((v) => colorAliases(v))
    : [];
  const sharedImages = uniqueImages.filter((u) => {
    const file = (u.split("/").pop() ?? "").toLowerCase();
    return !allColorNeedles.some((n) => file.includes(n));
  });

  const colors: ProductColor[] = colorOption
    ? colorOption.values.map((name) => {
        // primary: the variant image assigned in Shopify (if any)
        const variant = p.variants.edges
          .map((e) => e.node)
          .find((v) => v.selectedOptions.some((o) => /colou?r/i.test(o.name) && o.value === name));
        // heuristic: any other product image whose filename contains this
        // color name (or a common spelling variant) belongs here too — e.g.
        // "tiltedblack-...png" for Black, "grey-front.png" for a "Gray" variant.
        const needles = colorAliases(name);
        const related = uniqueImages.filter((u) => {
          const file = (u.split("/").pop() ?? "").toLowerCase();
          return needles.some((n) => file.includes(n));
        });
        // Shared (color-agnostic) images come FIRST so the "generic" cover
        // shot is the default hero still, followed by the variant-specific
        // image and any other filename-matched shots.
        const imgs = [
          ...sharedImages,
          ...(variant?.image?.url ? [variant.image.url] : []),
          ...related,
        ];
        const deduped = Array.from(new Set(imgs));
        return {
          name,
          hex: pickHex(name),
          images: deduped.length > 0 ? deduped : uniqueImages.slice(0, 6),
          variantId: variant?.id,
        };
      })
    : uniqueImages.length > 0
      ? [
          {
            name: "Default",
            hex: "#333333",
            images: uniqueImages.slice(0, 6),
            variantId: p.variants.edges[0]?.node.id,
          },
        ]
      : [];

  // Metafields (custom.*) → specs pairs + overview override
  const mfByKey = new Map<string, string>();
  for (const m of p.metafields ?? []) {
    if (m && m.value) mfByKey.set(m.key, m.value);
  }
  const specs: SpecPair[] = SPEC_METAFIELDS
    .map(({ key, label }) => ({ label, value: mfByKey.get(key) ?? "" }))
    .filter((s) => s.value);
  const technical: SpecPair[] = TECHNICAL_METAFIELDS
    .map(({ key, label }) => ({ label, value: mfByKey.get(key) ?? "" }))
    .filter((s) => s.value);
  const overviewText = mfByKey.get("overview") || "";

  // Comma / newline separated list → string[] (used for single-line text fields
  // that hold multiple items, e.g. highlights, what's in the box).
  // Turn a list-metafield value into an array of items. Handles both formats
  // the storefront can hand back:
  //   • `list.*` types → JSON array string  (["a","b","c"])
  //   • plain single_line_text → separator-joined string ("a, b, c")
  // And within each array item, further-split on commas/newlines/bullets so
  // users can also stuff multiple items into a single list entry.
  const splitList = (raw: string | undefined): string[] => {
    if (!raw) return [];
    let items: string[] = [];
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) items = parsed.map((v) => String(v));
      } catch {
        /* fall through to string split */
      }
    }
    if (items.length === 0) items = [trimmed];
    return items
      .flatMap((s) => s.split(/[,\n•]/))
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const parseJson = <T>(raw: string | undefined, fallback: T): T => {
    if (!raw) return fallback;
    try {
      const v = JSON.parse(raw);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  };

  const inBoxItems = splitList(mfByKey.get("what_s_in_the_box"));
  const highlightsList = splitList(mfByKey.get("highlights"));
  const faqList = parseJson<{ q: string; a: string }[]>(mfByKey.get("faq"), []);
  const deepDivesList = parseJson<{ title: string; copy: string }[]>(
    mfByKey.get("deep_dives"),
    [],
  );
  const featuresList = parseJson<
    { icon?: string; label: string; sub?: string }[]
  >(mfByKey.get("features"), []);
  // "Eyebrow / Caption" — split on " / " if present, else treat whole as caption
  const landingRaw = (mfByKey.get("landing_caption") ?? "").trim();
  const landingParts = landingRaw.split(/\s*\/\s*/);
  const landingEyebrow = landingParts.length > 1 ? landingParts[0] : undefined;
  const landingCaption =
    landingParts.length > 1 ? landingParts.slice(1).join(" / ") : landingRaw || undefined;

  return {
    id: gidToInt(p.id),
    slug: p.handle,
    model: p.title,
    tagline: p.productType || p.vendor || "",
    // Blurb above the price = Shopify's built-in Description (rich text goes
    // in `descriptionHtml`, plain fallback in `description`). The overview
    // section below uses the dedicated `custom.overview` metafield.
    description: p.description || overviewText,
    descriptionHtml: p.descriptionHtml || undefined,
    overview: overviewText || undefined,
    highlights: highlightsList.length > 0 ? highlightsList : undefined,
    faq: faqList.length > 0 ? faqList : undefined,
    deepDives: deepDivesList.length > 0 ? deepDivesList : undefined,
    features: featuresList.length > 0 ? featuresList : undefined,
    landingEyebrow,
    landingCaption,
    lifestyleLoop: (mfByKey.get("lifestyle_loop") || "").trim() || undefined,
    price,
    mrp,
    // We can't read exact inventory without an extra scope; treat "available"
    // as in stock (99) so cart UI doesn't disable the button spuriously.
    stock: p.availableForSale ? 99 : 0,
    imageUrl: p.featuredImage?.url ?? uniqueImages[0] ?? "",
    colors,
    specs,
    inBox: inBoxItems,
    technical,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────

/** All products from Shopify, mapped to DbProduct. Empty array if not configured or no products. */
export async function getShopifyProducts(): Promise<DbProduct[]> {
  const data = await storefront<{ products: { edges: { node: ShopifyProduct }[] } }>(
    `${PRODUCT_FRAGMENT}
    query Products { products(first: 50) { edges { node { ...ProductFields } } } }`,
  );
  if (!data) return [];
  return data.products.edges.map((e) => shopifyToDbProduct(e.node));
}

/** One product by handle (slug). Null if not configured or not found. */
export async function getShopifyProductByHandle(handle: string): Promise<DbProduct | null> {
  const data = await storefront<{ product: ShopifyProduct | null }>(
    `${PRODUCT_FRAGMENT}
    query ProductByHandle($handle: String!) { product(handle: $handle) { ...ProductFields } }`,
    { handle },
  );
  if (!data || !data.product) return null;
  return shopifyToDbProduct(data.product);
}
