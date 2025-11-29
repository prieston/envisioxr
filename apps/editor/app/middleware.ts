import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.SECRET });

  // Define protected routes
  const protectedRoutes = ["/", "/dashboard", "/editor", "/projects"];

  // Check if user is authenticated for protected routes
  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/projects/:path*"],
};
