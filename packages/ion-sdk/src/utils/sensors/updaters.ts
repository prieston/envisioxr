/**
 * Functions for updating existing sensors
 */

import * as Cesium from "cesium";
import { IonSensor } from "./types";
import { requestRender } from "./helpers";
import { MAX_CONE_FOV_DEG, MIN_RADIUS } from "./constants";

/**
 * Update the pose (position/rotation) of a sensor
 */
export function updatePose(
  target: IonSensor,
  modelMatrix: Cesium.Matrix4,
  viewer?: any
): void {
  target.modelMatrix = modelMatrix;
  requestRender(viewer);
}

/**
 * Update visibility flags
 */
export function updateFlags(
  target: IonSensor,
  opts: {
    show?: boolean;
    showViewshed?: boolean;
    showGeometry?: boolean;
  },
  viewer?: any
): void {
  if (opts.show !== undefined) target.show = opts.show;
  if (opts.showViewshed !== undefined) target.showViewshed = opts.showViewshed;
  if (opts.showGeometry !== undefined) {
    target.showLateralSurfaces = opts.showGeometry;
    target.showDomeSurfaces = opts.showGeometry;
  }
  // If show is false, hide the sensor entirely
  if (opts.show === false) {
    target.showLateralSurfaces = false;
    target.showDomeSurfaces = false;
    target.showViewshed = false;
  }
  requestRender(viewer);
}

/**
 * Update sensor colors
 */
export function updateColors(
  target: IonSensor,
  colors: {
    volume?: Cesium.Color;
    visible?: Cesium.Color;
    occluded?: Cesium.Color;
  },
  viewer?: any
): void {
  if (colors.volume) {
    const mat = Cesium.Material.fromType("Color", { color: colors.volume });
    target.lateralSurfaceMaterial = mat;
    target.domeSurfaceMaterial = mat;
  }
  if (colors.visible) target.viewshedVisibleColor = colors.visible;
  if (colors.occluded) target.viewshedOccludedColor = colors.occluded;
  requestRender(viewer);
}

/**
 * Update FOV and radius for a conic sensor (up to 180°)
 */
export function updateFovRadius(
  handle: IonSensor | null | undefined,
  opts: {
    fovDeg?: number;
    radius?: number;
    viewer: any;
  }
): IonSensor | null {
  if (!handle) return null;

  // Update radius
  if (opts.radius != null) {
    handle.radius = Math.max(MIN_RADIUS, opts.radius);
  }

  // Update FOV (clamp to 179.9° max)
  if (opts.fovDeg != null) {
    const clamped = Math.min(MAX_CONE_FOV_DEG, Math.max(1, opts.fovDeg));
    handle.outerHalfAngle = Cesium.Math.toRadians(clamped / 2);
  }

  requestRender(opts.viewer);
  return handle;
}
