import { prisma } from "@/app/libs/prismaDB";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user?.password) {
          throw new Error("No user found");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),

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
        session.user.id = token.sub;
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
