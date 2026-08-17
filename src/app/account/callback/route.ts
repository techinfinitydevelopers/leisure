import { cookies } from "next/headers";
import { exchangeCodeForTokens, publicOrigin } from "@/lib/customer-account";
import { PKCE_COOKIE, setCustomerSession } from "@/lib/customer-session";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const store = await cookies();
  const pkceRaw = store.get(PKCE_COOKIE)?.value;
  store.delete(PKCE_COOKIE);

  if (!code || !state || !pkceRaw) {
    return Response.redirect(`${origin}/account?error=missing_code`);
  }

  const { state: expectedState, codeVerifier } = JSON.parse(pkceRaw);
  if (state !== expectedState) {
    // Either a stale/replayed callback or a CSRF attempt — either way, don't
    // exchange the code.
    return Response.redirect(`${origin}/account?error=state_mismatch`);
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      redirectUri: `${origin}/account/callback`,
      codeVerifier,
    });
    await setCustomerSession(tokens);
  } catch (err) {
    console.error("Customer login failed:", err);
    return Response.redirect(`${origin}/account?error=login_failed`);
  }

  return Response.redirect(`${origin}/account`);
}
