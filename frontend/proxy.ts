import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/auth/signin");

  const isDashboard =
    pathname.startsWith("/dashboard");

  const isAdmin =
    pathname.startsWith("/admin");

  const token = await getToken({

    req,
    secret: process.env.NEXTAUTH_SECRET,

  });

  /* Redirect logged-in users away from login */

  if (isAuthPage && token) {

    const url = req.nextUrl.clone();

    if (token.role === "ADMIN") {

      url.pathname = "/admin/dashboard";

    } else {

      url.pathname = "/dashboard";

    }

    return NextResponse.redirect(url);

  }

  /* Protect dashboard */

  if (isDashboard && !token) {

    const url = req.nextUrl.clone();
    url.pathname = "/auth/signin";

    return NextResponse.redirect(url);

  }

  /* Protect admin */

  if (isAdmin) {

    if (!token) {

      const url = req.nextUrl.clone();
      url.pathname = "/auth/signin";

      return NextResponse.redirect(url);

    }

    if (token.role !== "ADMIN") {

      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";

      return NextResponse.redirect(url);

    }

  }

  return NextResponse.next();

}

export const config = {

  matcher: [

    "/auth/signin",
    "/dashboard/:path*",
    "/admin/:path*"

  ],

};