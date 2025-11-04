export * from "./utils/sensors";
export { default as ViewshedAnalysis } from "./views/ViewshedAnalysis";
export * from "./lib/init";

// Vendor modules are loaded lazily to prevent SSR errors
// The vendor JS files execute code that redefines properties on prototypes
// This causes "Cannot redefine property" errors during SSR
// Components importing these should be marked with "use client"

// Stub exports for SSR - will be replaced at runtime on client
export const TransformEditor = undefined as any;
export const IonGeometry = {} as any;
export const IonSensors = {} as any;
export const IonMeasurements = {} as any;

// Lazy load vendor modules only on client side
if (typeof window !== "undefined") {
  // Use dynamic import to load vendor modules only when needed
  // This prevents the vendor code from executing during SSR
  Promise.all([
    import("./vendor/cesium-ion-sdk/ion-sdk-measurements/Source/TransformEditor/TransformEditor.js").catch(() => null),
    import("./vendor/cesium-ion-sdk/ion-sdk-geometry/index.js").catch(() => null),
    import("./vendor/cesium-ion-sdk/ion-sdk-sensors/index.js").catch(() => null),
    import("./vendor/cesium-ion-sdk/ion-sdk-measurements/index.js").catch(() => null),
  ]).then(([TransformEditorModule, IonGeometryModule, IonSensorsModule, IonMeasurementsModule]) => {
    if (TransformEditorModule) {
      Object.assign(TransformEditor, TransformEditorModule.default || TransformEditorModule);
    }
    if (IonGeometryModule) {
      Object.assign(IonGeometry, IonGeometryModule);
    }
    if (IonSensorsModule) {
      Object.assign(IonSensors, IonSensorsModule);
    }
    if (IonMeasurementsModule) {
      Object.assign(IonMeasurements, IonMeasurementsModule);
    }
  }).catch(() => {
    // Silently fail if vendor modules can't be loaded
  });
}
