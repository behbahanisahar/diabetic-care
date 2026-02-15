import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = ["/admin/patients"];
const LOGIN_PATH = "/admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and API routes
  if (pathname === LOGIN_PATH || pathname.startsWith("/api") || pathname.startsWith("/patient/")) {
    return NextResponse.next();
  }

  // Protect admin patient routes - check cookie
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("diabetic_admin");
    if (session?.value !== "authenticated") {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
