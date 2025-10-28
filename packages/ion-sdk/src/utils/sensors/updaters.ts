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
  if (opts.show !== undefined) {
    target.show = opts.show;
    if (opts.show === true) {
      // restore geometry if caller didn't specify showGeometry
      if (opts.showGeometry === undefined) {
        target.showLateralSurfaces = true;
        target.showDomeSurfaces = true;
      }
      if (opts.showViewshed === undefined) {
        target.showViewshed = true;
      }
    } else {
      target.showLateralSurfaces = false;
      target.showDomeSurfaces = false;
      target.showViewshed = false;
    }
  }
  if (opts.showViewshed !== undefined) target.showViewshed = opts.showViewshed;
  if (opts.showGeometry !== undefined) {
    target.showLateralSurfaces = opts.showGeometry;
    target.showDomeSurfaces = opts.showGeometry;
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
    // some Ion SDK builds actually read these color props at render time:
    (target as any).lateralSurfaceColor = colors.volume;
    (target as any).domeSurfaceColor = colors.volume;
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

/**
 * Update rectangular sensor angles (xHalfAngle/yHalfAngle) and radius
 */
export function updateRectangularFovRadius(
  handle: IonSensor | null | undefined,
  opts: {
    fovHdeg?: number; // full horizontal degrees (0..360 folded)
    fovVdeg?: number; // full vertical degrees (0..180)
    radius?: number;
    viewer: any;
  }
): IonSensor | null {
  if (!handle) return null;

  if (opts.radius != null) {
    handle.radius = Math.max(MIN_RADIUS, opts.radius);
  }

  if (opts.fovHdeg != null) {
    const clampedH = Math.min(MAX_CONE_FOV_DEG, Math.max(1, opts.fovHdeg));
    const xHalf = Cesium.Math.toRadians(clampedH / 2);
    // RectangularSensor uses xHalfAngle
    (handle as any).xHalfAngle = xHalf;
  }

  if (opts.fovVdeg != null) {
    const clampedV = Math.min(MAX_CONE_FOV_DEG, Math.max(1, opts.fovVdeg));
    const yHalf = Cesium.Math.toRadians(clampedV / 2);
    // RectangularSensor uses yHalfAngle
    (handle as any).yHalfAngle = yHalf;
  }

  requestRender(opts.viewer);
  return handle;
}
