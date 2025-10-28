import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import {
  updateFovRadius,
  updateRectangularFovRadius,
  updateFlags,
  updateColors,
} from "../../../utils/sensors";

const DEBUG = false;

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
  const { objectId, sensorRef, isTransitioningRef, propertiesRef, viewer } =
    config;

  // RAF-based throttle: queue latest update and process on next frame
  let rafId: number | null = null;
  let pendingPatch: any = null;

  const processUpdate = () => {
    DEBUG &&
      console.log("[PREVIEW] 🔄 Processing RAF, pendingPatch=", pendingPatch);
    rafId = null;
    if (!pendingPatch) {
      DEBUG && console.log("[PREVIEW] ⚠️ No pendingPatch to process!");
      return;
    }

    const patch = pendingPatch;
    pendingPatch = null;
    DEBUG && console.log("[PREVIEW] ✅ Processing patch=", patch);

    if (!sensorRef.current) {
      DEBUG && console.log("[PREVIEW] Process: no sensor ref");
      return;
    }

    // Clean up dead handles immediately
    const handle = sensorRef.current;
    if (
      handle &&
      typeof handle.isDestroyed === "function" &&
      handle.isDestroyed()
    ) {
      DEBUG && console.log("[PREVIEW] Process: sensor destroyed, clearing ref");
      sensorRef.current = null;
      return;
    }

    if (!handle) {
      DEBUG && console.log("[PREVIEW] Process: no valid handle");
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
      if (!needsUpdate) {
        DEBUG && console.log("[PREVIEW] Process: no update needed");
        return;
      }

      const primitiveCount = viewer?.scene?.primitives?.length;
      DEBUG &&
        console.log("[PREVIEW] Process: primitives before=", primitiveCount);

      // Use latest properties from ref
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

      DEBUG &&
        console.log(
          `🔄 [PREVIEW] FOV=${nextProperties.fov}° radius=${nextProperties.visibilityRadius}m showGeometry=${nextProperties.showSensorGeometry} showViewshed=${nextProperties.showViewshed}`
        );

      // Update flags immediately for instant feedback
      if (
        patch.showSensorGeometry !== undefined ||
        patch.showViewshed !== undefined
      ) {
        if (handle && handle.show !== undefined) {
          updateFlags(handle, {
            show:
              !!nextProperties.showSensorGeometry ||
              !!nextProperties.showViewshed,
            showViewshed: !!nextProperties.showViewshed,
            showGeometry: !!nextProperties.showSensorGeometry,
          });
        }
      }

      // Update FOV/radius
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

      // Update colors if changed
      if (patch.sensorColor || patch.viewshedColor) {
        if (nextProperties.sensorColor) {
          const color = Cesium.Color.fromCssColorString(
            nextProperties.sensorColor
          );
          updateColors(handle, {
            volume: color.withAlpha(0.25),
            visible: color.withAlpha(0.35),
            occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
          });
        }
      }

      const primitiveCountAfter = viewer?.scene?.primitives?.length;
      if (primitiveCountAfter !== primitiveCount) {
        console.warn(
          `⚠️ [PREVIEW] Primitives changed! ${primitiveCount} → ${primitiveCountAfter}`
        );
      }
    } catch (err) {
      console.error("[PREVIEW ERROR]", err);
    }
  };

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

    console.log("[PREVIEW] 📥 Received tick=", tick, "patch=", patch);

    // Replace (not merge) pending patch to always use latest values
    pendingPatch = { ...patch };
    console.log(
      "[PREVIEW] 📦 Queued pendingPatch=",
      pendingPatch,
      "rafId=",
      rafId
    );

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
