/**
 * Modular Ion SDK Sensor Utilities
 *
 * This module provides a clean, modular API for creating and managing
 * Cesium Ion SDK sensors with support for:
 * - Single conic sensors (FOV ≤ 180°)
 * - Composite sensors (FOV > 180°) using multiple cones
 * - Rectangular sensors
 * - Live FOV/radius updates with hysteresis
 * - Smooth single ⇄ composite transitions
 *
 * Architecture:
 * - types.ts: TypeScript type definitions
 * - constants.ts: Configuration constants
 * - helpers.ts: Pure utility functions
 * - composite.ts: Composite sensor builder
 * - creators.ts: Factory functions for sensor creation
 * - updaters.ts: Functions for updating existing sensors
 * - destroyer.ts: Cleanup and resource management
 */

// ===== TYPE EXPORTS =====
export type {
  IonSensor,
  SensorComposite,
  SensorColors,
  SensorFlags,
} from "./types";

// ===== CONSTANT EXPORTS =====
export {
  DEBUG,
  PROMOTE_AT_DEG,
  DEMOTE_AT_DEG,
  MAX_CONE_FOV_DEG,
  MIN_RADIUS,
  DEFAULT_VOLUME_ALPHA,
  DEFAULT_VISIBLE_ALPHA,
  MIN_PART_ALPHA,
  DEFAULT_OCCLUDED_COLOR_BYTES,
} from "./constants";

// ===== HELPER EXPORTS =====
export {
  partsForFull,
  isDestroyed,
  readSafeRadius,
  requestRender,
  safeRemovePrimitive,
  sanitizeFov,
} from "./helpers";
export type { SlicePlan } from "./helpers";

// ===== COMPOSITE EXPORTS =====
export { buildCompositeConicSensor } from "./composite";
export type { BuildOpts } from "./composite";

// ===== CREATOR EXPORTS =====
export {
  createConicSensorOrComposite,
  createRectangularSensor,
} from "./creators";
export type { ConicSensorOptions, RectangularSensorOptions } from "./creators";

// ===== UPDATER EXPORTS =====
export {
  updatePose,
  updateFlags,
  updateColors,
  updateFovRadiusSmart,
} from "./updaters";

// ===== DESTROYER EXPORTS =====
export { destroySensor } from "./destroyer";
