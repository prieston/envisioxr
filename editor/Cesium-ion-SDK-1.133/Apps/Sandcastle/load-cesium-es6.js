// This file loads the unbuilt ES6 version of Cesium
// into the global scope during local development
window.CESIUM_BASE_URL = "../../../cesium/Build/CesiumUnminified/";
import * as Cesium from "../../cesium/Build/CesiumUnminified/index.js";
window.Cesium = Cesium;
import * as IonSdkMeasurements from "../../packages/ion-sdk-measurements/Build/IonSdkMeasurementsUnminified/index.js";
window.IonSdkMeasurements = IonSdkMeasurements;
import * as IonSdkSensors from "../../packages/ion-sdk-sensors/Build/IonSdkSensorsUnminified/index.js";
window.IonSdkSensors = IonSdkSensors;
import * as IonSdkGeometry from "../../packages/ion-sdk-geometry/Build/IonSdkGeometryUnminified/index.js";
window.IonSdkGeometry = IonSdkGeometry;

// Since ES6 modules have no guaranteed load order,
// only call startup if it's already defined but hasn't been called yet
// Also avoid calling startup on dojo-based examples which behave differently
if (
  !window.dojoConfig &&
  !window.startupCalled &&
  typeof window.startup === "function"
) {
  window.startup(Cesium).catch((error) => {
    console.error(error);
  });
  Sandcastle.finishedLoading();
}
