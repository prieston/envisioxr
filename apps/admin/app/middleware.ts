import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard");

    // If accessing admin routes, check if user is a god user
    if (isAdminRoute) {
      const { isGodUser } = await import("@/lib/config/godusers");
      if (!token?.email || !isGodUser(token.email)) {
        // Add error message to prevent redirect loop
        const signInUrl = new URL("/auth/signin", req.url);
        signInUrl.searchParams.set("error", "access_denied");
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/auth")) {
          return true;
        }
        // Allow access to root page (will redirect server-side)
        if (req.nextUrl.pathname === "/") {
          return true;
        }
        // Require token for dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token;
        }
        // Allow all other routes (API routes handle their own auth)
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};

