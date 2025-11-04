export * from "./utils/sensors";
export { default as ViewshedAnalysis } from "./views/ViewshedAnalysis";
export * from "./lib/init";

// Client-only dynamic loader for vendor Ion SDK modules
// These modules modify global objects and must only load on the client, never during SSR
let ionSDKLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load Ion SDK vendor modules (client-only).
 * This function must be called from client components (inside useEffect).
 * It safely guards against SSR execution and ensures modules only load once.
 */
export async function loadIonSDK(): Promise<void> {
  // SSR guard - never load vendor code during server-side rendering
  if (typeof window === "undefined") {
    return;
  }

  // If already loaded, return immediately
  if (ionSDKLoaded) {
    return;
  }

  // If currently loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }

  // Start loading vendor modules
  loadingPromise = (async () => {
    try {
      // Dynamically import vendor modules (only on client)
      await import("./vendor/cesium-ion-sdk/ion-sdk-sensors/index.js");
      await import("./vendor/cesium-ion-sdk/ion-sdk-geometry/index.js");
      await import("./vendor/cesium-ion-sdk/ion-sdk-measurements/index.js");
      ionSDKLoaded = true;
    } catch (error) {
      console.error("[IonSDK] Failed to load vendor modules:", error);
      loadingPromise = null; // Reset on error so it can be retried
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Get Ion SDK modules (client-only, requires loadIonSDK() to be called first).
 * These are type-safe wrappers that return the loaded modules.
 */
export async function getIonSDKModules() {
  await loadIonSDK();

  // @ts-ignore - Vendor JS files are not type-checked, only loaded at runtime
  const TransformEditorModule = await import(
    "./vendor/cesium-ion-sdk/ion-sdk-measurements/Source/TransformEditor/TransformEditor.js"
  );
  // @ts-ignore
  const IonGeometryModule = await import(
    "./vendor/cesium-ion-sdk/ion-sdk-geometry/index.js"
  );
  // @ts-ignore
  const IonSensorsModule = await import(
    "./vendor/cesium-ion-sdk/ion-sdk-sensors/index.js"
  );
  // @ts-ignore
  const IonMeasurementsModule = await import(
    "./vendor/cesium-ion-sdk/ion-sdk-measurements/index.js"
  );

  return {
    TransformEditor: TransformEditorModule.default,
    IonGeometry: IonGeometryModule,
    IonSensors: IonSensorsModule,
    IonMeasurements: IonMeasurementsModule,
  };
}
