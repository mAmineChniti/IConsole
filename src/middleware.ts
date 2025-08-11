import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = request.cookies.get("user");
  const token = request.cookies.get("token");
  const isLoggedIn = !!(user && token);

  const protectedRoutes = [
    "/dashboard/overview",
    "/dashboard/instances",
    "/dashboard/create-instance",
    "/dashboard/images",
    "/dashboard/projects",
  ];

  if (pathname === "/") {
    return isLoggedIn
      ? NextResponse.redirect(new URL("/dashboard/overview", request.url))
      : NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/dashboard" || pathname === "/login") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url));
  }

  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    pathname === "/dashboard";

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
