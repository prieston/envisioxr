import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: req }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth = req.nextUrl.pathname.startsWith("/auth");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnAuth) {
        if (isLoggedIn) {
            // Optional: Redirect to dashboard if already logged in?
            // The original middleware didn't explicitly do this in 'authorized',
            // but NextAuth usually handles it.
            // Original middleware logic:
            /*
            if (req.nextUrl.pathname.startsWith("/auth")) {
              return true;
            }
            */
           return true;
        }
        return true;
      }

      // Allow access to root page
      if (req.nextUrl.pathname === "/") {
        return true;
      }

      // Allow all other routes
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;

