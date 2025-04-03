/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// See https://nextjs.org/docs/basic-features/typescript for more information.

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
