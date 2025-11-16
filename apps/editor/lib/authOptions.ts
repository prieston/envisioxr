import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,

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
        // Use token.id (database user ID) instead of token.sub (OAuth provider ID)
        session.user.id = (token.id as string) || (token.sub as string);
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
};
