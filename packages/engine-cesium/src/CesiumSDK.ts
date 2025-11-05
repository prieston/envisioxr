/*
  Cesium Mini Visibility SDK (TypeScript)
  --------------------------------------
  Drop-in utilities for Next.js + CesiumJS to cover:
   - Transform editor (translate, rotate-yaw, uniform scale) with a 3‑axis gizmo
   - Sensor geometries (cone, rectangle, dome, custom) + visualization
   - CPU-accelerated (batched) line-of-sight + viewshed polygon over terrain

  Notes
  - This is NOT the Cesium ion SDK. It's open code you can paste into your app.
  - GPU viewshed via post-process depth is not exposed as a stable public API in CesiumJS;
    this module focuses on fast CPU ray-batching with terrain sampling.
  - All math is done in an East‑North‑Up (ENU) local frame. Forward is +X in local sensor space.
  - Requires CesiumJS >= 1.105 (adjust types if you're on an older version).

  Usage (sketch)
  --------------
  import {TransformEditor, Sensors, VisibilityEngine} from "./mini-visibility-sdk";

  // In a client-only component after you create a Viewer
  const gizmo = new TransformEditor(viewer, {
    onChange: (trs) => {
      // update an entity/model with trs.modelMatrix
    }
  });
  gizmo.attachToEntity(entity);

  // Create a cone sensor
  const cone = Sensors.createCone(viewer, {
    id: "sensor-1",
    position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    heading: 0, pitch: 0, roll: 0,
    fov: Cesium.Math.toRadians(50), // full aperture
    range: 2500,
    color: Cesium.Color.LIME.withAlpha(0.25)
  });

  // Compute viewshed (returns a clamped-to-ground polygon entity)
  const engine = new VisibilityEngine(viewer);
  const result = await engine.computeViewshed({
    type: "cone",
    position: cone.position,
    hpr: new Cesium.HeadingPitchRoll(cone.heading, cone.pitch, cone.roll),
    range: 2500,
    fovH: Cesium.Math.toRadians(50),
    fovV: Cesium.Math.toRadians(50),
  }, { raysAzimuth: 180, raysElevation: 5, clearance: 2.0, material: Cesium.Color.DODGERBLUE.withAlpha(0.2) });

*/

// Re-export all types
export type {
  SensorType,
  SensorBase,
  ConeSensor,
  RectSensor,
  DomeSensor,
  CustomDirectionFilter,
  CustomSensor,
  AnySensor,
  ViewshedOptions,
  GizmoMode,
  TransformEditorOptions,
} from "./sdk/types";

// Re-export helpers
export { hprRotation, enuFrame, worldFromLocal, unitFromAzEl } from "./sdk/helpers";

// Re-export Sensors
export { Sensors } from "./sdk/sensors";

// Re-export classes
export { VisibilityEngine } from "./sdk/VisibilityEngine";
export { TransformEditor } from "./sdk/TransformEditor";

// Default export for backward compatibility
import { Sensors } from "./sdk/sensors";
import { VisibilityEngine } from "./sdk/VisibilityEngine";
import { TransformEditor } from "./sdk/TransformEditor";

export default { Sensors, VisibilityEngine, TransformEditor };
