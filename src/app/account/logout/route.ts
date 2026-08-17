import { LOGOUT_URL, publicOrigin } from "@/lib/customer-account";
import { clearCustomerSession, getCustomerSession } from "@/lib/customer-session";

export async function GET(request: Request) {
  const origin = publicOrigin(request);
  const session = await getCustomerSession();
  await clearCustomerSession();

  if (!session) {
    return Response.redirect(origin);
  }

  // Also end the session at Shopify's end, otherwise a fresh /account/login
  // can silently re-authenticate the same browser without a credential
  // prompt (Shopify's own SSO cookie is still live).
  const url = new URL(LOGOUT_URL);
  url.searchParams.set("id_token_hint", session.id_token);
  url.searchParams.set("post_logout_redirect_uri", origin);
  return Response.redirect(url.toString());
}
