export * from "./utils/sensors";
export { default as ViewshedAnalysis } from "./views/ViewshedAnalysis";
export * from "./lib/init";
export { ensureIonSDKLoaded } from "./loader";

/**
 * Get Ion SDK modules (client-only, requires ensureIonSDKLoaded() to be called first).
 * These are type-safe wrappers that return the loaded modules.
 */
export async function getIonSDKModules() {
  // Ensure SDK is loaded before accessing modules
  const { ensureIonSDKLoaded } = await import("./loader");
  await ensureIonSDKLoaded();

  // Vendor JS files are not type-checked, only loaded at runtime
  // Using dynamic imports with type assertions to bypass TypeScript checking
  const TransformEditorModule = (await import(
    // @ts-ignore - Vendor JS file
    "./vendor/cesium-ion-sdk/ion-sdk-measurements/Source/TransformEditor/TransformEditor.js"
  )) as any;
  const IonGeometryModule = (await import(
    // @ts-ignore - Vendor JS file
    "./vendor/cesium-ion-sdk/ion-sdk-geometry/index.js"
  )) as any;
  const IonSensorsModule = (await import(
    // @ts-ignore - Vendor JS file
    "./vendor/cesium-ion-sdk/ion-sdk-sensors/index.js"
  )) as any;
  const IonMeasurementsModule = (await import(
    // @ts-ignore - Vendor JS file
    "./vendor/cesium-ion-sdk/ion-sdk-measurements/index.js"
  )) as any;

  return {
    TransformEditor: TransformEditorModule.default,
    IonGeometry: IonGeometryModule,
    IonSensors: IonSensorsModule,
    IonMeasurements: IonMeasurementsModule,
  };
}
