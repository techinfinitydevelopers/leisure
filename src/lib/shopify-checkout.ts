"use client";

// Client-side helper to hand a local cart off to Shopify's hosted checkout.
// Builds a fresh Shopify cart with the provided lines and returns the
// `checkoutUrl` the browser should redirect to.

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

export type CheckoutLine = { variantId: string; quantity: number };

type CartCreateResponse = {
  data?: {
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  };
  errors?: unknown;
};

/**
 * Create a Shopify cart with the given lines and return the checkout URL.
 * Throws with a human-readable message on failure so the caller can surface it.
 */
export async function createShopifyCheckout(
  lines: CheckoutLine[],
): Promise<string> {
  if (!DOMAIN || !TOKEN) {
    throw new Error("Shopify is not configured.");
  }
  if (lines.length === 0) {
    throw new Error("Cart is empty.");
  }

  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `;

  const res = await fetch(
    `https://${DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            lines: lines.map((l) => ({
              merchandiseId: l.variantId,
              quantity: l.quantity,
            })),
          },
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`Shopify cart create failed (${res.status}).`);
  const json = (await res.json()) as CartCreateResponse;
  const errors = json.data?.cartCreate?.userErrors ?? [];
  if (errors.length > 0) throw new Error(errors[0].message);
  const url = json.data?.cartCreate?.cart?.checkoutUrl;
  if (!url) throw new Error("Shopify did not return a checkout URL.");
  return url;
}
