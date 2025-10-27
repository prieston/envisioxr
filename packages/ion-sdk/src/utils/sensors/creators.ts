/**
 * Factory functions for creating sensors
 */

import * as Cesium from "cesium";
import * as IonSensors from "../../vendor/cesium-ion-sdk/ion-sdk-sensors";
import { IonSensor, SensorComposite } from "./types";
import { buildCompositeConicSensor } from "./composite";
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
  fovDeg: number; // 0..360 full
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
 * Create a conic sensor or composite (multi-cone) sensor
 * based on the FOV angle
 */
export function createConicSensorOrComposite(opts: ConicSensorOptions): {
  sensor?: IonSensor;
  composite?: SensorComposite;
} {
  const desiredFullFovDeg = Math.max(0, Math.min(360, opts.fovDeg));
  const volume = opts.sensorColor.withAlpha(DEFAULT_VOLUME_ALPHA);
  const visible = opts.sensorColor.withAlpha(DEFAULT_VISIBLE_ALPHA);
  const occluded = Cesium.Color.fromBytes(
    DEFAULT_OCCLUDED_COLOR_BYTES.r,
    DEFAULT_OCCLUDED_COLOR_BYTES.g,
    DEFAULT_OCCLUDED_COLOR_BYTES.b,
    DEFAULT_OCCLUDED_COLOR_BYTES.a
  );

  DEBUG &&
    console.log(`[createConicSensorOrComposite] FOV: ${desiredFullFovDeg}°`);

  // If FOV > 180°, use composite (multiple cones)
  if (desiredFullFovDeg > 180) {
    DEBUG && console.log(`[createConicSensorOrComposite] Creating COMPOSITE`);
    const composite = buildCompositeConicSensor({
      viewer: opts.viewer,
      poseMatrix: opts.modelMatrix,
      fullDeg: desiredFullFovDeg,
      radius: Math.max(MIN_RADIUS, opts.radius),
      volumeColor: volume,
      visibleColor: visible,
      occludedColor: occluded,
      show: true,
      showViewshed: true,
      showGeometry: false,
    });
    (composite as any).__mode = "composite"; // Mark mode at creation
    requestRender(opts.viewer);
    return { composite };
  }

  DEBUG && console.log(`[createConicSensorOrComposite] Creating SINGLE cone`);

  // Single cone for FOV <= 180°; clamp to 179.9°
  const clampedFull = Math.max(
    1,
    Math.min(MAX_CONE_FOV_DEG, desiredFullFovDeg)
  );
  const halfRad = Cesium.Math.toRadians(clampedFull / 2);
  const mat = Cesium.Material.fromType("Color", { color: volume });
  const sensor = new (IonSensors as any).ConicSensor({
    modelMatrix: opts.modelMatrix,
    radius: Math.max(MIN_RADIUS, opts.radius),
    outerHalfAngle: halfRad,
    lateralSurfaceMaterial: mat,
    domeSurfaceMaterial: mat,
    showLateralSurfaces: false, // Aligned with initial flags
    showDomeSurfaces: false,
    showViewshed: true,
    showEllipsoidSurfaces: false,
    showEllipsoidHorizonSurfaces: false,
    showThroughEllipsoid: false,
    environmentConstraint: true,
    include3DModels: opts.include3DModels !== false,
  } as any);
  sensor.viewshedVisibleColor = visible;
  sensor.viewshedOccludedColor = occluded;
  (sensor as any).__mode = "single"; // Mark mode at creation
  opts.viewer.scene.primitives.add(sensor);
  requestRender(opts.viewer);
  return { sensor };
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
    showLateralSurfaces: false, // Aligned with initial flags
    showDomeSurfaces: false,
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
