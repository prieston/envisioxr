/**
 * Ion SDK Loader
 *
 * Centralized loader for vendor Ion SDK modules.
 * These modules modify global objects and must only load on the client, never during SSR.
 *
 * This loader ensures vendor modules load exactly once when the Cesium viewer initializes.
 */

let loaded = false;
let pending: Promise<void> | null = null;

/**
 * Ensure Ion SDK vendor modules are loaded (client-only).
 * Safe to call multiple times - will only load once.
 * Returns immediately if already loaded or currently loading.
 *
 * @returns Promise that resolves when modules are loaded (or resolves immediately if already loaded)
 */
export async function ensureIonSDKLoaded(): Promise<void> {
  // SSR guard - never load vendor code during server-side rendering
  if (typeof window === "undefined") {
    return;
  }

  // If already loaded, return immediately
  if (loaded) {
    return;
  }

  // If currently loading, return the existing promise
  if (pending) {
    return pending;
  }

  // Start loading vendor modules
  pending = (async () => {
    try {
      // Dynamically import vendor modules (only on client)
      await import("./vendor/cesium-ion-sdk/ion-sdk-sensors/index.js");
      await import("./vendor/cesium-ion-sdk/ion-sdk-geometry/index.js");
      await import("./vendor/cesium-ion-sdk/ion-sdk-measurements/index.js");
      loaded = true;
    } catch (error) {
      console.error("[IonSDK] Failed to load vendor modules:", error);
      pending = null; // Reset on error so it can be retried
      throw error;
    }
  })();

  return pending;
}
