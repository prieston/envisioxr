import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

interface UserSession {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export const authOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        domain:
          process.env.NODE_ENV === "production"
            ? ".envisioxr.com" // ✅ Works for `envisioxr.com`, `www.envisioxr.com`, and `app.envisioxr.com`
            : "localhost", // ✅ Works for `localhost:3000` and `localhost:3001`
        path: "/",
        secure: process.env.NODE_ENV === "production", // ✅ Secure in production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ "none" for cross-domain, "lax" for localhost
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as UserSession).id = token.sub as string;
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
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
