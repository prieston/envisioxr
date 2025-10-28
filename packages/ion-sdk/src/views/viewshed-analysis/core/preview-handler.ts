import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import {
  updateFovRadius,
  updateRectangularFovRadius,
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
  propertiesRef: React.MutableRefObject<ObservationProperties>;
  viewer: any;
}

export function createPreviewHandler(config: PreviewHandlerConfig) {
  const { objectId, sensorRef, propertiesRef, viewer } = config;

  // RAF-based throttle: queue latest update and process on next frame
  let rafId: number | null = null;
  let pendingPatch: any = null;

  const processUpdate = () => {
    rafId = null;
    if (!pendingPatch) return;

    const patch = pendingPatch;
    pendingPatch = null;

    const handle = sensorRef.current;
    if (!handle) return;

    // Skip destroyed sensors
    if (typeof handle.isDestroyed === "function" && handle.isDestroyed()) {
      sensorRef.current = null;
      return;
    }

    try {
      const needsUpdate =
        patch.fov !== undefined ||
        patch.fovH !== undefined ||
        patch.fovV !== undefined ||
        patch.visibilityRadius !== undefined ||
        patch.showSensorGeometry !== undefined ||
        patch.showViewshed !== undefined ||
        patch.sensorColor !== undefined ||
        patch.viewshedColor !== undefined;

      if (!needsUpdate) return;

      const properties = propertiesRef.current;
      const nextProperties: ObservationProperties = {
        ...properties,
        fov: patch.fov ?? properties.fov,
        fovH: patch.fovH ?? properties.fovH,
        fovV: patch.fovV ?? properties.fovV,
        visibilityRadius: patch.visibilityRadius ?? properties.visibilityRadius,
        showSensorGeometry:
          patch.showSensorGeometry !== undefined
            ? patch.showSensorGeometry
            : properties.showSensorGeometry,
        showViewshed:
          patch.showViewshed !== undefined
            ? patch.showViewshed
            : properties.showViewshed,
      };

      // Update visibility flags
      if (
        patch.showSensorGeometry !== undefined ||
        patch.showViewshed !== undefined
      ) {
        updateFlags(handle, {
          show:
            !!nextProperties.showSensorGeometry ||
            !!nextProperties.showViewshed,
          showViewshed: !!nextProperties.showViewshed,
          showGeometry: !!nextProperties.showSensorGeometry,
        });
      }

      // Update FOV and radius
      if (nextProperties.sensorType === "rectangle") {
        updateRectangularFovRadius(handle, {
          fovHdeg:
            patch.fovH !== undefined
              ? (nextProperties.fovH ?? nextProperties.fov)
              : undefined,
          fovVdeg:
            patch.fovV !== undefined
              ? (nextProperties.fovV ??
                Math.round((nextProperties.fov ?? 60) * 0.6))
              : undefined,
          radius:
            patch.visibilityRadius !== undefined
              ? nextProperties.visibilityRadius
              : undefined,
          viewer,
        });
      } else {
        updateFovRadius(handle, {
          fovDeg: patch.fov !== undefined ? nextProperties.fov : undefined,
          radius:
            patch.visibilityRadius !== undefined
              ? nextProperties.visibilityRadius
              : undefined,
          viewer,
        });
      }

      // Update colors
      if (patch.sensorColor && nextProperties.sensorColor) {
        const color = Cesium.Color.fromCssColorString(
          nextProperties.sensorColor
        );
        updateColors(handle, {
          volume: color.withAlpha(0.25),
          visible: color.withAlpha(0.35),
          occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
        });
      }
    } catch (err) {
      console.error("[ViewshedAnalysis] Preview update failed:", err);
    }
  };

  return (event: Event) => {
    const {
      objectId: previewObjectId,
      patch,
      tick,
    } = (event as CustomEvent).detail || {};

    if (previewObjectId !== objectId) return;

    // Deduplicate events with same tick
    const last = window.__obsPreviewLastTick?.[objectId];
    if (tick != null && last === tick) return;
    if (window.__obsPreviewLastTick) {
      window.__obsPreviewLastTick[objectId] = tick;
    }

    // Queue update and schedule RAF if not already scheduled
    pendingPatch = { ...patch };

    if (rafId === null) {
      rafId = requestAnimationFrame(processUpdate);
    }
  };
}

export function initializePreviewGlobals() {
  if (!window.__obsPreviewLastTick) {
    window.__obsPreviewLastTick = {};
  }
}
