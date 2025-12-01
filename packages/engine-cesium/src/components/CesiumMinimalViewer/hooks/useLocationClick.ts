import { useRef, useEffect } from "react";
import { matrix4ToArray } from "../../../utils/tileset-transform";
import type { CesiumModule } from "../types";

interface UseLocationClickOptions {
  viewer: any | null;
  Cesium: CesiumModule | null;
  tilesetRef: React.RefObject<any>;
  enabled: boolean;
  onLocationClick?: (
    longitude: number,
    latitude: number,
    height: number,
    matrix: number[]
  ) => void;
}

interface ClickHandlerData {
  handler: any;
  prevCursor: string;
}

/**
 * Setup click handler for location editing
 */
function setupClickHandler(
  viewer: any,
  Cesium: CesiumModule,
  tilesetRef: React.RefObject<any>,
  onLocationClick?: (
    lng: number,
    lat: number,
    height: number,
    matrix: number[]
  ) => void
): ClickHandlerData | null {
  // Check if viewer and scene are valid
  if (!viewer || (viewer.isDestroyed && viewer.isDestroyed()) || !viewer.scene) {
    return null;
  }

  const canvas = viewer.scene?.canvas;
  if (!canvas) return null;

  const handler = new Cesium.ScreenSpaceEventHandler(canvas);
  const prevCursor = canvas.style.cursor;
  canvas.style.cursor = "crosshair";

  handler.setInputAction((click: any) => {
    // Check if viewer and scene are still valid
    if (!viewer || (viewer.isDestroyed && viewer.isDestroyed()) || !viewer.scene) {
      return;
    }

    // Use the same picking logic as the builder (3-step approach)
    const position = new Cesium.Cartesian2(click.position.x, click.position.y);

    let pickedPosition: any = null;

    // Step 1: Try to pick a 3D position (terrain, models, etc.)
    if (viewer.scene) {
      pickedPosition = viewer.scene.pickPosition(position);
    }

    // Step 2: If that fails, try to pick on the globe using ray
    if (!Cesium.defined(pickedPosition) && viewer.scene && viewer.scene.globe) {
      const ray = viewer.camera.getPickRay(position);
      if (ray) {
        pickedPosition = viewer.scene.globe.pick(ray, viewer.scene);
      }
    }

    // Step 3: If still no position, try the ellipsoid directly (fallback)
    if (!Cesium.defined(pickedPosition) && viewer.scene && viewer.scene.globe) {
      pickedPosition = viewer.camera.pickEllipsoid(
        position,
        viewer.scene.globe.ellipsoid
      );
    }

    if (pickedPosition) {
      const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const height = cartographic.height;
      const adjustedHeight = height;

      // Compute the matrix
      const positionCartesian = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        adjustedHeight
      );
      const transformMatrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(positionCartesian);

      // Apply to tileset immediately
      if (tilesetRef.current) {
        tilesetRef.current.modelMatrix = transformMatrix;

        // Request multiple renders to ensure proper update
        if (viewer && viewer.scene && !(viewer.isDestroyed && viewer.isDestroyed())) {
          viewer.scene.requestRender();
        }
        setTimeout(() => {
          if (viewer && viewer.scene && !(viewer.isDestroyed && viewer.isDestroyed())) {
            viewer.scene.requestRender();
          }
        }, 0);
        setTimeout(() => {
          if (viewer && viewer.scene && !(viewer.isDestroyed && viewer.isDestroyed())) {
            viewer.scene.requestRender();
          }
        }, 50);
        setTimeout(() => {
          if (viewer && viewer.scene && !(viewer.isDestroyed && viewer.isDestroyed())) {
            viewer.scene.requestRender();
          }
        }, 100);
      }

      // Convert to array
      const matrixArray = matrix4ToArray(transformMatrix);

      if (onLocationClick) {
        onLocationClick(longitude, latitude, adjustedHeight, matrixArray);
      }
    } else {
      console.warn("[useLocationClick] Could not pick position from click");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  return { handler, prevCursor };
}

/**
 * Cleanup click handler
 */
function cleanupClickHandler(viewer: any, handlerData: ClickHandlerData | null) {
  if (handlerData?.handler) {
    handlerData.handler.destroy();
    const canvas = viewer?.scene?.canvas;
    if (canvas && handlerData.prevCursor !== undefined) {
      canvas.style.cursor = handlerData.prevCursor || "auto";
    }
  }
}

/**
 * Hook to manage location click handler
 */
export function useLocationClick({
  viewer,
  Cesium,
  tilesetRef,
  enabled,
  onLocationClick,
}: UseLocationClickOptions) {
  const clickHandlerDataRef = useRef<ClickHandlerData | null>(null);

  useEffect(() => {
    if (!viewer || !Cesium || !enabled || !onLocationClick) {
      // Cleanup handler if disabled
      if (clickHandlerDataRef.current) {
        cleanupClickHandler(viewer, clickHandlerDataRef.current);
        clickHandlerDataRef.current = null;
      }
      return;
    }

    // Cleanup existing handler
    cleanupClickHandler(viewer, clickHandlerDataRef.current);

    // Setup new handler
    clickHandlerDataRef.current = setupClickHandler(
      viewer,
      Cesium,
      tilesetRef,
      onLocationClick
    );

    // Cleanup on unmount
    return () => {
      cleanupClickHandler(viewer, clickHandlerDataRef.current);
      clickHandlerDataRef.current = null;
    };
  }, [viewer, Cesium, enabled, onLocationClick]);
}


