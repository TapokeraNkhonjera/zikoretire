import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/auth/signin");
  const isProtected = pathname.startsWith("/dashboard");

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  /* ---------------- Redirect signed-in users away from login ---------------- */
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  /* ---------------- Protect dashboard ---------------- */
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/signin", "/dashboard/:path*"],
};