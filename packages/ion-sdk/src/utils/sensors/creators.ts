/**
 * Factory functions for creating sensors
 */

import * as Cesium from "cesium";
import * as IonSensors from "../../vendor/cesium-ion-sdk/ion-sdk-sensors";
import { IonSensor } from "./types";
import { requestRender, sanitizeFov } from "./helpers";
import {
  DEBUG,
  MIN_RADIUS,
  MAX_CONE_FOV_DEG,
  DEFAULT_VOLUME_ALPHA,
  DEFAULT_VISIBLE_ALPHA,
  DEFAULT_OCCLUDED_COLOR_BYTES,
} from "./constants";

export interface ConicSensorOptions {
  viewer: any;
  modelMatrix: Cesium.Matrix4;
  fovDeg: number; // 0..180 full
  radius: number;
  sensorColor: Cesium.Color;
  include3DModels?: boolean;
}

export interface RectangularSensorOptions {
  viewer: any;
  modelMatrix: Cesium.Matrix4;
  fovHdeg: number; // full horizontal deg
  fovVdeg: number; // full vertical deg
  radius: number;
  sensorColor: Cesium.Color;
  include3DModels?: boolean;
}

/**
 * Create a conic sensor (single cone up to 180°)
 */
export function createConicSensor(opts: ConicSensorOptions): IonSensor {
  const volume = opts.sensorColor.withAlpha(DEFAULT_VOLUME_ALPHA);
  const visible = opts.sensorColor.withAlpha(DEFAULT_VISIBLE_ALPHA);
  const occluded = Cesium.Color.fromBytes(
    DEFAULT_OCCLUDED_COLOR_BYTES.r,
    DEFAULT_OCCLUDED_COLOR_BYTES.g,
    DEFAULT_OCCLUDED_COLOR_BYTES.b,
    DEFAULT_OCCLUDED_COLOR_BYTES.a
  );

  DEBUG && console.log(`[createConicSensor] FOV: ${opts.fovDeg}°`);
  DEBUG &&
    console.log(`[createConicSensor] sensorColor:`, opts.sensorColor.toBytes());
  DEBUG &&
    console.log(`[createConicSensor] volume alpha:`, DEFAULT_VOLUME_ALPHA);
  DEBUG && console.log(`[createConicSensor] volume color:`, volume.toBytes());

  // Clamp to 179.9° max
  const clampedFull = Math.max(1, Math.min(MAX_CONE_FOV_DEG, opts.fovDeg));
  const halfRad = Cesium.Math.toRadians(clampedFull / 2);
  const mat = Cesium.Material.fromType("Color", { color: volume });
  const sensor = new (IonSensors as any).ConicSensor({
    modelMatrix: opts.modelMatrix,
    radius: Math.max(MIN_RADIUS, opts.radius),
    outerHalfAngle: Cesium.Math.toRadians(Math.min(179.9, Math.max(1, opts.fovDeg)) / 2),
    // materials
    lateralSurfaceMaterial: mat,
    domeSurfaceMaterial: mat,
    // draw flags
    showLateralSurfaces: true,
    showDomeSurfaces: true,
    showViewshed: true,
    showEllipsoidSurfaces: false,
    showEllipsoidHorizonSurfaces: false,
    showThroughEllipsoid: false,
    environmentConstraint: true,
    include3DModels: opts.include3DModels !== false,
  } as any);

  // some Ion SDK builds actually read these color props at render time:
  (sensor as any).lateralSurfaceColor = volume;
  (sensor as any).domeSurfaceColor = volume;

  // set viewshed colors AFTER construction
  (sensor as any).viewshedVisibleColor = visible;
  (sensor as any).viewshedOccludedColor = occluded;

  opts.viewer.scene.primitives.add(sensor);
  requestRender(opts.viewer);
  return sensor;
}

/**
 * Create a rectangular sensor
 */
export function createRectangularSensor(
  opts: RectangularSensorOptions
): IonSensor {
  const xHalf = Cesium.Math.toRadians(sanitizeFov(opts.fovHdeg) / 2);
  const yHalf = Cesium.Math.toRadians(sanitizeFov(opts.fovVdeg) / 2);
  const mat = Cesium.Material.fromType("Color", {
    color: opts.sensorColor.withAlpha(DEFAULT_VOLUME_ALPHA),
  });
  const sensor = new (IonSensors as any).RectangularSensor({
    modelMatrix: opts.modelMatrix,
    radius: Math.max(MIN_RADIUS, opts.radius),
    xHalfAngle: xHalf,
    yHalfAngle: yHalf,
    lateralSurfaceMaterial: mat,
    domeSurfaceMaterial: mat,
    showLateralSurfaces: true,
    showDomeSurfaces: true,
    showViewshed: true,
    showEllipsoidSurfaces: false,
    showEllipsoidHorizonSurfaces: false,
    showThroughEllipsoid: false,
    environmentConstraint: true,
    include3DModels: opts.include3DModels !== false,
  } as any);
  sensor.viewshedVisibleColor = opts.sensorColor.withAlpha(
    DEFAULT_VISIBLE_ALPHA
  );
  sensor.viewshedOccludedColor = Cesium.Color.fromBytes(
    DEFAULT_OCCLUDED_COLOR_BYTES.r,
    DEFAULT_OCCLUDED_COLOR_BYTES.g,
    DEFAULT_OCCLUDED_COLOR_BYTES.b,
    DEFAULT_OCCLUDED_COLOR_BYTES.a
  );
  opts.viewer.scene.primitives.add(sensor);
  requestRender(opts.viewer);
  return sensor;
}
