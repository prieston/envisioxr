import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import {
  updateFovRadius,
  updateFlags,
  updateColors,
} from "../../../utils/sensors";

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
  const { objectId, sensorRef, isTransitioningRef, properties, viewer } =
    config;

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

    console.log("[PREVIEW] Received event tick=", tick, "patch=", patch);

    if (!sensorRef.current) {
      console.log("[PREVIEW] Early return: no sensor ref");
      return;
    }

    // Clean up dead handles immediately
    let handle = sensorRef.current;
    if (
      handle &&
      typeof handle.isDestroyed === "function" &&
      handle.isDestroyed()
    ) {
      console.log("[PREVIEW] Sensor was destroyed, clearing ref");
      sensorRef.current = null;
      handle = null;
    }

    if (!handle) {
      console.log("[PREVIEW] Early return: no valid handle");
      return;
    }
    if (isTransitioningRef.current) {
      console.log("[PREVIEW] Early return: transitioning");
      return;
    }

    // Throttle: only process if no pending update
    if (throttleTimeout) {
      console.log("[PREVIEW] Early return: throttled");
      return;
    }

    try {
      const needsUpdate =
        patch.fov !== undefined || patch.visibilityRadius !== undefined;
      if (!needsUpdate) {
        console.log("[PREVIEW] No FOV/radius update needed");
        return;
      }

      console.log(
        "[PREVIEW] Updating sensor in-place with fov=",
        patch.fov,
        "radius=",
        patch.visibilityRadius
      );
      const primitiveCount = viewer?.scene?.primitives?.length;
      console.log("[PREVIEW] Primitives before update:", primitiveCount);

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

      const primitiveCountAfter = viewer?.scene?.primitives?.length;
      console.log(
        "[PREVIEW] Primitives after FOV update:",
        primitiveCountAfter
      );
      if (primitiveCountAfter !== primitiveCount) {
        console.warn(
          "[PREVIEW] ⚠️ WARNING: Primitive count changed! before=",
          primitiveCount,
          "after=",
          primitiveCountAfter
        );
      }

      // Apply styling after a frame
      requestAnimationFrame(() => {
        try {
          console.log("[PREVIEW] Requesting styling update in rAF");
          const beforeCount = viewer?.scene?.primitives?.length;

          if (sensorRef.current && sensorRef.current.show !== undefined) {
            // Update flags
            updateFlags(sensorRef.current, {
              show:
                !!nextProperties.showSensorGeometry ||
                !!nextProperties.showViewshed,
              showViewshed: !!nextProperties.showViewshed,
            });

            // Update colors if changed
            if (nextProperties.sensorColor) {
              const color = Cesium.Color.fromCssColorString(
                nextProperties.sensorColor
              );
              updateColors(sensorRef.current, {
                volume: color.withAlpha(0.25),
                visible: color.withAlpha(0.35),
                occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
              });
            }
          }

          const afterCount = viewer?.scene?.primitives?.length;
          console.log(
            "[PREVIEW] Primitives after styling:",
            beforeCount,
            "->",
            afterCount
          );
          if (afterCount !== beforeCount) {
            console.warn(
              "[PREVIEW] ⚠️ WARNING: Primitive count changed during styling!"
            );
          }
        } catch (err) {
          console.warn("[Preview] Failed to update style:", err);
        } finally {
          isTransitioningRef.current = false;
          console.log("[PREVIEW] Done, transitioning=false");
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
