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
import CesiumIonSDKViewshedAnalysis from "./Builder/CesiumIonSDKViewshedAnalysis";
import ObjectTransformEditor from "./Builder/ObjectTransformEditor";
import IonSDKDemo from "./Builder/IonSDKDemo";

// Extend Window interface for Cesium
declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}

// Set Cesium base URL immediately when module loads
if (typeof window !== "undefined") {
  window.CESIUM_BASE_URL = "/cesium/";
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

    // Remove only basemap-related Cesium3DTileset primitives (Google Photorealistic)
    // Preserve custom Cesium Ion assets
    const primitives = viewer.scene.primitives;
    for (let i = primitives.length - 1; i >= 0; i--) {
      const primitive = primitives.get(i);
      if (primitive && primitive.assetId === 2275207) {
        // Only remove Google Photorealistic tileset (assetId 2275207)
        // This is the only basemap-related tileset we manage
        primitives.remove(primitive);
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
          // Error setting Google Satellite
        }
        break;
      }
      case "google-photorealistic": {
        const cesiumKey =
          process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
          process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (!cesiumKey) {
          // Cesium Ion key not found. Falling back to OpenStreetMap.
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              credit: "© OpenStreetMap contributors",
            })
          );
          return;
        }
        try {
          // Add Google Satellite imagery as the base layer for Google Photorealistic
          // This prevents the blue "no imagery" background from showing
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
              credit: "© Google",
            })
          );

          // Add Google Photorealistic 3D tiles on top
          const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
          // Set the assetId property for easy identification
          tileset.assetId = 2275207;
          viewer.scene.primitives.add(tileset);
        } catch (error) {
          // Error setting Google Photorealistic
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
    // Error applying basemap
  }
};

