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
      // Only restore geometry if caller didn't specify showGeometry
      if (opts.showGeometry === undefined) {
        target.showLateralSurfaces = true;
        target.showDomeSurfaces = true;
      }
      // Only restore viewshed if caller didn't specify showViewshed
      if (opts.showViewshed === undefined) {
        target.showViewshed = true;
      }
    } else {
      // Only hide everything if show=false and no specific overrides
      if (opts.showViewshed === undefined) {
        target.showViewshed = false;
      }
      if (opts.showGeometry === undefined) {
        target.showLateralSurfaces = false;
        target.showDomeSurfaces = false;
      }
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
    const oldRadius = handle.radius;
    handle.radius = Math.max(MIN_RADIUS, opts.radius);
    // Force geometry rebuild by briefly changing outerHalfAngle if FOV isn't being updated
    // This ensures radius changes are visible immediately
    if (opts.fovDeg == null && handle.outerHalfAngle != null) {
      const currentAngle = handle.outerHalfAngle;
      // Make a noticeable change and restore to force Cesium to update
      handle.outerHalfAngle = currentAngle * 1.0001;
      handle.outerHalfAngle = currentAngle;
      console.log(
        `[updateFovRadius] Changed radius from ${oldRadius} to ${handle.radius}, nudged angle to ${currentAngle}`
      );
    } else {
      console.log(
        `[updateFovRadius] Changed radius from ${oldRadius} to ${handle.radius}`
      );
    }
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
    const oldRadius = handle.radius;
    handle.radius = Math.max(MIN_RADIUS, opts.radius);
    // Force geometry rebuild by briefly changing xHalfAngle if FOV isn't being updated
    // This ensures radius changes are visible immediately
    if (
      opts.fovHdeg == null &&
      opts.fovVdeg == null &&
      (handle as any).xHalfAngle != null
    ) {
      const currentAngle = (handle as any).xHalfAngle;
      (handle as any).xHalfAngle = currentAngle * 1.0001;
      (handle as any).xHalfAngle = currentAngle;
      console.log(
        `[updateRectangularFovRadius] Changed radius from ${oldRadius} to ${handle.radius}, nudged angle to ${currentAngle}`
      );
    } else {
      console.log(
        `[updateRectangularFovRadius] Changed radius from ${oldRadius} to ${handle.radius}`
      );
    }
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
