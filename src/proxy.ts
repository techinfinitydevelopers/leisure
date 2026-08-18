// Next.js 16 renamed `middleware` -> `proxy` (Node.js runtime, edge unsupported).
// Guards /dashboard pages (redirect to login) and /api/admin (401 JSON),
// except the login endpoints. Cookie-presence check is sufficient for v1.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { refreshTokens } from "@/lib/customer-account";
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE_OPTIONS,
} from "@/lib/customer-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ADMIN_COOKIE);

  // Public auth endpoints — always allowed.
  if (pathname === "/dashboard/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    if (!hasSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const loginUrl = new URL("/dashboard/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Customer session refresh — see the big comment on getCustomerSession()
  // in customer-session.ts. Server Components (the /account* and /support
  // pages) can't persist a refreshed cookie themselves; this is the one
  // place upstream of them that can, since middleware is allowed to write
  // response cookies. Without this, the customer got silently logged out
  // the moment their access_token first expired, no matter how recently
  // they'd logged in.
  const response = NextResponse.next();
  const raw = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (raw) {
    try {
      const session = JSON.parse(raw);
      const expiresAt = session.obtainedAt + session.expires_in * 1000;
      if (Date.now() >= expiresAt - 60_000) {
        const refreshed = await refreshTokens(session.refresh_token);
        response.cookies.set(
          CUSTOMER_SESSION_COOKIE,
          JSON.stringify(refreshed),
          CUSTOMER_SESSION_COOKIE_OPTIONS
        );
      }
    } catch {
      // Refresh token is dead too — clear it so the page renders its
      // logged-out state instead of retrying with a cookie that will never
      // work again.
      response.cookies.delete(CUSTOMER_SESSION_COOKIE);
    }
  }
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/support",
  ],
};
