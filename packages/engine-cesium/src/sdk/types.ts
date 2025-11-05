import * as Cesium from "cesium";

export type SensorType = "cone" | "rectangle" | "dome" | "custom";

export interface SensorBase {
  id?: string;
  position: Cesium.Cartesian3; // apex / origin in ECEF
  heading: number; // rad
  pitch: number; // rad
  roll: number; // rad
  range: number; // meters
  color?: Cesium.Color;
  collection?: Cesium.EntityCollection;
}

export interface ConeSensor extends SensorBase {
  fov: number; // full aperture in radians (e.g., 50° -> 0.87266)
}

export interface RectSensor extends SensorBase {
  fovH: number; // horizontal full aperture in radians
  fovV: number; // vertical full aperture in radians
}

export interface DomeSensor extends SensorBase {
  maxPolar: number; // polar angle from forward (0..pi), e.g., 120° dome
}

export type CustomDirectionFilter = (dirLocal: Cesium.Cartesian3) => boolean; // local +X forward

export interface CustomSensor extends SensorBase {
  directionFilter: CustomDirectionFilter; // returns true if ray is inside sensor geometry
}

export type AnySensor =
  | ({ type: "cone" } & ConeSensor)
  | ({ type: "rectangle" } & RectSensor)
  | ({ type: "dome" } & DomeSensor)
  | ({ type: "custom" } & CustomSensor);

export interface ViewshedOptions {
  raysAzimuth?: number; // number of azimuth samples (around forward axis); default 120
  raysElevation?: number; // elevation slices within aperture; default 4
  clearance?: number; // meters above terrain to consider clear; default 1.5
  stepCount?: number; // samples per ray; default 64
  material?: Cesium.Color | Cesium.MaterialProperty; // polygon fill material
  outline?: boolean; // draw outline; default true
  outlineColor?: Cesium.Color; // default Color.YELLOW
  clampToGround?: boolean; // default true
  collection?: Cesium.EntityCollection;
}

export type GizmoMode = "translate" | "rotate" | "scale";

export interface TransformEditorOptions {
  axisLength?: number; // meters, visual size
  gizmoPosition?: "center" | "top"; // where to position the gizmo relative to the entity
  onChange?: (trs: {
    position: Cesium.Cartesian3;
    rotation: Cesium.Quaternion;
    scale: number;
    modelMatrix: Cesium.Matrix4;
  }) => void;
  collection?: Cesium.EntityCollection;
}

