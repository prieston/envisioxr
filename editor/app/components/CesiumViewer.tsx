"use client";

import { useEffect, useRef, useState } from "react";
import useWorldStore from "../hooks/useWorldStore";
import useSceneStore from "../hooks/useSceneStore";
import CesiumPerformanceOptimizer from "./CesiumPerformanceOptimizer";
import CesiumIonAssetsRenderer from "./CesiumIonAssetsRenderer";
import CesiumCameraCaptureHandler from "./Builder/CesiumCameraCaptureHandler";
import CesiumObservationPointHandler from "./Builder/CesiumObservationPointHandler";
import CesiumCameraSpringController from "./Builder/CesiumCameraSpringController";
import CesiumPreviewModeController from "./Builder/CesiumPreviewModeController";

// Extend Window interface for Cesium
declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}

// Set Cesium base URL immediately when module loads
if (typeof window !== "undefined") {
  window.CESIUM_BASE_URL = "/cesium/";
  console.log("[CesiumViewer] Set CESIUM_BASE_URL to:", window.CESIUM_BASE_URL);
}

// Utility function to apply basemap type
const applyBasemapType = async (
  viewer: any,
  Cesium: any,
  basemapType: "cesium" | "google" | "google-photorealistic" | "none"
) => {
  try {
    // Always remove existing imagery layers first
    viewer.imageryLayers.removeAll();

    // Remove only basemap-related primitives (Google Photorealistic tilesets)
    const primitives = viewer.scene.primitives;
    for (let i = primitives.length - 1; i >= 0; i--) {
      const primitive = primitives.get(i);
      if (
        primitive &&
        primitive.constructor &&
        primitive.constructor.name === "Cesium3DTileset"
      ) {
        if (primitive.assetId === 2275207) {
          primitives.remove(primitive);
        }
      }
    }

    switch (basemapType) {
      case "google": {
        try {
          // Add Google Satellite imagery
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
              credit: "© Google",
            })
          );
        } catch (error) {
          console.error("Error setting Google Satellite:", error);
        }
        break;
      }
      case "google-photorealistic": {
        const cesiumKey =
          process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
          process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (!cesiumKey) {
          console.warn(
            "Cesium Ion key not found. Falling back to OpenStreetMap."
          );
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              credit: "© OpenStreetMap contributors",
            })
          );
          return;
        }
        try {
          const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
          viewer.scene.primitives.add(tileset);
        } catch (error) {
          console.error("Error setting Google Photorealistic:", error);
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              credit: "© OpenStreetMap contributors",
            })
          );
        }
        break;
      }
      case "none": {
        // No imagery or primitives needed for "none"
        break;
      }
    }
  } catch (error) {
    console.error("Error applying basemap:", error);
  }
};

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const world = useWorldStore((s) => s.activeWorld);
  const setCesiumViewer = useSceneStore((s) => s.setCesiumViewer);
  const setCesiumInstance = useSceneStore((s) => s.setCesiumInstance);
  const viewerRef = useRef<any>(null);
  const cesiumRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add instance tracking
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const isInitializing = useRef(false);

  // React Strict Mode compatible cleanup
  const cleanupPrimitives = () => {
    if (viewerRef.current && cesiumRef.current) {
      try {
        // Clean up any primitives that may have been added
        viewerRef.current.entities.removeAll();
        viewerRef.current.scene.primitives.removeAll();
        console.log(
          `[CesiumViewer ${instanceId.current}] Cleaned up primitives`
        );
      } catch (error) {
        console.warn(
          `[CesiumViewer ${instanceId.current}] Error during cleanup:`,
          error
        );
      }
    }
  };

  useEffect(() => {
    console.log(`[CesiumViewer ${instanceId.current}] Initializing...`);

    if (!containerRef.current || viewerRef.current || isInitializing.current) {
      console.log(
        `[CesiumViewer ${instanceId.current}] Skipping initialization - container, viewer exists, or already initializing`
      );
      return;
    }

    isInitializing.current = true;

    const initializeCesium = async () => {
      try {
        console.log(
          `[CesiumViewer ${instanceId.current}] Starting Cesium initialization...`
        );
        setIsLoading(true);
        setError(null);

        // Dynamic import of Cesium with error handling
        let Cesium;
        try {
          Cesium = await import("cesium");
          cesiumRef.current = Cesium;
          setCesiumInstance(Cesium);
          console.log(
            `[CesiumViewer ${instanceId.current}] Cesium imported successfully`
          );
        } catch (importError) {
          console.error(
            `[CesiumViewer ${instanceId.current}] Failed to import Cesium:`,
            importError
          );
          throw new Error("Failed to load Cesium library");
        }

        // Verify CESIUM_BASE_URL is set
        if (!window.CESIUM_BASE_URL) {
          console.warn(
            `[CesiumViewer ${instanceId.current}] CESIUM_BASE_URL not set, using default`
          );
          window.CESIUM_BASE_URL = "/cesium/";
        }

        // Set Cesium Ion access token with validation (support both naming conventions)
        const ionToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
          process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (!ionToken) {
          console.warn(
            `[CesiumViewer ${instanceId.current}] No Cesium Ion token provided. Set NEXT_PUBLIC_CESIUM_ION_KEY or NEXT_PUBLIC_CESIUM_TOKEN`
          );
        }
        Cesium.Ion.defaultAccessToken = ionToken || "";
        console.log(
          `[CesiumViewer ${instanceId.current}] Cesium Ion token set:`,
          !!Cesium.Ion.defaultAccessToken
        );

        const { Viewer } = Cesium;
        console.log(
          `[CesiumViewer ${instanceId.current}] Creating Cesium Viewer...`
        );

        // Create viewer with optimized configuration
        viewerRef.current = new Viewer(containerRef.current, {
          // Disable all UI widgets and controls for better performance
          animation: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          scene3DOnly: true,
          // Performance optimizations
          requestRenderMode: true,
          maximumRenderTimeChange: Infinity,
          targetFrameRate: 60,
          // Add Cesium World Imagery as default basemap
          imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
          // Remove credits and attribution
          creditContainer: undefined,
          creditViewport: undefined,
        });

        console.log(
          `[CesiumViewer ${instanceId.current}] Cesium Viewer created successfully`
        );

        // Store viewer reference in the store
        setCesiumViewer(viewerRef.current);

        // Set initial skybox configuration based on store state
        const { skyboxType, basemapType } = useSceneStore.getState();
        if (skyboxType === "default") {
          // Show both skybox (with stars) and atmosphere
          if (viewerRef.current.scene.skyBox) {
            viewerRef.current.scene.skyBox.show = true;
          }
          if (viewerRef.current.scene.skyAtmosphere) {
            viewerRef.current.scene.skyAtmosphere.show = true;
          }
        } else if (skyboxType === "none") {
          // Hide both skybox and atmosphere
          if (viewerRef.current.scene.skyBox) {
            viewerRef.current.scene.skyBox.show = false;
          }
          if (viewerRef.current.scene.skyAtmosphere) {
            viewerRef.current.scene.skyAtmosphere.show = false;
          }
        }

        // Apply saved basemap type if it's not the default
        if (basemapType && basemapType !== "cesium") {
          console.log(
            `[CesiumViewer ${instanceId.current}] Applying saved basemap: ${basemapType}`
          );
          // Apply the basemap change using the same logic as the basemap selector
          applyBasemapType(viewerRef.current, Cesium, basemapType);
        }

        // Set terrain provider after viewer creation with error handling
        try {
          console.log(
            `[CesiumViewer ${instanceId.current}] Loading world terrain...`
          );
          const terrainProvider = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true,
          });
          viewerRef.current.terrainProvider = terrainProvider;
          console.log(
            `[CesiumViewer ${instanceId.current}] World terrain loaded successfully`
          );
        } catch (terrainError) {
          console.warn(
            `[CesiumViewer ${instanceId.current}] Failed to load world terrain:`,
            terrainError
          );
          // Continue without terrain - not critical
        }

        // Set up error handling for the viewer
        viewerRef.current.scene.globe.enableLighting = false;
        viewerRef.current.scene.debugShowFramesPerSecond = false;

        // Apply custom styling to ensure full size and hide credits
        const viewerElement = viewerRef.current.cesiumWidget.container;
        if (viewerElement) {
          // Make the viewer take full size
          viewerElement.style.width = "100%";
          viewerElement.style.height = "100%";

          // Hide credit elements
          const creditElements = viewerElement.querySelectorAll(
            ".cesium-viewer-bottom, .cesium-credit-text, .cesium-credit-logoContainer, .cesium-credit-expand-link"
          );
          creditElements.forEach((element: any) => {
            element.style.display = "none";
          });

          // Ensure canvas takes full size
          const canvas = viewerElement.querySelector("canvas");
          if (canvas) {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.right = "0";
            canvas.style.bottom = "0";
          }
        }

        setIsLoading(false);
        console.log(
          `[CesiumViewer ${instanceId.current}] Initialization complete`
        );
      } catch (err) {
        console.error(
          `[CesiumViewer ${instanceId.current}] Failed to initialize Cesium:`,
          err
        );
        setError(
          err instanceof Error ? err.message : "Failed to initialize Cesium"
        );
        setIsLoading(false);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeCesium();

    return () => {
      console.log(`[CesiumViewer ${instanceId.current}] Cleaning up...`);
      cleanupPrimitives();
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (cleanupError) {
          console.warn(
            `[CesiumViewer ${instanceId.current}] Error during cleanup:`,
            cleanupError
          );
        }
      }
    };
  }, []);

  // Get objects from scene store
  const objects = useSceneStore((state) => state.objects);

  // Render entities whenever world data or scene objects change
  useEffect(() => {
    const viewer = viewerRef.current;
    const Cesium = cesiumRef.current;
    if (!viewer || !Cesium || isLoading) return;

    try {
      console.log(`[CesiumViewer ${instanceId.current}] Rendering entities...`);
      console.log(
        `[CesiumViewer ${instanceId.current}] Objects count: ${objects.length}`
      );
      if (objects.length > 0) {
        console.log(`[CesiumViewer ${instanceId.current}] Objects:`, objects);
      }
      viewer.entities.removeAll();

      // Add test data if no objects exist
      if (objects.length === 0) {
        console.log(
          `[CesiumViewer ${instanceId.current}] Adding test entities...`
        );

        // Add a test point at a known location (New York City)
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(-74.006, 40.7128, 100),
          point: {
            pixelSize: 15,
            color: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: "Test Point - NYC",
            font: "14pt sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -40),
          },
        });

        // Add another test point (London)
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(-0.1276, 51.5074, 100),
          point: {
            pixelSize: 15,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: "Test Point - London",
            font: "14pt sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -40),
          },
        });
      } else {
        // Render actual objects from world data
        objects.forEach((obj) => {
          const [x = 0, y = 0, z = 0] = obj.position || [];

          if (process.env.NODE_ENV === "development") {
            console.log(
              `[CesiumViewer] 🔍 Processing object: ${obj.name || "unnamed"}`
            );
            console.log(`[CesiumViewer]   Position: [${x}, ${y}, ${z}]`);
            console.log(`[CesiumViewer]   URL: ${obj.url || "none"}`);
            console.log(`[CesiumViewer]   Type: ${obj.type || "none"}`);
            console.log(`[CesiumViewer]   Has position: ${!!obj.position}`);
            console.log(
              `[CesiumViewer]   Position length: ${obj.position?.length || 0}`
            );
          }

          // Skip objects without positions
          if (!obj.position || obj.position.length !== 3) {
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[CesiumViewer] Skipping object ${obj.name} - no valid position`
              );
            }
            return;
          }

          // Determine if these are geographic coordinates (Cesium) or local coordinates (Three.js)
          // Geographic coordinates typically have longitude between -180 and 180, latitude between -90 and 90
          const isGeographic = x >= -180 && x <= 180 && y >= -90 && y <= 90;

          let longitude, latitude, height;

          if (isGeographic) {
            // These are already geographic coordinates (from Cesium placement)
            longitude = x;
            latitude = y;
            height = z;
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[CesiumViewer] Using geographic coordinates: ${longitude}, ${latitude}, ${height}`
              );
            }
          } else {
            // These are local coordinates (from Three.js placement) - convert to geographic
            longitude = x / (111320 * Math.cos((35 * Math.PI) / 180));
            latitude = y / 110540;
            height = z;
            if (process.env.NODE_ENV === "development") {
              console.log(
                `[CesiumViewer] Converted local to geographic: ${x},${y},${z} -> ${longitude}, ${latitude}, ${height}`
              );
            }
          }

          // Check if this is a 3D model file (not tiles)
          const isModelFile =
            obj.url &&
            obj.type &&
            (obj.type.includes("gltf") ||
              obj.type.includes("glb") ||
              obj.type.includes("obj") ||
              obj.type.includes("fbx") ||
              obj.type.includes("dae") ||
              obj.url.toLowerCase().includes(".gltf") ||
              obj.url.toLowerCase().includes(".glb") ||
              obj.url.toLowerCase().includes(".obj") ||
              obj.url.toLowerCase().includes(".fbx") ||
              obj.url.toLowerCase().includes(".dae"));

          if (isModelFile) {
            // Render 3D models
            if (process.env.NODE_ENV === "development") {
              console.log(`[CesiumViewer] === MODEL LOADING DEBUG ===`);
              console.log(`[CesiumViewer] Model name: ${obj.name}`);
              console.log(`[CesiumViewer] Model URL: ${obj.url}`);
              console.log(`[CesiumViewer] Model type: ${obj.type}`);
              console.log(`[CesiumViewer] Model scale: ${obj.scale}`);
              console.log(
                `[CesiumViewer] Model position: [${longitude}, ${latitude}, ${height}]`
              );
              console.log(
                `[CesiumViewer] Is geographic coordinates: ${isGeographic}`
              );
              console.log(`[CesiumViewer] ================================`);
            }

            try {
              const entity = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                  longitude,
                  latitude,
                  height
                ),
                model: {
                  uri: obj.url,
                  scale: obj.scale ? obj.scale[0] : 1.0, // Use original scale or default to 1.0
                  // Add proper orientation to prevent upside-down models
                  heading: 0.0,
                  pitch: 0.0,
                  roll: 0.0,
                  // Use absolute height for precise positioning
                  // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
                label: {
                  text: obj.name || "Model",
                  font: "12pt sans-serif",
                  fillColor: Cesium.Color.WHITE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  pixelOffset: new Cesium.Cartesian2(0, -30),
                },
              });

              if (process.env.NODE_ENV === "development") {
                console.log(`[CesiumViewer] ✅ SUCCESS: Model entity created`);
                console.log(`[CesiumViewer] Entity ID: ${entity.id}`);
                console.log(
                  `[CesiumViewer] Entity position: ${entity.position?.getValue()}`
                );
                console.log(
                  `[CesiumViewer] Entity model URI: ${entity.model?.uri?.getValue()}`
                );
                console.log(
                  `[CesiumViewer] Expected position: [${longitude}, ${latitude}, ${height}]`
                );
              }
            } catch (error) {
              console.error(
                `[CesiumViewer] ❌ FAILED to load model ${obj.name}:`,
                error
              );
              console.error(`[CesiumViewer] Error details:`, {
                name: obj.name,
                url: obj.url,
                type: obj.type,
                position: [longitude, latitude, height],
                error: error.message,
                stack: error.stack,
              });
              // Fallback to point if model loading fails
              viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                  longitude,
                  latitude,
                  height
                ),
                point: {
                  pixelSize: 10,
                  color: Cesium.Color.RED,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 2,
                },
                label: {
                  text: obj.name || "Object",
                  font: "12pt sans-serif",
                  fillColor: Cesium.Color.WHITE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  pixelOffset: new Cesium.Cartesian2(0, -30),
                },
              });
            }
          } else {
            // Place simple points for objects without models
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                height
              ),
              point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
              },
              label: {
                text: obj.name || "Object",
                font: "12pt sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -30),
              },
            });
          }
        });
      }
      const totalEntities = objects.length === 0 ? 2 : objects.length;
      console.log(
        `[CesiumViewer ${instanceId.current}] Rendered ${totalEntities} entities`
      );
    } catch (err) {
      console.error(
        `[CesiumViewer ${instanceId.current}] Error rendering entities:`,
        err
      );
    }
  }, [world, isLoading, objects]);

  // Effect to ensure styling is applied after viewer is ready
  useEffect(() => {
    if (viewerRef.current && !isLoading) {
      const applyStyling = () => {
        const viewerElement = viewerRef.current.cesiumWidget.container;
        if (viewerElement) {
          // Make the viewer take full size
          viewerElement.style.width = "100%";
          viewerElement.style.height = "100%";

          // Hide credit elements
          const creditElements = viewerElement.querySelectorAll(
            ".cesium-viewer-bottom, .cesium-credit-text, .cesium-credit-logoContainer, .cesium-credit-expand-link"
          );
          creditElements.forEach((element: any) => {
            element.style.display = "none";
          });

          // Ensure canvas takes full size
          const canvas = viewerElement.querySelector("canvas");
          if (canvas) {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.right = "0";
            canvas.style.bottom = "0";
          }
        }
      };

      // Apply styling immediately
      applyStyling();

      // Also apply after a short delay to catch any dynamic elements
      const timeoutId = setTimeout(applyStyling, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load Cesium</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <p className="text-red-400 text-xs mt-1">
            Instance: {instanceId.current}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
        ref={containerRef}
        className={isLoading ? "opacity-50" : ""}
      />
      {viewerRef.current && (
        <>
          <CesiumPerformanceOptimizer viewer={viewerRef.current} />
          <CesiumIonAssetsRenderer />
          <CesiumCameraCaptureHandler />
          <CesiumObservationPointHandler />
          <CesiumCameraSpringController />
          <CesiumPreviewModeController />
        </>
      )}
    </>
  );
}
