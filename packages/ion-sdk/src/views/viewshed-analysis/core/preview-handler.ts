import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import { updateFovRadius, updateFlags, updateColors } from "../../../utils/sensors";

declare global {
  interface Window {
    __obsPreviewLastTick?: Record<string, number>;
  }
}

interface PreviewHandlerConfig {
  objectId: string;
  sensorRef: React.MutableRefObject<any>;
  isTransitioningRef: React.MutableRefObject<boolean>;
  properties: ObservationProperties;
  viewer: any;
}

export function createPreviewHandler(config: PreviewHandlerConfig) {
  const {
    objectId,
    sensorRef,
    isTransitioningRef,
    properties,
    viewer,
  } = config;

  // Throttle preview updates to reduce render load
  let throttleTimeout: NodeJS.Timeout | null = null;
  const THROTTLE_MS = 16; // ~60fps max

  return (event: Event) => {
    const {
      objectId: previewObjectId,
      patch,
      tick,
    } = (event as CustomEvent).detail || {};

    if (previewObjectId !== objectId) return;

    const last = window.__obsPreviewLastTick?.[objectId];
    if (tick != null && last === tick) return;
    if (window.__obsPreviewLastTick) {
      window.__obsPreviewLastTick[objectId] = tick;
    }

    if (!sensorRef.current) return;

    // Clean up dead handles immediately
    let handle = sensorRef.current;
    if (handle && typeof handle.isDestroyed === "function" && handle.isDestroyed()) {
      sensorRef.current = null;
      handle = null;
    }

    if (!handle) return;
    if (isTransitioningRef.current) return;

    // Throttle: only process if no pending update
    if (throttleTimeout) return;

    try {
      const needsUpdate = patch.fov !== undefined || patch.visibilityRadius !== undefined;
      if (!needsUpdate) return;

      isTransitioningRef.current = true;
      
      // Set throttle timeout
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, THROTTLE_MS);

      const nextProperties: ObservationProperties = {
        ...properties,
        fov: patch.fov ?? properties.fov,
        visibilityRadius: patch.visibilityRadius ?? properties.visibilityRadius,
      };

      // Update in place for single sensor mode
      updateFovRadius(sensorRef.current, {
        fovDeg: nextProperties.fov,
        radius: nextProperties.visibilityRadius,
        viewer,
      });

      // Apply styling after a frame
      requestAnimationFrame(() => {
        try {
          if (sensorRef.current && sensorRef.current.show !== undefined) {
            // Update flags
            updateFlags(sensorRef.current, {
              show: !!nextProperties.showSensorGeometry || !!nextProperties.showViewshed,
              showViewshed: !!nextProperties.showViewshed,
            });

            // Update colors if changed
            if (nextProperties.sensorColor) {
              const color = Cesium.Color.fromCssColorString(nextProperties.sensorColor);
              updateColors(sensorRef.current, {
                volume: color.withAlpha(0.25),
                visible: color.withAlpha(0.35),
                occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
              });
            }
          }
        } catch (err) {
          console.warn("[Preview] Failed to update style:", err);
        } finally {
          isTransitioningRef.current = false;
        }
      });
    } catch (err) {
      console.error("[PREVIEW ERROR]", err);
      isTransitioningRef.current = false;
    }
  };
}

export function initializePreviewGlobals() {
  if (!window.__obsPreviewLastTick) {
    window.__obsPreviewLastTick = {};
  }
}
