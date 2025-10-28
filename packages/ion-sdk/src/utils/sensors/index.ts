/**
 * Ion SDK Sensor Utilities
 *
 * Simplified API for creating and managing Cesium Ion SDK sensors:
 * - Single conic sensors (up to 180°)
 * - Rectangular sensors
 * - Live FOV/radius updates
 */

// ===== TYPE EXPORTS =====
export type { IonSensor } from "./types";

// ===== CONSTANT EXPORTS =====
export {
  DEBUG,
  MAX_CONE_FOV_DEG,
  MIN_RADIUS,
  DEFAULT_VOLUME_ALPHA,
  DEFAULT_VISIBLE_ALPHA,
  DEFAULT_OCCLUDED_COLOR_BYTES,
} from "./constants";

// ===== HELPER EXPORTS =====
export {
  isDestroyed,
  requestRender,
  safeRemovePrimitive,
  sanitizeFov,
} from "./helpers";

// ===== CREATOR EXPORTS =====
export { createConicSensor, createRectangularSensor } from "./creators";
export type { ConicSensorOptions, RectangularSensorOptions } from "./creators";

// ===== UPDATER EXPORTS =====
export {
  updatePose,
  updateFlags,
  updateColors,
  updateFovRadius,
  updateRectangularFovRadius,
} from "./updaters";

// ===== DESTROYER EXPORTS =====
export { destroySensor } from "./destroyer";
