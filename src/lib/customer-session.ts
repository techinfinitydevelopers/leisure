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

  try {
    const refreshed = await refreshTokens(session.refresh_token);
    await setCustomerSession(refreshed);
    return refreshed;
  } catch {
    // Refresh token is dead too — the customer has to log in again.
    await clearCustomerSession();
    return null;
  }
}

export async function setCustomerSession(session: CustomerSession) {
  const store = await cookies();
  store.set(CUSTOMER_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Outlive the access token — getCustomerSession() refreshes it — but
    // don't outlive the refresh token itself (Shopify's is long-lived, this
    // is just a sane upper bound so a stale cookie doesn't linger forever).
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(CUSTOMER_SESSION_COOKIE);
}
