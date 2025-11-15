import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import {
  updateFovRadius,
  updateFlags,
  updateColors,
} from "../../../utils/sensors";
import { getThrottleConfig } from "../config/throttle-config";

interface UpdateSensorParams {
  handle: any;
  properties: ObservationProperties;
  viewer: any;
  modelMatrix: Cesium.Matrix4;
}

export function updateSensorFovRadius(params: UpdateSensorParams) {
  const { handle, properties, viewer } = params;

  if (!handle) {
    return null;
  }

  const updated = updateFovRadius(handle, {
    fovDeg: properties.fov,
    radius: properties.visibilityRadius,
    viewer,
  });

  return updated;
}

export function applySensorFlags(
  handle: any,
  properties: ObservationProperties,
  viewer: any
) {
  if (!handle) return;

  try {
    // Always update geometry visibility based on showSensorGeometry
    // This ensures surfaces are hidden when showSensorGeometry is false
    updateFlags(handle, {
      show: !!properties.showSensorGeometry || !!properties.showViewshed,
      showViewshed: !!properties.showViewshed,
      showGeometry: !!properties.showSensorGeometry, // Explicitly set geometry visibility
    });
    viewer?.scene?.requestRender();
  } catch (err) {
    // Failed to update flags
  }
}

// Theme colors matching app design system
const THEME_ERROR_RED = "#ef4444"; // Light mode error color

export function applySensorColors(
  handle: any,
  properties: ObservationProperties,
  viewer: any
) {
  if (!handle || !properties.sensorColor) return;

  try {
    const color = Cesium.Color.fromCssColorString(properties.sensorColor);
    // Use viewshedOpacity from properties, default to 0.35 if not specified
    const opacity = properties.viewshedOpacity ?? 0.35;
    // Use theme error color for occluded areas (softer than pure red)
    // Default to light mode color, can be enhanced to detect dark mode if needed
    // Occluded areas use slightly higher opacity for better visibility
    const occludedOpacity = Math.min(opacity * 1.23, 1.0); // ~43% when opacity is 35%
    const occludedColor = Cesium.Color.fromCssColorString(THEME_ERROR_RED).withAlpha(occludedOpacity);
    updateColors(handle, {
      volume: color.withAlpha(opacity * 0.71), // ~25% when opacity is 35%
      visible: color.withAlpha(opacity), // Use the user-defined opacity
      occluded: occludedColor,
    });
    viewer?.scene?.requestRender();
  } catch (err) {
    // Failed to update colors
  }
}

// Track RAF IDs and timeouts for cleanup
const rafCallbacks = new WeakMap<any, number>();
const timeoutCallbacks = new WeakMap<any, ReturnType<typeof setTimeout>>();
const lastStyleUpdateTime = new WeakMap<any, number>();

// Track the last known active state to detect changes
const lastActiveState = new WeakMap<any, boolean>();

export function applySensorStyle(
  handle: any,
  properties: ObservationProperties,
  viewer: any,
  isActive: boolean = false
) {
  if (!handle) return;

  // Cancel any pending RAF or timeout for this handle
  const existingRafId = rafCallbacks.get(handle);
  if (existingRafId !== undefined) {
    cancelAnimationFrame(existingRafId);
    rafCallbacks.delete(handle);
  }

  const existingTimeout = timeoutCallbacks.get(handle);
  if (existingTimeout !== undefined) {
    clearTimeout(existingTimeout);
    timeoutCallbacks.delete(handle);
  }

  const performUpdate = () => {
    rafCallbacks.delete(handle);
    timeoutCallbacks.delete(handle);
    // Verify handle is still valid before updating
    if (
      !handle ||
      (typeof handle.isDestroyed === "function" && handle.isDestroyed())
    ) {
      return;
    }
    applySensorFlags(handle, properties, viewer);
    applySensorColors(handle, properties, viewer);
    lastStyleUpdateTime.set(handle, Date.now());
  };

  const throttle = getThrottleConfig();
  const wasActive = lastActiveState.get(handle);
  const activeStateChanged = wasActive !== undefined && wasActive !== isActive;
  lastActiveState.set(handle, isActive);

  // Always update immediately if:
  // 1. Viewshed is active (selected)
  // 2. Throttling is disabled
  // 3. Active state just changed (to ensure correct visibility state)
  if (isActive || !throttle.enabled || activeStateChanged) {
    // Active viewshed, throttling disabled, or state changed: update immediately via RAF
    const rafId = requestAnimationFrame(performUpdate);
    rafCallbacks.set(handle, rafId);
  } else {
    // Inactive viewshed: throttle based on configuration
    const lastUpdate = lastStyleUpdateTime.get(handle) || 0;
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdate;
    const throttleInterval = throttle.inactiveUpdateIntervalMs;

    if (timeSinceLastUpdate >= throttleInterval) {
      // Enough time has passed, update immediately
      const rafId = requestAnimationFrame(performUpdate);
      rafCallbacks.set(handle, rafId);
    } else {
      // Queue update for later
      const remainingTime = throttleInterval - timeSinceLastUpdate;
      const timeoutId = setTimeout(() => {
        timeoutCallbacks.delete(handle);
        const rafId = requestAnimationFrame(performUpdate);
        rafCallbacks.set(handle, rafId);
      }, remainingTime);
      timeoutCallbacks.set(handle, timeoutId);
    }
  }
}

export function cancelPendingSensorStyleUpdates(handle: any) {
  const rafId = rafCallbacks.get(handle);
  if (rafId !== undefined) {
    cancelAnimationFrame(rafId);
    rafCallbacks.delete(handle);
  }

  const timeoutId = timeoutCallbacks.get(handle);
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
    timeoutCallbacks.delete(handle);
  }
}
