import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if user is trying to access the sign-in page
  const isAuthPage = pathname.startsWith("/auth/signin");

  // Check if user is accessing protected /dashboard routes
  const isProtected = pathname.startsWith("/dashboard");

  // Get NextAuth token from request
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // User is already signed in → redirect from sign-in page to dashboard
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protect /dashboard routes
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/not-authenticated";
    return NextResponse.redirect(url);
  }

  // Authenticated or public route → allow
  return NextResponse.next();
}

// Configure matcher for middleware
export const config = {
  matcher: ["/auth/signin", "/dashboard/:path*"], // Apply to sign-in and dashboard
};