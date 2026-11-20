import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Parses an HTTP Basic Authorization header and checks it against the expected
 * credentials. The password may contain ":" (only the first colon separates).
 */
function isAuthorizedBasic(header: string | null, user: string, pass: string): boolean {
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice("Basic ".length).trim());
  } catch {
    return false;
  }
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;
  return decoded.slice(0, separator) === user && decoded.slice(separator + 1) === pass;
}

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
    const expectedUser = process.env.STAGING_AUTH_USER;
    const expectedPass = process.env.STAGING_AUTH_PASS;

    // Fail closed: staging is never open when credentials are not configured.
    if (!expectedUser || !expectedPass) {
      return new NextResponse("Staging access credentials are not configured.", {
        status: 503,
        headers: { "X-Robots-Tag": "noindex, nofollow, noarchive" },
      });
    }

    if (isAuthorizedBasic(req.headers.get("authorization"), expectedUser, expectedPass)) {
      const response = NextResponse.next();
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      response.headers.set("X-Environment", "staging");
      return response;
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
