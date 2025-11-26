"use client";

/* eslint-disable no-console */
import { useRef, useEffect, useState } from "react";
import { ensureCesiumBaseUrl } from "../utils/cesium-config";
import { arrayToMatrix4, matrix4ToArray } from "../utils/tileset-transform";
import {
  loadTilesetWithTransform,
  reapplyTransformAfterReady,
  waitForTilesetReady,
  extractTransformFromMetadata,
  extractTransformFromTileset,
  positionCameraForTileset,
  type TilesetTransformData,
} from "../utils/tileset-operations";
import { CesiumLoadingScreen } from "./CesiumLoadingScreen";

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
  metadata?: Record<string, unknown> | null; // Model metadata (will extract transform from it)
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
 * Load a Cesium 3D Tileset with transform
 * Uses the shared utility function
 */
async function loadTileset(
  Cesium: any,
  cesiumAssetId: string,
  metadata?: Record<string, unknown> | null,
  initialTransform?: number[]
) {
  // Convert initialTransform array to TilesetTransformData if provided
  const transform: TilesetTransformData | undefined =
    initialTransform && initialTransform.length === 16
      ? { matrix: initialTransform }
      : undefined;

  return loadTilesetWithTransform(Cesium, cesiumAssetId, metadata, transform, {
    log: false,
  });
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
  metadata,
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
  const [isLoading, setIsLoading] = useState(true);

  // Main initialization effect
  useEffect(() => {
    if (!containerRef.current || viewerRef.current || isInitializing.current) {
      return;
    }

    isInitializing.current = true;
    setIsLoading(true);

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

        // Remove sun, moon, and other extra elements for clean preview
        if (viewer.scene.sun) {
          viewer.scene.sun.show = false;
        }
        if (viewer.scene.moon) {
          viewer.scene.moon.show = false;
        }
        if (viewer.scene.skyBox) {
          viewer.scene.skyBox.show = false;
        }
        if (viewer.scene.skyAtmosphere) {
          viewer.scene.skyAtmosphere.show = false;
        }
        // Disable fog for cleaner look
        viewer.scene.fog.enabled = false;
        // Set black background for clean preview
        viewer.scene.backgroundColor = Cesium.Color.BLACK;

        // Setup for location editing
        if (enableLocationEditing) {
          viewer.scene.globe.show = true;
          await setupImagery(viewer, Cesium);
          await setupTerrain(viewer, Cesium);
        } else {
          // For IMAGERY assets, show the imagery; for 3D models, hide it
          if (_assetType === "IMAGERY") {
            viewer.scene.globe.show = true;
          } else {
            viewer.scene.globe.show = false;
          }
        }

        // Notify viewer ready
        if (onViewerReady) {
          onViewerReady(viewer);
        }

        // Load asset based on type
        if (cesiumAssetId) {
          // Handle IMAGERY type assets differently - use IonImageryProvider
          if (_assetType === "IMAGERY") {
            try {
              // Use fromAssetId if available (async method that waits for provider to be ready)
              // This is the recommended way per Cesium documentation
              let imageryProvider;
              if (
                Cesium.IonImageryProvider &&
                typeof (Cesium.IonImageryProvider as any).fromAssetId ===
                  "function"
              ) {
                // Use async fromAssetId method - this waits for provider to be ready
                imageryProvider = await (
                  Cesium.IonImageryProvider as any
                ).fromAssetId(parseInt(cesiumAssetId));
              } else {
                // Fallback: use constructor and wait for readyPromise
                imageryProvider = new Cesium.IonImageryProvider({
                  assetId: parseInt(cesiumAssetId),
                } as any);

                // Wait for readyPromise if it exists
                if ((imageryProvider as any).readyPromise) {
                  await (imageryProvider as any).readyPromise;
                } else {
                  // Fallback: poll for tilingScheme to be available (up to 5 seconds)
                  let attempts = 0;
                  while (!imageryProvider.tilingScheme && attempts < 50) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    attempts++;
                  }
                }
              }

              // Verify tilingScheme is available before adding
              if (!imageryProvider.tilingScheme) {
                throw new Error(
                  "Imagery provider tilingScheme not initialized after waiting"
                );
              }

              // Add provider to viewer after it's ready
              viewer.imageryLayers.addImageryProvider(imageryProvider);

              console.log("[CesiumMinimalViewer] Imagery provider added:", {
                cesiumAssetId,
                hasTilingScheme: !!imageryProvider.tilingScheme,
              });

              // For imagery, notify viewer ready and position camera
              if (onViewerReady) {
                onViewerReady(viewer);
              }

              // Position camera to view the imagery
              if (enableLocationEditing) {
                positionCamera(viewer, Cesium, initialTransform);
              } else {
                // For preview mode with imagery, fly to a reasonable view of the globe
                // Default to a view that shows the imagery well
                viewer.camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000),
                  orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(-90), // Look straight down
                    roll: 0,
                  },
                });
              }
            } catch (err) {
              console.error(
                "[CesiumMinimalViewer] Failed to load imagery:",
                err
              );
              if (onError) {
                onError(
                  err instanceof Error
                    ? err
                    : new Error("Failed to load imagery asset")
                );
              }
            }
          } else {
            // Handle 3D Tiles and other types as tilesets
            const tileset = await loadTileset(
              Cesium,
              cesiumAssetId,
              metadata,
              initialTransform
            );
            tilesetRef.current = tileset;

            viewer.scene.primitives.add(tileset);

            // Wait for ready
            await waitForTilesetReady(tileset);
            console.log("[CesiumMinimalViewer] Tileset ready:", {
              cesiumAssetId,
              hasMetadata: !!metadata,
              metadataKeys: metadata ? Object.keys(metadata) : [],
              fullMetadata: metadata, // Log full metadata to see what's actually there
              metadataTransform: metadata?.transform
                ? {
                    type: typeof metadata.transform,
                    isObject: typeof metadata.transform === "object",
                    keys:
                      typeof metadata.transform === "object" &&
                      metadata.transform !== null
                        ? Object.keys(metadata.transform)
                        : [],
                    hasMatrix:
                      typeof metadata.transform === "object" &&
                      metadata.transform !== null &&
                      "matrix" in metadata.transform,
                    matrixType:
                      typeof metadata.transform === "object" &&
                      metadata.transform !== null &&
                      "matrix" in metadata.transform
                        ? typeof (metadata.transform as any).matrix
                        : null,
                    matrixIsArray:
                      typeof metadata.transform === "object" &&
                      metadata.transform !== null &&
                      "matrix" in metadata.transform
                        ? Array.isArray((metadata.transform as any).matrix)
                        : null,
                    fullTransform: metadata.transform, // Log full transform object
                  }
                : null,
              hasInitialTransform: !!initialTransform,
              enableLocationEditing,
            });

            // Extract transform from metadata or use initialTransform
            const transformFromMetadata =
              extractTransformFromMetadata(metadata);

            // If no transform from metadata but tileset has a modelMatrix, extract it from the tileset
            // This handles cases where transform was applied but not saved in metadata, or metadata doesn't include it
            let transformFromTileset: TilesetTransformData | undefined =
              undefined;
            if (
              !transformFromMetadata &&
              !initialTransform &&
              tileset.modelMatrix
            ) {
              try {
                const extracted = extractTransformFromTileset(Cesium, tileset);
                if (extracted) {
                  transformFromTileset = extracted;
                  console.log(
                    "[CesiumMinimalViewer] Extracted transform from tileset modelMatrix:",
                    {
                      hasMatrix: !!transformFromTileset.matrix,
                      matrixLength: transformFromTileset.matrix?.length,
                      longitude: transformFromTileset.longitude,
                      latitude: transformFromTileset.latitude,
                      height: transformFromTileset.height,
                    }
                  );
                }
              } catch (err) {
                console.warn(
                  "[CesiumMinimalViewer] Failed to extract transform from tileset:",
                  err
                );
              }
            }

            const transformToApply: TilesetTransformData | undefined =
              initialTransform && initialTransform.length === 16
                ? { matrix: initialTransform }
                : transformFromMetadata || transformFromTileset;

            console.log("[CesiumMinimalViewer] After extraction:", {
              transformFromMetadata,
              transformFromTileset,
              transformToApply,
              extractionResult: transformToApply
                ? {
                    hasMatrix: !!transformToApply.matrix,
                    matrixLength: transformToApply.matrix?.length,
                    hasLongitude: transformToApply.longitude !== undefined,
                    hasLatitude: transformToApply.latitude !== undefined,
                    hasHeight: transformToApply.height !== undefined,
                    source: transformFromMetadata
                      ? "metadata"
                      : transformFromTileset
                        ? "tileset"
                        : "initialTransform",
                  }
                : null,
            });

            console.log("[CesiumMinimalViewer] Transform extraction:", {
              hasTransformFromMetadata: !!transformFromMetadata,
              transformFromMetadata: transformFromMetadata
                ? {
                    hasMatrix: !!transformFromMetadata.matrix,
                    matrixLength: transformFromMetadata.matrix?.length,
                    hasLongitude: !!transformFromMetadata.longitude,
                    hasLatitude: !!transformFromMetadata.latitude,
                    hasHeight: !!transformFromMetadata.height,
                  }
                : null,
              hasInitialTransform: !!initialTransform,
              transformToApply: transformToApply
                ? {
                    hasMatrix: !!transformToApply.matrix,
                    matrixLength: transformToApply.matrix?.length,
                    hasLongitude: !!transformToApply.longitude,
                    hasLatitude: !!transformToApply.latitude,
                    hasHeight: !!transformToApply.height,
                    longitude: transformToApply.longitude,
                    latitude: transformToApply.latitude,
                    height: transformToApply.height,
                    matrixPreview: transformToApply.matrix
                      ?.slice(12, 15)
                      .map((v: number) => v.toFixed(2))
                      .join(", "),
                  }
                : null,
            });

            // Re-apply transform after ready (sometimes Cesium resets it)
            if (transformToApply) {
              console.log(
                "[CesiumMinimalViewer] Re-applying transform after tileset ready"
              );
              reapplyTransformAfterReady(Cesium, tileset, transformToApply, {
                viewer,
                log: true, // Enable logging in reapplyTransformAfterReady
              });
              console.log("[CesiumMinimalViewer] Transform re-applied:", {
                hasModelMatrix: !!tileset.modelMatrix,
                modelMatrixPreview: tileset.modelMatrix
                  ? [
                      tileset.modelMatrix[12],
                      tileset.modelMatrix[13],
                      tileset.modelMatrix[14],
                    ]
                      .map((v: number) => v.toFixed(2))
                      .join(", ")
                  : null,
              });

              // Force multiple renders to ensure bounding sphere is recalculated with transform
              // This is critical for transformed models to have correct camera positioning
              for (let i = 0; i < 3; i++) {
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
              console.log(
                "[CesiumMinimalViewer] Positioning camera for location editing"
              );
              positionCamera(viewer, Cesium, initialTransform);
            } else {
              console.log(
                "[CesiumMinimalViewer] Positioning camera for preview mode"
              );
              // Use Cesium's zoomTo which automatically handles transforms and bounding sphere
              // Wait longer for transformed models to ensure bounding sphere is recalculated
              const waitTime = transformToApply ? 800 : 500;
              setTimeout(() => {
                try {
                  console.log(
                    "[CesiumMinimalViewer] Attempting to zoom to tileset:",
                    {
                      hasTransform: !!transformToApply,
                      hasModelMatrix: !!tileset.modelMatrix,
                      boundingSphereBefore: tileset.boundingSphere
                        ? {
                            center: tileset.boundingSphere.center
                              ? [
                                  tileset.boundingSphere.center.x.toFixed(2),
                                  tileset.boundingSphere.center.y.toFixed(2),
                                  tileset.boundingSphere.center.z.toFixed(2),
                                ].join(", ")
                              : null,
                            radius: tileset.boundingSphere.radius?.toFixed(2),
                          }
                        : null,
                    }
                  );

                  // Use zoomTo - Cesium's standard way to view a tileset (respects modelMatrix)
                  // For models with transforms, ensure we use the transformed bounding sphere
                  // Use a standard pitch angle that works well for model inspection
                  const pitch = -0.5; // ~-28.6 degrees (looking down slightly)

                  // For transformed models, verify bounding sphere is correct
                  if (transformToApply && tileset.boundingSphere) {
                    console.log(
                      "[CesiumMinimalViewer] Transformed tileset bounding sphere:",
                      {
                        center: [
                          tileset.boundingSphere.center.x.toFixed(2),
                          tileset.boundingSphere.center.y.toFixed(2),
                          tileset.boundingSphere.center.z.toFixed(2),
                        ].join(", "),
                        radius: tileset.boundingSphere.radius?.toFixed(2),
                      }
                    );
                  }

                  viewer.zoomTo(
                    tileset,
                    new Cesium.HeadingPitchRange(0, pitch, 0)
                  );

                  // Wait a bit for zoomTo to complete and camera to stabilize before configuring controller
                  // This prevents errors when accessing camera properties that might not be initialized yet
                  setTimeout(() => {
                    try {
                      // Configure camera controller for model preview
                      // zoomTo already sets up proper orbiting around the tileset, so we don't need lookAt
                      const controller =
                        viewer.scene?.screenSpaceCameraController;
                      if (
                        controller &&
                        viewer.camera &&
                        !viewer.isDestroyed()
                      ) {
                        // Configure camera controller for model preview
                        // Set middle mouse button to rotate around the object (like CAD/3D modeling tools)
                        // Disable panning (translate) to keep model centered - users can rotate and zoom only
                        controller.enableRotate = true;
                        controller.enableTranslate = false; // Disable panning for screenshot preview
                        controller.enableZoom = true;
                        controller.enableTilt = true;

                        // Configure rotate events: both left and middle mouse button can rotate
                        // This makes it work like standard 3D modeling tools where middle mouse rotates
                        controller.rotateEventTypes = [
                          Cesium.CameraEventType.LEFT_DRAG,
                          Cesium.CameraEventType.MIDDLE_DRAG,
                        ];

                        // Adjust zoom sensitivity to prevent model from disappearing
                        controller.minimumZoomDistance = 1.0;
                        controller.maximumZoomDistance = 1000000.0;

                        // For transformed models, ensure camera rotates around the transformed bounding sphere
                        // This is handled automatically by zoomTo, but we can verify the setup
                        if (transformToApply && tileset.boundingSphere) {
                          console.log(
                            "[CesiumMinimalViewer] Transform applied, camera should orbit around transformed center"
                          );
                        }
                      }
                    } catch (controllerErr) {
                      console.warn(
                        "[CesiumMinimalViewer] Error configuring camera controller:",
                        controllerErr
                      );
                    }
                  }, 100);

                  console.log(
                    "[CesiumMinimalViewer] zoomTo called successfully"
                  );
                } catch (err) {
                  console.warn(
                    "[CesiumMinimalViewer] Error zooming to tileset:",
                    err
                  );
                  // Fallback: if zoomTo fails, try manual positioning from transform
                  if (transformToApply) {
                    console.log(
                      "[CesiumMinimalViewer] Falling back to manual camera positioning"
                    );
                    let transformWithCoords = transformToApply;
                    if (
                      !transformToApply.longitude ||
                      !transformToApply.latitude
                    ) {
                      // Extract position from matrix
                      const matrix = arrayToMatrix4(
                        Cesium,
                        transformToApply.matrix
                      );
                      const translation = new Cesium.Cartesian3(
                        matrix[12],
                        matrix[13],
                        matrix[14]
                      );
                      const cartographic =
                        Cesium.Cartographic.fromCartesian(translation);
                      transformWithCoords = {
                        ...transformToApply,
                        longitude: Cesium.Math.toDegrees(
                          cartographic.longitude
                        ),
                        latitude: Cesium.Math.toDegrees(cartographic.latitude),
                        height: cartographic.height,
                      };
                      console.log(
                        "[CesiumMinimalViewer] Extracted coordinates from matrix:",
                        {
                          longitude: transformWithCoords.longitude,
                          latitude: transformWithCoords.latitude,
                          height: transformWithCoords.height,
                        }
                      );
                    }
                    positionCameraForTileset(
                      viewer,
                      Cesium,
                      transformWithCoords,
                      {
                        offset: 200,
                        duration: 1.5,
                        pitch: -45,
                      }
                    );
                    console.log(
                      "[CesiumMinimalViewer] Manual camera positioning called"
                    );
                  } else {
                    // Last resort: try zoomTo without options
                    console.log(
                      "[CesiumMinimalViewer] Last resort: zoomTo without options"
                    );
                    viewer.zoomTo(tileset);
                  }
                }
              }, waitTime);
            }
          }
        }

        isInitializing.current = false;
        setIsLoading(false);
      } catch (error) {
        console.error("[CesiumMinimalViewer] Initialization error:", error);
        isInitializing.current = false;
        setIsLoading(false);
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

    // Verify the matrix round-trips correctly (for debugging, but not used)
    Cesium.Matrix4.toArray(matrix, new Array(16)).every(
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

  // Render loading screen while initializing
  return isLoading ? <CesiumLoadingScreen /> : null;
}
