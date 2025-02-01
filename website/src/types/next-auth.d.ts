import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// ✅ Extend `User` type to include `id`
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Add the `id` field
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}
