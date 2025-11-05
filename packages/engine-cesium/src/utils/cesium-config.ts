/**
 * Cesium configuration utilities
 */

// Set Cesium base URL immediately when module loads
if (typeof window !== "undefined") {
  window.CESIUM_BASE_URL = "/cesium/";
}

// Extend Window interface for Cesium
declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
    Cesium?: any;
    cesiumViewer?: any;
  }
}

/**
 * Ensures CESIUM_BASE_URL is set
 */
export function ensureCesiumBaseUrl(): void {
  if (!window.CESIUM_BASE_URL) {
    window.CESIUM_BASE_URL = "/cesium/";
    // Log warning in development if misconfigured (uses compile-time flag)
    // @ts-expect-error - __DEV__ is defined at compile time via webpack DefinePlugin
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        "[CesiumViewer] CESIUM_BASE_URL not set via env, using default '/cesium/'. " +
          "Set NEXT_PUBLIC_CESIUM_BASE_URL or ensure env.CESIUM_BASE_URL is configured."
      );
    }
  }
}

/**
 * Gets Cesium Ion access token
 */
export function getCesiumIonToken(): string {
  return (
    process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
    process.env.NEXT_PUBLIC_CESIUM_TOKEN ||
    ""
  );
}

/**
 * Sets up Cesium Ion access token
 */
export function setupCesiumIonToken(Cesium: any): void {
  const ionToken = getCesiumIonToken();
  if (!ionToken) {
    // No Cesium Ion token provided. Set NEXT_PUBLIC_CESIUM_ION_KEY or NEXT_PUBLIC_CESIUM_TOKEN
  }
  Cesium.Ion.defaultAccessToken = ionToken;
}

