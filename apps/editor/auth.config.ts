import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: req }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/editor", "/projects"];
      const isProtected = protectedPaths.some((path) =>
        req.nextUrl.pathname.startsWith(path)
      );

      if (isProtected) {
        return isLoggedIn;
      }
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

