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
      if (opts.showGeometry === undefined) {
        target.showLateralSurfaces = true;
        target.showDomeSurfaces = true;
      }
      if (opts.showViewshed === undefined) {
        target.showViewshed = true;
      }
    } else {
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

  // Update radius with geometry rebuild nudge
  if (opts.radius != null) {
    handle.radius = Math.max(MIN_RADIUS, opts.radius);
    // Force geometry rebuild when radius changes without FOV change
    if (opts.fovDeg == null && handle.outerHalfAngle != null) {
      const currentAngle = handle.outerHalfAngle;
      handle.outerHalfAngle = currentAngle * 1.0001;
      handle.outerHalfAngle = currentAngle;
    }
  }

  // Update FOV
  if (opts.fovDeg != null) {
    const clamped = Math.min(MAX_CONE_FOV_DEG, Math.max(1, opts.fovDeg));
    handle.outerHalfAngle = Cesium.Math.toRadians(clamped / 2);
  }

  requestRender(opts.viewer);
  return handle;
}

/**
 * Update rectangular sensor FOV and radius
 */
export function updateRectangularFovRadius(
  handle: IonSensor | null | undefined,
  opts: {
    fovHdeg?: number;
    fovVdeg?: number;
    radius?: number;
    viewer: any;
  }
): IonSensor | null {
  if (!handle) return null;

  // Update radius with geometry rebuild nudge
  if (opts.radius != null) {
    handle.radius = Math.max(MIN_RADIUS, opts.radius);
    // Force geometry rebuild when radius changes without FOV change
    if (
      opts.fovHdeg == null &&
      opts.fovVdeg == null &&
      (handle as any).xHalfAngle != null
    ) {
      const currentAngle = (handle as any).xHalfAngle;
      (handle as any).xHalfAngle = currentAngle * 1.0001;
      (handle as any).xHalfAngle = currentAngle;
    }
  }

  // Update horizontal FOV
  if (opts.fovHdeg != null) {
    const clampedH = Math.min(MAX_CONE_FOV_DEG, Math.max(1, opts.fovHdeg));
    (handle as any).xHalfAngle = Cesium.Math.toRadians(clampedH / 2);
  }

  // Update vertical FOV
  if (opts.fovVdeg != null) {
    const clampedV = Math.min(MAX_CONE_FOV_DEG, Math.max(1, opts.fovVdeg));
    (handle as any).yHalfAngle = Cesium.Math.toRadians(clampedV / 2);
  }

  requestRender(opts.viewer);
  return handle;
}
