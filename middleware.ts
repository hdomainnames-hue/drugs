import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
