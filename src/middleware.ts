import { NextRequest, NextResponse } from "next/server";

// Protected routes: API requires a session cookie. The actual session
// validation happens in the route handlers (DB check); the middleware
// does a cheap presence check and blocks obvious anonymous traffic early.
const PROTECTED = ["/api/items"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !req.cookies.get("session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
