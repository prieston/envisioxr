import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import { updateSensorFovRadius, applySensorStyle } from "./sensor-updater";

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

    let handle = sensorRef.current;
    if (
      handle &&
      typeof (handle as any).isDestroyed === "function" &&
      (handle as any).isDestroyed()
    ) {
      sensorRef.current = null;
      handle = null;
    }

    if (!handle) return;
    if (isTransitioningRef.current) return;

    // Throttle: only process if no pending update
    if (throttleTimeout) return;

    try {
      if (patch.fov !== undefined || patch.visibilityRadius !== undefined) {
        isTransitioningRef.current = true;

        // Set throttle timeout
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, THROTTLE_MS);

        const modelMatrix = sensorRef.current?.modelMatrix ?? Cesium.Matrix4.IDENTITY;

        console.log("[PREVIEW] Updating sensor with fov:", patch.fov);
        
        updateSensorFovRadius({
          handle: sensorRef.current,
          properties: {
            ...properties,
            fov: patch.fov ?? properties.fov,
            visibilityRadius: patch.visibilityRadius ?? properties.visibilityRadius,
          },
          viewer,
          modelMatrix,
        });

        requestAnimationFrame(() => {
          try {
            if (sensorRef.current) {
              applySensorStyle(sensorRef.current, properties, viewer);
            }
          } catch (err) {
            console.warn("Failed to update preview style:", err);
          } finally {
            isTransitioningRef.current = false;
          }
        });
      }
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
