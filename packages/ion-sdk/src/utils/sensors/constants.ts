/**
 * Constants for sensor configuration
 */

// DEBUG_SENSORS is a compile-time constant defined via DefinePlugin
// In production, this evaluates to false and all sensor debug code is eliminated
declare const DEBUG_SENSORS: boolean;
export const DEBUG = typeof DEBUG_SENSORS !== 'undefined' ? DEBUG_SENSORS : false;

// Maximum FOV per cone (Cesium limitation)
export const MAX_CONE_FOV_DEG = 179.9;

// Minimum safe radius
export const MIN_RADIUS = 1;

// Default alpha values
export const DEFAULT_VOLUME_ALPHA = 0.25;
export const DEFAULT_VISIBLE_ALPHA = 0.35;

// Default occluded color (red)
export const DEFAULT_OCCLUDED_COLOR_BYTES = { r: 255, g: 0, b: 0, a: 110 };
