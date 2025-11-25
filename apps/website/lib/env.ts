import { z } from "zod";

// Server-side environment variables schema
const serverEnvSchema = z.object({
  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required").optional(),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required").optional(),
  EMAIL_TO: z.string().email("EMAIL_TO must be a valid email address").optional(),
});

// Parse and validate the environment variables
const parsedEnv = serverEnvSchema.safeParse(process.env);

// Use defaults if validation fails or values are missing
export const serverEnv = parsedEnv.success ? {
  RESEND_API_KEY: parsedEnv.data.RESEND_API_KEY || "",
  EMAIL_FROM: parsedEnv.data.EMAIL_FROM || "Klorad <no-reply@klorad.com>",
  EMAIL_TO: parsedEnv.data.EMAIL_TO || "info@klorad.com",
} : {
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "Klorad <no-reply@klorad.com>",
  EMAIL_TO: process.env.EMAIL_TO || "info@klorad.com",
};

// Only throw error in production if critical variables are missing
if (process.env.NODE_ENV === "production" && !serverEnv.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is required in production");
}

// Email configuration
export const emailConfig = {
  apiKey: serverEnv.RESEND_API_KEY,
  from: serverEnv.EMAIL_FROM,
  to: serverEnv.EMAIL_TO,
};

