import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_API_ROUTES = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }


  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }


  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });


  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
