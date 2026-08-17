import { cookies } from "next/headers";
import {
  AUTHORIZE_URL,
  CUSTOMER_ACCOUNT_CLIENT_ID,
  codeChallengeFromVerifier,
  publicOrigin,
  randomToken,
} from "@/lib/customer-account";
import { PKCE_COOKIE } from "@/lib/customer-session";

function redirectUri(request: Request) {
  return `${publicOrigin(request)}/account/callback`;
}

export async function GET(request: Request) {
  const state = randomToken(16);
  const nonce = randomToken(16);
  const codeVerifier = randomToken(32);
  const codeChallenge = await codeChallengeFromVerifier(codeVerifier);

  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", CUSTOMER_ACCOUNT_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  // "email" gets us the customer's address without a separate profile
  // fetch; "customer-account-api:full" is the scope for the GraphQL API
  // itself (orders, profile) rather than the login step.
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("redirect_uri", redirectUri(request));
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  const store = await cookies();
  store.set(
    PKCE_COOKIE,
    JSON.stringify({ state, codeVerifier }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // the whole redirect round-trip should take seconds
    }
  );

  return Response.redirect(url.toString());
}
