"use client";

import { useRef, useEffect } from "react";
import { ensureCesiumBaseUrl } from "../utils/cesium-config";
import { arrayToMatrix4, matrix4ToArray } from "../utils/tileset-transform";

export interface CesiumMinimalViewerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cesiumAssetId?: string;
  cesiumApiKey?: string;
  assetType?: string;
  onViewerReady?: (viewer: any) => void;
  onError?: (error: Error) => void;
  onLocationNotSet?: () => void;
  onTilesetReady?: (tileset: any) => void;
  initialTransform?: number[];
  enableLocationEditing?: boolean;
  enableClickToPosition?: boolean; // New prop to control if click-to-position is active
  onLocationClick?: (
    longitude: number,
    latitude: number,
    height: number,
    matrix: number[]
  ) => void;
}

/**
 * Setup OpenStreetMap imagery for location editing
 */
async function setupImagery(viewer: any, Cesium: any) {
  try {
    const imageryProvider = new Cesium.UrlTemplateImageryProvider({
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      credit: "© OpenStreetMap contributors",
      maximumLevel: 19,
    });

    viewer.imageryLayers.addImageryProvider(imageryProvider);
  } catch (err) {
    console.error("[CesiumMinimalViewer] Failed to add imagery:", err);
  }
}

/**
 * Setup Cesium World Terrain for accurate height picking
 */
async function setupTerrain(viewer: any, Cesium: any) {
  try {
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(
      1,
      {
        requestVertexNormals: true,
        requestWaterMask: true,
      }
    );

    // Enable depth testing against terrain
    viewer.scene.globe.depthTestAgainstTerrain = true;
  } catch (err) {
    console.error("[CesiumMinimalViewer] Failed to add terrain:", err);
    // Continue without terrain if it fails
  }
}

/**
 * Setup click handler for location editing - uses same logic as builder
 */
