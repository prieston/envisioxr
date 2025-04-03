/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;
    SHADOW_DATABASE_URL: string;

    // Environment
    NODE_ENV?: "development" | "production" | "test";
    ANALYZE?: string;

    // Website URLs
    NEXT_PUBLIC_WEBSITE_URL: string;
    NEXT_PUBLIC_APP_URL: string;

    // Authentication
    SECRET: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_COOKIE_DOMAIN: string;

    // Digital Ocean Spaces
    DO_SPACES_REGION: string;
    DO_SPACES_ENDPOINT: string;
    DO_SPACES_KEY: string;
    DO_SPACES_SECRET: string;
    DO_SPACES_BUCKET: string;
    NEXT_PUBLIC_DO_SPACES_FOLDER: string;
    NEXT_PUBLIC_DO_SPACES_ENDPOINT: string;
    NEXT_PUBLIC_DO_SPACES_BUCKET: string;

    // Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    NEXT_PUBLIC_CESIUM_ION_KEY: string;
  }
}