export default function CesiumViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const world = useWorldStore((s) => s.activeWorld);
  const setCesiumViewer = useSceneStore((s) => s.setCesiumViewer);
  const setCesiumInstance = useSceneStore((s) => s.setCesiumInstance);
  const selectedObject = useSceneStore((s) => s.selectedObject);
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
      } catch (error) {
        // Error during cleanup
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current || viewerRef.current || isInitializing.current) {
      // Skipping initialization - container, viewer exists, or already initializing
      return;
    }

    isInitializing.current = true;

    const initializeCesium = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import of Cesium with error handling
        let Cesium;
        try {
          Cesium = await import("cesium");
          cesiumRef.current = Cesium;
          setCesiumInstance(Cesium);

          // Make Cesium available globally for Ion SDK
          (window as any).Cesium = Cesium;
          // Cesium made available globally for Ion SDK
        } catch (importError) {
          // Failed to import Cesium
          throw new Error("Failed to load Cesium library");
        }

        // Verify CESIUM_BASE_URL is set
        if (!window.CESIUM_BASE_URL) {
          // CESIUM_BASE_URL not set, using default
          window.CESIUM_BASE_URL = "/cesium/";
        }

        // Set Cesium Ion access token with validation (support both naming conventions)
        const ionToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
          process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (!ionToken) {
          // No Cesium Ion token provided. Set NEXT_PUBLIC_CESIUM_ION_KEY or NEXT_PUBLIC_CESIUM_TOKEN
        }
        Cesium.Ion.defaultAccessToken = ionToken || "";

        const { Viewer } = Cesium;

        // Ensure container has proper dimensions before Cesium initialization
        if (containerRef.current) {
          const container = containerRef.current;
          const rect = container.getBoundingClientRect();

          // Set explicit dimensions to prevent 300x300 default
          if (rect.width > 0 && rect.height > 0) {
            container.style.width = `${rect.width}px`;
            container.style.height = `${rect.height}px`;
          } else {
            // Fallback to 100% if dimensions not available
            container.style.width = "100%";
            container.style.height = "100%";
          }
        }

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
          // Apply the basemap change using the same logic as the basemap selector
          applyBasemapType(viewerRef.current, Cesium, basemapType);
        }

        // Set terrain provider after viewer creation with error handling
        try {
          const terrainProvider = await Cesium.createWorldTerrainAsync({
            requestWaterMask: true,
            requestVertexNormals: true,
          });
          viewerRef.current.terrainProvider = terrainProvider;
        } catch (terrainError) {
          // Failed to load world terrain - not critical
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
      } catch (err) {
        // Failed to initialize Cesium
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
      cleanupPrimitives();
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
        } catch (cleanupError) {
          // Error during cleanup
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
      // Track model entity ids we want to keep this render
      const keepModelEntityIds = new Set<string>();

      if (objects.length > 0) {
        // Render actual objects from world data
        objects.forEach((obj) => {
          const [x = 0, y = 0, z = 0] = obj.position || [];

          // Skip objects without positions
          if (!obj.position || obj.position.length !== 3) {
            return;
          }

          // Determine if these are geographic coordinates (Cesium) or local coordinates (Three.js)
          // Use coordinate system metadata if available, otherwise detect based on values
          const isGeographic =
            obj.coordinateSystem === "geographic" ||
            (x >= -180 &&
              x <= 180 &&
              y >= -90 &&
              y <= 90 &&
              Math.abs(z) < 50000); // Height should be reasonable for geographic coordinates

          let longitude, latitude, height;

          if (isGeographic) {
            // These are already geographic coordinates (from Cesium placement)
            longitude = x;
            latitude = y;
            height = z;
          } else {
            // These are local coordinates (from Three.js placement) - convert to geographic
            // Use a more accurate conversion method
            const earthRadius = 6378137.0; // Earth's radius in meters
            const referenceLat = 35.6586; // Default reference latitude (Tokyo)
            const referenceLon = 139.7454; // Default reference longitude (Tokyo)

            // Convert local coordinates to geographic offsets
            const latOffset = (x / earthRadius) * (180 / Math.PI);
            const lonOffset =
              (z / (earthRadius * Math.cos((referenceLat * Math.PI) / 180))) *
              (180 / Math.PI);

            longitude = referenceLon + lonOffset;
            latitude = referenceLat + latOffset;
            height = z; // Use z directly as height
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
            try {
              // Get rotation values from the object
              const [heading = 0, pitch = 0, roll = 0] = obj.rotation || [
                0, 0, 0,
              ];

              // Get scale values from the object
              const [scaleX = 1, scaleY = 1, scaleZ = 1] = obj.scale || [
                1, 1, 1,
              ];
              const uniformScale = Math.max(scaleX, scaleY, scaleZ); // Use max for uniform scaling

              // Compute entity position and orientation (rotation is in radians)
              const entityPosition = Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                height
              );
              const orientation = Cesium.Transforms.headingPitchRollQuaternion(
                entityPosition,
                new Cesium.HeadingPitchRoll(heading, pitch, roll),
                Cesium.Ellipsoid.WGS84
              );

              const entityId = `model-${obj.id}`;
              keepModelEntityIds.add(entityId);

              // Create or update entity
              let entity = viewer.entities.getById(entityId);
              if (!entity) {
                entity = viewer.entities.add({
                  id: entityId,
                  position: entityPosition,
                  orientation,
                  model: {
                    uri: obj.url,
                    scale: uniformScale,
                    distanceDisplayCondition:
                      new Cesium.DistanceDisplayCondition(
                        0.0,
                        Number.MAX_VALUE
                      ),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
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
              } else {
                // Update existing entity properties
                entity.position = entityPosition;
                entity.orientation = orientation;
                if (entity.model) {
                  entity.model.uri = obj.url;
                  (entity.model as any).scale = uniformScale;
                  (entity.model as any).disableDepthTestDistance =
                    Number.POSITIVE_INFINITY;
                }
                // Force a redraw when updating an existing entity
                viewer.scene.requestRender();
              }
            } catch (error) {
              // Failed to load model - falling back to point
              // Fallback to point if model loading fails
              const entityId = `model-${obj.id}`;
              keepModelEntityIds.add(entityId);
              const entity = viewer.entities.getById(entityId);
              const pos = Cesium.Cartesian3.fromDegrees(
                longitude,
                latitude,
                height
              );
              if (!entity) {
                viewer.entities.add({
                  id: entityId,
                  position: pos,
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
              } else {
                entity.position = pos;
                viewer.scene.requestRender();
              }
            }
          } else {
            // Place simple points for objects without models
            const entityId = `model-${obj.id}`;
            keepModelEntityIds.add(entityId);
            const entity = viewer.entities.getById(entityId);
            const pos = Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            );
            if (!entity) {
              viewer.entities.add({
                id: entityId,
                position: pos,
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
            } else {
              entity.position = pos;
              viewer.scene.requestRender();
            }
          }
        });
      }

      // Remove any leftover model entities that are not in keep set
      const toRemove: any[] = [];
      viewer.entities.values.forEach((e: any) => {
        if (
          typeof e.id === "string" &&
          e.id.startsWith("model-") &&
          !keepModelEntityIds.has(e.id)
        ) {
          toRemove.push(e);
        }
      });
      toRemove.forEach((e) => viewer.entities.remove(e));
      if (toRemove.length > 0) {
        viewer.scene.requestRender();
      }
    } catch (err) {
      // Error rendering entities
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

          // Force Cesium to resize immediately to prevent the 300x300 flash
          if (viewerRef.current.cesiumWidget) {
            viewerRef.current.cesiumWidget.resize();
          }
        }
      };

      // Apply styling immediately
      applyStyling();

      // Also apply after a short delay to catch any dynamic elements
      const timeoutId = setTimeout(applyStyling, 100);

      // Set up ResizeObserver to handle container size changes
      let resizeObserver: ResizeObserver | null = null;
      if (containerRef.current && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          if (viewerRef.current?.cesiumWidget) {
            viewerRef.current.cesiumWidget.resize();
          }
        });
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        clearTimeout(timeoutId);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
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
          minWidth: "100%",
          minHeight: "100%",
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
          {/* Ion SDK Demo - uncomment to test */}
          <IonSDKDemo />
          {/* Render professional Ion SDK viewshed analysis for observation models */}
          {objects
            .filter(
              (obj) => obj.isObservationModel && obj.observationProperties
            )
            .map((obj) => {
              const [longitude, latitude, height] = obj.position || [0, 0, 0];
              const [heading, pitch, roll] = obj.rotation || [0, 0, 0];

              // Professional observation properties with Ion SDK defaults
              const observationProps = {
                sensorType: obj.observationProperties?.sensorType || "cone",
                fov: obj.observationProperties?.fov || 60,
                fovH: obj.observationProperties?.fovH,
                fovV: obj.observationProperties?.fovV,
                maxPolar: obj.observationProperties?.maxPolar,
                visibilityRadius:
                  obj.observationProperties?.visibilityRadius || 500,
                showSensorGeometry:
                  obj.observationProperties?.showSensorGeometry ?? true,
                showViewshed: obj.observationProperties?.showViewshed || false,
                sensorColor:
                  obj.observationProperties?.sensorColor || "#00ff00",
                viewshedColor:
                  obj.observationProperties?.viewshedColor || "#0080ff",
                analysisQuality:
                  obj.observationProperties?.analysisQuality || "medium",
                // Transform editor properties removed
              };

              // Always use Ion SDK for professional sensor visualization
              return (
                <CesiumIonSDKViewshedAnalysis
                  key={`ion-viewshed-${obj.id}`}
                  position={[longitude, latitude, height]}
                  rotation={[heading, pitch, roll]}
                  observationProperties={observationProps}
                  objectId={obj.id}
                />
              );
            })}

          {/* Object Transform Editor - works for any selected object */}
          {selectedObject && (
            <ObjectTransformEditor selectedObject={selectedObject} />
          )}
        </>
      )}
    </>
  );
}
