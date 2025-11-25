import { z } from "zod";

// Server-side environment variables schema
const serverEnvSchema = z.object({
  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
  EMAIL_TO: z.string().email("EMAIL_TO must be a valid email address"),
});

// Parse and validate the environment variables
const parsedEnv = serverEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid server environment variables:",
    parsedEnv.error.format()
  );
  // In production, throw an error to indicate misconfiguration
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid server environment variables");
  }
}

export const serverEnv = parsedEnv.success ? parsedEnv.data : {
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "Klorad <no-reply@klorad.com>",
  EMAIL_TO: process.env.EMAIL_TO || "info@klorad.com",
};

// Email configuration
export const emailConfig = {
  apiKey: serverEnv.RESEND_API_KEY,
  from: serverEnv.EMAIL_FROM,
  to: serverEnv.EMAIL_TO,
};

