import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isStaging = process.env.APP_ENV === "staging";
  const { pathname } = req.nextUrl;

  // 1. Whitelist Health Check, Webhooks, and Static Assets from Basic Auth
  const isPublicRoute =
    pathname === "/api/health" ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname === "/favicon.ico";

  // 2. Enforce Free Staging Access Restriction via HTTP Basic Auth
  if (isStaging && !isPublicRoute) {
    const basicAuth = req.headers.get("authorization");

    // Default staging credentials if not overridden in platform secrets
    const expectedUser = process.env.STAGING_AUTH_USER || "lonewolf";
    const expectedPass = process.env.STAGING_AUTH_PASS || "staging2026";

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      if (authValue) {
        const [user, pwd] = Buffer.from(authValue, "base64").toString().split(":");
        if (user === expectedUser && pwd === expectedPass) {
          const response = NextResponse.next();
          response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
          response.headers.set("X-Environment", "staging");
          return response;
        }
      }
    }

    return new NextResponse("Authentication required for LoneWolf Staging Environment.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="LoneWolf Staging Environment"',
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  }

  // 3. For all other routes, inject security headers
  const response = NextResponse.next();
  if (isStaging) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Environment", "staging");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

