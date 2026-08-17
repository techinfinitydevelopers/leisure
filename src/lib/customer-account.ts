// Shopify Customer Account API — a separate OAuth 2.0 (PKCE) system from the
// Storefront API used elsewhere in src/lib/shopify.ts. This is what lets a
// shopper log in on our headless storefront and see "their" data (orders,
// and — via leisure-support-app's /api/tickets — their warranty tickets).
//
// Client ID + numeric shop ID come from Shopify Admin → the "Headless" sales
// channel → Customer Account API settings. They are NOT secrets (this is a
// public/native OAuth client, no client_secret) but the shop ID still has to
// be baked into every endpoint URL below.
//
// Server-only by convention, not by import guard: every consumer is a route
// handler (route.ts) or a server component, which Next's App Router already
// keeps out of the client bundle.

export const CUSTOMER_ACCOUNT_CLIENT_ID = "d3f329d6-1f3e-431e-acda-e6131f1dc9c9";
export const SHOPIFY_SHOP_ID = "81865572565";
const API_VERSION = "2025-01";

const AUTH_BASE = `https://shopify.com/authentication/${SHOPIFY_SHOP_ID}`;

export const AUTHORIZE_URL = `${AUTH_BASE}/oauth/authorize`;
export const TOKEN_URL = `${AUTH_BASE}/oauth/token`;
export const LOGOUT_URL = `${AUTH_BASE}/logout`;
export const CUSTOMER_API_URL = `https://shopify.com/${SHOPIFY_SHOP_ID}/account/customer/api/${API_VERSION}/graphql`;

// PKCE + OIDC — a public client can't hold a client_secret, so the code
// exchange is bound to this request instead via a verifier/challenge pair.
export function base64url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function codeChallengeFromVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(digest);
}

export type TokenSet = {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  obtainedAt: number; // ms epoch, so we know when access_token actually expires
};

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CUSTOMER_ACCOUNT_CLIENT_ID,
      redirect_uri: params.redirectUri,
      code: params.code,
      code_verifier: params.codeVerifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return { ...json, obtainedAt: Date.now() };
}

export async function refreshTokens(refreshToken: string): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CUSTOMER_ACCOUNT_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return { ...json, obtainedAt: Date.now() };
}

// Next dev's `request.url` reports the server's own bind address
// (localhost:3000) even when the request actually arrived through a reverse
// proxy — e.g. the cloudflared tunnel this OAuth flow needs, since Shopify's
// Customer Account API refuses a localhost redirect_uri outright. Read the
// externally-visible origin from the forwarded headers the proxy sets
// instead, so /account/login and /account/callback always compute the exact
// same redirect_uri that's registered in the Headless channel.
export function publicOrigin(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  return `${proto}://${host}`;
}

const IDENTITY_QUERY = `#graphql
  query CurrentCustomerIdentity {
    customer {
      id
      firstName
      lastName
      emailAddress { emailAddress }
      phoneNumber { phoneNumber }
    }
  }
`;

export type CustomerIdentity = {
  id: string; // gid://shopify/Customer/123456789 — this IS the customerId tickets are keyed on
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
};

/** The one place that turns an access_token into "who is this customer" —
 *  every page that needs the customer's id (to create or list tickets) goes
 *  through this rather than re-writing the query. */
export async function getCurrentCustomer(accessToken: string): Promise<CustomerIdentity> {
  const data = await customerAccountQuery<{
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      emailAddress: { emailAddress: string } | null;
      phoneNumber: { phoneNumber: string } | null;
    };
  }>(accessToken, IDENTITY_QUERY);

  return {
    id: data.customer.id,
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
    email: data.customer.emailAddress?.emailAddress ?? null,
    phone: data.customer.phoneNumber?.phoneNumber ?? null,
  };
}

export async function customerAccountQuery<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(CUSTOMER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Customer Account API error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}
