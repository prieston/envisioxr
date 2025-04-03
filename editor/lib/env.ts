/**
 * Environment configuration with Zod validation
 * This file centralizes all environment variables and provides type safety
 */
import { z } from "zod";

// Define the environment schema with Zod
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SHADOW_DATABASE_URL: z.string().min(1, "SHADOW_DATABASE_URL is required"),

  // Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ANALYZE: z.string().optional(),

  // Website URLs
  NEXT_PUBLIC_WEBSITE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_WEBSITE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.string().min(1, "NEXT_PUBLIC_APP_URL is required"),

  // Authentication
  SECRET: z.string().min(1, "SECRET is required"),
  NEXTAUTH_URL: z.string().min(1, "NEXTAUTH_URL is required"),
  NEXTAUTH_COOKIE_DOMAIN: z
    .string()
    .min(1, "NEXTAUTH_COOKIE_DOMAIN is required"),

  // Digital Ocean Spaces
  DO_SPACES_REGION: z.string().min(1, "DO_SPACES_REGION is required"),
  DO_SPACES_ENDPOINT: z.string().min(1, "DO_SPACES_ENDPOINT is required"),
  DO_SPACES_KEY: z.string().min(1, "DO_SPACES_KEY is required"),
  DO_SPACES_SECRET: z.string().min(1, "DO_SPACES_SECRET is required"),
  DO_SPACES_BUCKET: z.string().min(1, "DO_SPACES_BUCKET is required"),
  NEXT_PUBLIC_DO_SPACES_FOLDER: z
    .string()
    .min(1, "NEXT_PUBLIC_DO_SPACES_FOLDER is required"),
  NEXT_PUBLIC_DO_SPACES_ENDPOINT: z
    .string()
    .min(1, "NEXT_PUBLIC_DO_SPACES_ENDPOINT is required"),
  NEXT_PUBLIC_DO_SPACES_BUCKET: z
    .string()
    .min(1, "NEXT_PUBLIC_DO_SPACES_BUCKET is required"),

  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required"),
  NEXT_PUBLIC_CESIUM_ION_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CESIUM_ION_KEY is required"),
});

// Function to initialize environment
function initializeEnv() {
  // Parse and validate environment variables
  const parsedEnv = envSchema.safeParse(process.env);

  // If validation fails, log the error but don't throw
  if (!parsedEnv.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsedEnv.error.format()
    );
    return null;
  }

  return parsedEnv.data;
}

// Initialize environment
const env = initializeEnv();

// Export typed environment variables
export const serverEnv = env;

// Export client-safe environment variables
export const clientEnv = env
  ? {
      NEXT_PUBLIC_WEBSITE_URL: env.NEXT_PUBLIC_WEBSITE_URL,
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_DO_SPACES_FOLDER: env.NEXT_PUBLIC_DO_SPACES_FOLDER,
      NEXT_PUBLIC_DO_SPACES_ENDPOINT: env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
      NEXT_PUBLIC_DO_SPACES_BUCKET: env.NEXT_PUBLIC_DO_SPACES_BUCKET,
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      NEXT_PUBLIC_CESIUM_ION_KEY: env.NEXT_PUBLIC_CESIUM_ION_KEY,
    }
  : null;
