import { clientEnv } from "@/lib/env";

if (!clientEnv) {
  throw new Error(
    "Environment variables not properly initialized. Please check your .env file."
  );
}

export const env = clientEnv;