function setupClickHandler(
  viewer: any,
  Cesium: any,
  tilesetRef: React.RefObject<any>,
  onLocationClick?: (
    lng: number,
    lat: number,
    height: number,
    matrix: number[]
  ) => void
) {
  const canvas = viewer.scene?.canvas;
  if (!canvas) return null;
  const handler = new Cesium.ScreenSpaceEventHandler(canvas);
  const prevCursor = canvas.style.cursor;
  canvas.style.cursor = "crosshair";

  handler.setInputAction((click: any) => {
    // Use the same picking logic as the builder (3-step approach)
    const position = new Cesium.Cartesian2(click.position.x, click.position.y);

    let pickedPosition: any = null;

    // Step 1: Try to pick a 3D position (terrain, models, etc.)
    pickedPosition = viewer.scene.pickPosition(position);

    // Step 2: If that fails, try to pick on the globe using ray
    if (!Cesium.defined(pickedPosition)) {
      const ray = viewer.camera.getPickRay(position);
      if (ray) {
        pickedPosition = viewer.scene.globe.pick(ray, viewer.scene);
      }
    }

    // Step 3: If still no position, try the ellipsoid directly (fallback)
    if (!Cesium.defined(pickedPosition)) {
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
      // Use the picked height directly without offset
      // Users can adjust height manually if needed
      const adjustedHeight = height;

      // Compute the matrix - create position from lon/lat/height
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
        viewer.scene.requestRender();
        setTimeout(() => {
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.requestRender();
          }
        }, 0);
        setTimeout(() => {
          if (viewer && !viewer.isDestroyed()) {
            viewer.scene.requestRender();
          }
        }, 50);
        setTimeout(() => {
          if (viewer && !viewer.isDestroyed()) {
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
      console.warn("[CesiumMinimalViewer] Could not pick position from click");
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  return { handler, prevCursor };
}

/**
 * Cleanup click handler
 */
function cleanupClickHandler(viewer: any, handlerData: any) {
  if (handlerData?.handler) {
    handlerData.handler.destroy();
    const canvas = viewer?.scene?.canvas;
    if (canvas && handlerData.prevCursor !== undefined) {
      canvas.style.cursor = handlerData.prevCursor || "auto";
    }
  }
}

/**
 * Load a Cesium 3D Tileset
 */
async function loadTileset(
  Cesium: any,
  cesiumAssetId: string,
  initialTransform?: number[]
) {
  const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(
    parseInt(cesiumAssetId)
  );
  // Apply initial transform BEFORE adding to scene
  if (initialTransform && initialTransform.length === 16) {
    const transformMatrix = arrayToMatrix4(Cesium, initialTransform);
    tileset.modelMatrix = transformMatrix;
  }

  return tileset;
}

/**
 * Position camera to view the tileset
 */
function positionCamera(viewer: any, Cesium: any, initialTransform?: number[]) {
  if (!initialTransform || initialTransform.length !== 16) {
    // Default view of Earth (San Francisco area)
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.4194, 37.7749, 10000000),
      duration: 0,
    });
    return;
  }
  // Extract position from transform matrix
  const translation = new Cesium.Cartesian3(
    initialTransform[12],
    initialTransform[13],
    initialTransform[14]
  );
  const cartographic = Cesium.Cartographic.fromCartesian(translation);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  // Calculate camera position with offset
  const radius = 50; // Approximate tileset size
  const idealHeight = Math.max(height + radius * 4, 50);
  // Fly camera to position
  const destination = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    idealHeight
  );

  const orientation = {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0,
  };

  viewer.camera.flyTo({
    destination,
    orientation,
    duration: 1.5,
  });
}

/**
 * Main Cesium Minimal Viewer Component
 */
export function CesiumMinimalViewer({
  containerRef,
  cesiumAssetId,
  cesiumApiKey,
  assetType: _assetType, // Prefix with _ to indicate intentionally unused
  onViewerReady,
  onError,
  onLocationNotSet: _onLocationNotSet, // Prefix with _ to indicate intentionally unused
  onTilesetReady,
  initialTransform,
  enableLocationEditing = false,
  enableClickToPosition = false,
  onLocationClick,
}: CesiumMinimalViewerProps) {
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);
  const tilesetRef = useRef<any>(null);
  const clickHandlerDataRef = useRef<any>(null);
  const isInitializing = useRef(false);
  const isInitialLoad = useRef(true); // Track if this is the initial load vs subsequent repositions
  const hasAppliedInitialCamera = useRef(false); // Track if we've positioned camera initially

  // Main initialization effect
  useEffect(() => {
    if (!containerRef.current || viewerRef.current || isInitializing.current) {
      return;
    }

    isInitializing.current = true;

    const initializeCesium = async () => {
      try {
        if (!containerRef.current) {
          throw new Error("Container ref is null");
        }

        // Load Cesium
        const { ensureIonSDKLoaded } = await import("@klorad/ion-sdk");
        await ensureIonSDKLoaded();
        ensureCesiumBaseUrl();

        const Cesium = await import("cesium");
        cesiumRef.current = Cesium;

        // Set Ion token
        if (cesiumApiKey) {
          Cesium.Ion.defaultAccessToken = cesiumApiKey;
        }

        // Create viewer
        const viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          infoBox: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          scene3DOnly: true,
          shouldAnimate: false,
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
        });

        viewerRef.current = viewer;
        viewer.scene.globe.enableLighting = false;

        // Setup for location editing
        if (enableLocationEditing) {
          viewer.scene.globe.show = true;
          await setupImagery(viewer, Cesium);
          await setupTerrain(viewer, Cesium);
        } else {
          viewer.scene.globe.show = false;
          viewer.scene.backgroundColor = Cesium.Color.BLACK;
        }

        // Notify viewer ready
        if (onViewerReady) {
          onViewerReady(viewer);
        }

        // Load tileset if provided
        if (cesiumAssetId) {
          const tileset = await loadTileset(
            Cesium,
            cesiumAssetId,
            initialTransform
          );
          tilesetRef.current = tileset;

          viewer.scene.primitives.add(tileset);
          // Wait for ready
          if ((tileset as any).readyPromise) {
            await (tileset as any).readyPromise;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // Re-apply transform after ready (sometimes Cesium resets it)
          if (initialTransform && initialTransform.length === 16) {
            const transformMatrix = arrayToMatrix4(Cesium, initialTransform);
            tileset.modelMatrix = transformMatrix;
            // Force Cesium to update and render the tileset at new position
            // Request multiple renders to ensure bounding sphere is recalculated
            viewer.scene.requestRender();

            // Force immediate update
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                if (viewer && !viewer.isDestroyed()) {
                  viewer.scene.requestRender();
                }
              }, i * 100);
            }
          }

          viewer.scene.requestRender();

          // Notify tileset ready
          if (onTilesetReady) {
            onTilesetReady(tileset);
          }

          // Position camera
          if (enableLocationEditing) {
            positionCamera(viewer, Cesium, initialTransform);
          } else {
            // Just zoom to tileset if not in location editing mode
            viewer.zoomTo(tileset);
          }
        }

        isInitializing.current = false;
      } catch (error) {
        console.error("[CesiumMinimalViewer] Initialization error:", error);
        isInitializing.current = false;
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    initializeCesium();

    // Cleanup
    return () => {
      if (viewerRef.current) {
        try {
          // Cleanup click handler
          cleanupClickHandler(viewerRef.current, clickHandlerDataRef.current);

          // Cleanup tileset
          if (tilesetRef.current && viewerRef.current.scene) {
            try {
              viewerRef.current.scene.primitives.remove(tilesetRef.current);
            } catch (err) {
              // Ignore
            }
            tilesetRef.current = null;
          }

          // Cleanup viewer
          if (!viewerRef.current.isDestroyed()) {
            viewerRef.current.destroy();
          }
        } catch (err) {
          console.error("[CesiumMinimalViewer] Cleanup error:", err);
        }
        viewerRef.current = null;
      }

      // Cleanup DOM
      if (containerRef.current) {
        const cesiumViewers =
          containerRef.current.querySelectorAll(".cesium-viewer");
        cesiumViewers.forEach((viewer) => {
          if (viewer.parentNode) {
            try {
              viewer.remove();
            } catch (err) {
              // Ignore
            }
          }
        });
      }
    };
  }, []);

  // Effect to manage click handler (separate from main init)
  useEffect(() => {
    if (!viewerRef.current || !cesiumRef.current) return;
    if (!enableLocationEditing || !onLocationClick || !enableClickToPosition) {
      // Cleanup handler if click mode is disabled
      cleanupClickHandler(viewerRef.current, clickHandlerDataRef.current);
      clickHandlerDataRef.current = null;
      return;
    }

    const Cesium = cesiumRef.current;

    // Cleanup existing handler
    cleanupClickHandler(viewerRef.current, clickHandlerDataRef.current);

    // Setup new handler
    clickHandlerDataRef.current = setupClickHandler(
      viewerRef.current,
      Cesium,
      tilesetRef,
      onLocationClick
    );

    // Cleanup on unmount or when dependencies change
    return () => {
      cleanupClickHandler(viewerRef.current, clickHandlerDataRef.current);
      clickHandlerDataRef.current = null;
    };
  }, [enableLocationEditing, enableClickToPosition, onLocationClick]);

  // Effect to apply transform when initialTransform changes OR when tileset becomes ready
  useEffect(() => {
    if (
      !viewerRef.current ||
      !tilesetRef.current ||
      !cesiumRef.current ||
      !initialTransform ||
      initialTransform.length !== 16
    ) {
      return;
    }

    const Cesium = cesiumRef.current;

    const matrix = arrayToMatrix4(Cesium, initialTransform);

    // Debug: Verify the matrix round-trips correctly
    const verifyMatrix = Cesium.Matrix4.toArray(matrix, new Array(16));
    const match = verifyMatrix.every(
      (val: number, i: number) =>
        Math.abs(val - initialTransform[i]) < 0.0000001
    );

    tilesetRef.current.modelMatrix = matrix;
    viewerRef.current.scene.requestRender();

    // Only position camera on very first load when dialog opens with existing transform
    // NOT on subsequent clicks/repositions
    if (
      enableLocationEditing &&
      !hasAppliedInitialCamera.current &&
      isInitialLoad.current
    ) {
      positionCamera(viewerRef.current, Cesium, initialTransform);
      hasAppliedInitialCamera.current = true;
      isInitialLoad.current = false;
    }
  }, [
    initialTransform,
    enableLocationEditing,
    tilesetRef.current,
    cesiumRef.current,
  ]);

  // This component doesn't render anything - it just initializes the viewer
  return null;
}
