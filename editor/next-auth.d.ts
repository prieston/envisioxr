/// <reference types="next" />
/// <reference types="next/image-types/global" />

import "next-auth";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  // 👇 This solves the "NextAuthOptions not exported" issue
  type NextAuthOptions = Parameters<typeof NextAuth>[0];
}
