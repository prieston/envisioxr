// clientEnv.ts – only public vars:
import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_WEBSITE_URL: z
    .string()
    .min(1, "NEXT_PUBLIC_WEBSITE_URL is required"),
  NEXT_PUBLIC_APP_URL: z.string().min(1, "NEXT_PUBLIC_APP_URL is required"),
  NEXT_PUBLIC_DO_SPACES_FOLDER: z
    .string()
    .min(1, "NEXT_PUBLIC_DO_SPACES_FOLDER is required"),
  NEXT_PUBLIC_DO_SPACES_ENDPOINT: z
    .string()
    .min(1, "NEXT_PUBLIC_DO_SPACES_ENDPOINT is required"),
  NEXT_PUBLIC_DO_SPACES_BUCKET: z
    .string()
    .min(1, "NEXT_PUBLIC_DO_SPACES_BUCKET is required"),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is required"),
  // Cesium Ion (support both naming conventions)
  NEXT_PUBLIC_CESIUM_ION_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CESIUM_ION_KEY is required"),
  NEXT_PUBLIC_CESIUM_TOKEN: z.string().optional(),
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DO_SPACES_FOLDER: process.env.NEXT_PUBLIC_DO_SPACES_FOLDER,
  NEXT_PUBLIC_DO_SPACES_ENDPOINT: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
  NEXT_PUBLIC_DO_SPACES_BUCKET: process.env.NEXT_PUBLIC_DO_SPACES_BUCKET,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_CESIUM_ION_KEY: process.env.NEXT_PUBLIC_CESIUM_ION_KEY,
  NEXT_PUBLIC_CESIUM_TOKEN: process.env.NEXT_PUBLIC_CESIUM_TOKEN,
});
