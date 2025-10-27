/**
 * Helper utilities for sensor operations
 */

import * as Cesium from "cesium";
import { MAX_CONE_FOV_DEG, MIN_RADIUS } from "./constants";

/**
 * Check if a sensor is destroyed
 */
export function isDestroyed(x: any): boolean {
  return !x || (typeof x.isDestroyed === "function" && x.isDestroyed());
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
