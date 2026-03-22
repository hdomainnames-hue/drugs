import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow emergency cache clear to bypass EVERYTHING
  if (pathname === "/api/emergency-clear-cache") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const user = process.env.ADMIN_USER?.trim();
    const pass = process.env.ADMIN_PASS?.trim();

    // Support bypassing Basic Auth with a query param for emergencies (e.g. ?bypass=AdminPassword123!)
    const bypass = req.nextUrl.searchParams.get("bypass");
    if (bypass && pass && bypass === pass) {
      console.log(`[AdminAuth] Bypassing Basic Auth for ${pathname} via query param`);
      return NextResponse.next();
    }

    if (user && pass) {
      const auth = req.headers.get("authorization");
      
      const ok = (() => {
        if (!auth) {
          console.log(`[AdminAuth] Missing authorization header for ${pathname}`);
          return false;
        }

        const parts = auth.trim().split(/\s+/);
        if (parts.length !== 2 || parts[0].toLowerCase() !== "basic") {
          console.log(`[AdminAuth] Invalid auth format: ${parts[0]}`);
          return false;
        }

        try {
          const decoded = atob(parts[1]);
          const [u, ...pParts] = decoded.split(":");
          const p = pParts.join(":"); // Handle passwords containing colons
          
          const userMatch = u.trim() === user;
          const passMatch = p.trim() === pass;

          if (!userMatch || !passMatch) {
            console.log(`[AdminAuth] Credentials mismatch for ${u.trim()}. Expected user: ${user}`);
            return false;
          }
          return true;
        } catch (e) {
          console.error("[AdminAuth] Decode/Parse error:", e);
          return false;
        }
      })();

      if (!ok) {
        return new NextResponse("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Admin"',
            "x-admin-debug": "auth-failed",
          },
        });
      }
    } else {
      console.error("[AdminAuth] Missing ADMIN_USER or ADMIN_PASS in environment variables");
      return new NextResponse("Admin environment variables not configured", { status: 500 });
    }
  }

  const seg = pathname.split("/").filter(Boolean)[0];
  const lang = seg === "en" ? "en" : "ar";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-lang", lang);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
