/**
 * Helper utilities for sensor operations
 */

import * as Cesium from "cesium";
import { MAX_CONE_FOV_DEG, MIN_RADIUS, DEBUG } from "./constants";

export type SlicePlan = {
  clamped: number;
  widths: number[];
};

/**
 * Compute cone partition plan that guarantees true tiling:
 * - ≤ 180° → single cone (clamped to 179.9° max)
 * - 181-359.9° → two cones whose widths sum exactly to F, respecting 179.9° cap
 * - 360° → three cones of 120° each (two cones can't close a full circle)
 *
 * This ensures contiguous coverage with no gaps or overlaps.
 */
export function partsForFull(fullDeg: number): SlicePlan {
  const clamped = Cesium.Math.clamp(fullDeg, 0, 360);
  let result: SlicePlan;

  // No sensor
  if (clamped <= 0) {
    result = { clamped, widths: [] };
  } else if (clamped <= 180) {
    // Single-cone path (usually handled by single builder)
    result = { clamped, widths: [Math.min(MAX_CONE_FOV_DEG, clamped)] };
  } else if (clamped < 360) {
    // Composite path 181-359.9 => two cones that tile exactly
    let w1 = Math.min(MAX_CONE_FOV_DEG, clamped / 2);
    let w2 = clamped - w1;

    // Hard-cap w2 as well; then re-balance to preserve sum
    if (w2 > MAX_CONE_FOV_DEG) {
      w2 = MAX_CONE_FOV_DEG;
      w1 = clamped - w2;
      if (w1 > MAX_CONE_FOV_DEG) w1 = MAX_CONE_FOV_DEG; // extreme guard
    }

    // Guard against tiny rounding drift
    const tiny = 1e-6;
    if (w1 + w2 > clamped + tiny) {
      w2 = clamped - w1;
    }

    result = { clamped, widths: [w1, w2] };
  } else {
    // 360° => three cones (120° each)
    // Two cones cannot close a full circle because of 179.9° cap
    result = { clamped: 360, widths: [120, 120, 120] };
  }

  if (DEBUG) {
    console.log(
      `[partsForFull] full=${fullDeg.toFixed(1)} -> clamped=${result.clamped.toFixed(1)} widths=[${result.widths.map((w) => w.toFixed(1)).join(", ")}]`
    );
  }

  return result;
}

/**
 * Check if a sensor or part is destroyed
 */
export function isDestroyed(x: any): boolean {
  return !x || (typeof x.isDestroyed === "function" && x.isDestroyed());
}

/**
 * Safely read radius from a sensor handle
 */
export function readSafeRadius(x: any): number {
  try {
    return Math.max(MIN_RADIUS, x?.radius ?? MIN_RADIUS);
  } catch {
    return MIN_RADIUS;
  }
}

/**
 * Request a Cesium scene render
 */
export function requestRender(viewer?: any): void {
  viewer?.scene?.requestRender?.();
}

/**
 * Safely remove a primitive from the scene
 */
export function safeRemovePrimitive(
  viewer: any,
  primitive: any,
  destroy = true
): void {
  try {
    if (viewer?.scene?.primitives?.contains(primitive)) {
      viewer.scene.primitives.remove(primitive);
    }
  } catch {
    // Silently ignore
  }

  if (destroy) {
    try {
      if (typeof primitive?.destroy === "function") {
        primitive.destroy();
      }
    } catch {
      // Silently ignore
    }
  }
}

/**
 * Sanitize FOV value for rectangular sensors
 */
export function sanitizeFov(deg: number): number {
  if (!Number.isFinite(deg)) return 60;
  const mod = ((deg % 360) + 360) % 360;
  const folded = mod > 180 ? 360 - mod : mod;
  return Math.min(MAX_CONE_FOV_DEG, Math.max(1, folded));
}
