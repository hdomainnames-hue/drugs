import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const user = process.env.ADMIN_USER;
    const pass = process.env.ADMIN_PASS;

    if (user && pass) {
      const auth = req.headers.get("authorization");
      const ok = (() => {
        if (!auth) return false;
        const [type, token] = auth.split(" ");
        if (type?.toLowerCase() !== "basic" || !token) return false;
        try {
          const decoded = atob(token);
          const idx = decoded.indexOf(":");
          if (idx === -1) return false;
          const u = decoded.slice(0, idx);
          const p = decoded.slice(idx + 1);
          return u === user && p === pass;
        } catch {
          return false;
        }
      })();

      if (!ok) {
        return new NextResponse("Authentication required", {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Admin"',
          },
        });
      }
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
