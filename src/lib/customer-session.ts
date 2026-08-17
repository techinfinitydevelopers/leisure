// Customer login session (v1) — mirrors the simplicity of src/lib/auth.ts's
// admin cookie, one step up: this cookie holds real OAuth tokens (not just an
// "ok" flag), since the Customer Account API needs a live access_token on
// every call. httpOnly + secure + sameSite=lax keeps it out of reach of
// page JS and cross-site requests; it is not additionally encrypted, so
// treat this the same way as any other session cookie holding bearer tokens.
import { cookies } from "next/headers";
import { refreshTokens, type TokenSet } from "@/lib/customer-account";

export const CUSTOMER_SESSION_COOKIE = "customer_session";

// PKCE state, alive only for the few seconds between /account/login and
// /account/callback.
export const PKCE_COOKIE = "customer_oauth_pkce";

// Shared with proxy.ts, which is the one place that can reliably PERSIST a
// refreshed session (see the big comment on getCustomerSession() below).
export const CUSTOMER_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // Outlive the access token (proxy.ts/getCustomerSession() refresh it) but
  // don't outlive the refresh token itself (Shopify's is long-lived, this is
  // just a sane upper bound so a stale cookie doesn't linger forever).
  maxAge: 60 * 60 * 24 * 30,
};

export type CustomerSession = TokenSet;

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const raw = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!raw) return null;

  let session: CustomerSession;
  try {
    session = JSON.parse(raw);
  } catch {
    return null;
  }

  const expiresAt = session.obtainedAt + session.expires_in * 1000;
  // Refresh a little early rather than right at the edge of expiry.
  if (Date.now() < expiresAt - 60_000) return session;

  // Next.js forbids writing cookies during a Server Component render (only
  // Server Actions and Route Handlers may). This function is called from
  // both — so a refresh triggered by rendering a page (e.g. /support,
  // /account/tickets) computes a valid `refreshed` object here and returns
  // it for THIS render, but the `.set()` below throws and is swallowed,
  // meaning the browser's cookie is never actually updated.
  //
  // That used to break the customer entirely: proxy.ts didn't refresh
  // anything, so the next page load re-sent the SAME now-once-used
  // refresh_token. Shopify rotates refresh tokens on use, so that retry
  // failed, and the customer was logged out — despite having "just" logged
  // in — the moment their access_token (short-lived) first expired.
  //
  // Fix: proxy.ts now does the real, persistent refresh (it runs as
  // middleware, which CAN write response cookies) for every /account* and
  // /support request BEFORE any Server Component renders, so by the time
  // this function runs the cookie is already fresh. The refresh attempt
  // here is now just a same-request fallback for the Server Action call
  // sites (e.g. submitTicketReply) where a `.set()` succeeds normally.
  try {
    const refreshed = await refreshTokens(session.refresh_token);
    try {
      await setCustomerSession(refreshed);
    } catch {
      // Server Component context — proxy.ts is responsible for persisting.
    }
    return refreshed;
  } catch {
    // Refresh token is dead too — the customer has to log in again.
    try {
      await clearCustomerSession();
    } catch {
      // Same Server Component restriction as above.
    }
    return null;
  }
}

export async function setCustomerSession(session: CustomerSession) {
  const store = await cookies();
  store.set(CUSTOMER_SESSION_COOKIE, JSON.stringify(session), CUSTOMER_SESSION_COOKIE_OPTIONS);
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(CUSTOMER_SESSION_COOKIE);
}
