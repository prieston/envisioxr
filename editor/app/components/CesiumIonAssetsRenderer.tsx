"use client";

import React, { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { TilesRenderer } from "3d-tiles-renderer";
import {
  CesiumIonAuthPlugin,
  TilesFadePlugin,
  TileCompressionPlugin,
  GLTFExtensionsPlugin,
} from "3d-tiles-renderer/plugins";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Sphere as ThreeSphere, Vector3, Object3D } from "three";
import useSceneStore from "../hooks/useSceneStore";

// Extend TilesRenderer type to include setLatLonToYUp
declare module "3d-tiles-renderer" {
  interface TilesRenderer {
    setLatLonToYUp(latitude: number, longitude: number): void;
  }
}

interface AssetStatus {
  id: string;
  loading: boolean;
  error: string | null;
  status: string;
  requestsMade: number;
}

// Wrapper to add TilesRenderer.group into scene
class TilesRendererWrapper extends Object3D {
  tilesRenderer: TilesRenderer;

  constructor(tilesRenderer: TilesRenderer) {
    super();
    this.tilesRenderer = tilesRenderer;
    if (tilesRenderer.group) this.add(tilesRenderer.group);
  }

  update() {
    this.tilesRenderer.update();
  }

  dispose() {
    this.tilesRenderer.dispose();
  }
}

const CesiumIonAssetsRenderer: React.FC = () => {
  const { camera, gl, scene } = useThree();
  const wrapperRefs = useRef<Map<string, TilesRendererWrapper>>(new Map());
  const [assetStatuses, setAssetStatuses] = useState<AssetStatus[]>([]);
  const cesiumIonAssets = useSceneStore((state) => state.cesiumIonAssets);
  const selectedLocation = useSceneStore((state) => state.selectedLocation);

  // Configure camera settings like the working TilesComponent
  useEffect(() => {
    // Set camera far plane to a much larger value like the working version
    camera.far = 10000000; // 10,000km like TilesComponent
    camera.updateProjectionMatrix();
  }, [camera]);

  // Animate / update tiles each frame like the working TilesComponent
  useFrame(() => {
    wrapperRefs.current.forEach((wrapper) => {
      wrapper.update();
    });
  });

  // Clean up tiles renderers when component unmounts or assets change
  useEffect(() => {
    return () => {
      wrapperRefs.current.forEach((wrapper) => {
        wrapper.dispose();
      });
      wrapperRefs.current.clear();
    };
  }, []);

  // Initialize assets when they change
  useEffect(() => {
    // Clear existing assets
    wrapperRefs.current.forEach((wrapper) => {
      wrapper.dispose();
    });
    wrapperRefs.current.clear();
    setAssetStatuses([]);

    // Initialize new assets
    cesiumIonAssets.forEach((asset) => {
      initializeAsset(asset);
    });
  }, [cesiumIonAssets]);

  const initializeAsset = async (asset: any) => {
    setAssetStatuses((prev) => [
      ...prev,
      {
        id: asset.id,
        loading: true,
        error: null,
        status: "Initializing...",
        requestsMade: 0,
      },
    ]);

    try {
      console.log(
        "[CesiumIon] Initializing asset",
        asset.assetId,
        "with key",
        asset.apiKey
      );

      // Create tiles renderer like the working TilesComponent
      const tilesRenderer = new TilesRenderer();

      // Register plugins like the working TilesComponent
      tilesRenderer.registerPlugin(
        new CesiumIonAuthPlugin({
          apiToken: asset.apiKey,
          assetId: asset.assetId,
          autoRefreshToken: true,
        })
      );
      tilesRenderer.registerPlugin(new TileCompressionPlugin());
      tilesRenderer.registerPlugin(new TilesFadePlugin());
      tilesRenderer.registerPlugin(
        new GLTFExtensionsPlugin({
          dracoLoader: new DRACOLoader().setDecoderPath(
            "https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/"
          ),
        })
      );

      // Set the location to the provided coordinates (for this asset)
      tilesRenderer.setLatLonToYUp(
        (40.0941493188 * Math.PI) / 180, // Provided latitude
        (22.5559423623 * Math.PI) / 180 // Provided longitude
      );

      // Configure the renderer like the working TilesComponent
      tilesRenderer.setCamera(camera);
      tilesRenderer.setResolutionFromRenderer(camera, gl);
      tilesRenderer.errorTarget = 32; // Same as working TilesComponent
      tilesRenderer.displayActiveTiles = true; // Same as working TilesComponent

      // Create wrapper and add to scene like the working TilesComponent
      const wrapper = new TilesRendererWrapper(tilesRenderer);
      wrapper.userData = { assetId: asset.id }; // Store asset ID for fly-to functionality
      scene.add(wrapper);
      wrapperRefs.current.set(asset.id, wrapper);

      // Set up event listeners
      tilesRenderer.addEventListener("load-tile-set", () => {
        console.log(
          "[CesiumIon] load-tile-set event fired for asset",
          asset.assetId
        );

        // Debug: Check tileset data
        console.log("[CesiumIon] Tileset data:", tilesRenderer.rootTileSet);
        console.log(
          "[CesiumIon] Root tile:",
          (tilesRenderer.rootTileSet as any)?.root
        );
        console.log("[CesiumIon] Asset coordinates:", {
          lat: selectedLocation?.latitude,
          lon: selectedLocation?.longitude,
        });

        // Auto-center camera like the working approach
        const sphere = new ThreeSphere();
        if (tilesRenderer.getBoundingSphere(sphere)) {
          // Position camera closer to the asset for better visibility
          camera.position
            .copy(sphere.center)
            .add(new Vector3(0, 0, sphere.radius * 5)); // Closer view (5x radius instead of 20x)
          camera.lookAt(sphere.center);
          camera.updateProjectionMatrix();
          console.log(
            "[CesiumIon] Camera auto-centered on asset:",
            camera.position,
            sphere
          );
          console.log("[CesiumIon] Asset center:", sphere.center);
        }
      });

      tilesRenderer.addEventListener("load", () => {
        setAssetStatuses((prev) =>
          prev.map((status) =>
            status.id === asset.id
              ? {
                  ...status,
                  loading: false,
                  status: "Tiles loaded successfully",
                }
              : status
          )
        );
        console.log("[CesiumIon] load event fired for asset", asset.assetId);

        // Debug: Check if tiles are active
        setTimeout(() => {
          console.log(
            "[CesiumIon] After load - Active tiles:",
            (tilesRenderer as any).activeTiles?.size || 0
          );
          console.log(
            "[CesiumIon] After load - Visible tiles:",
            (tilesRenderer as any).visibleTiles?.size || 0
          );
        }, 1000);
      });

      tilesRenderer.addEventListener("error", (event) => {
        setAssetStatuses((prev) =>
          prev.map((status) =>
            status.id === asset.id
              ? {
                  ...status,
                  loading: false,
                  error: `Error loading tiles: ${(event as any).message || "Unknown error"}`,
                  status: "Error loading tiles",
                }
              : status
          )
        );
        console.error(
          "[CesiumIon] Error loading tiles for asset",
          asset.assetId,
          event
        );
      });

      tilesRenderer.addEventListener("tileLoad", () => {
        setAssetStatuses((prev) =>
          prev.map((status) =>
            status.id === asset.id
              ? {
                  ...status,
                  requestsMade: status.requestsMade + 1,
                  status: `Loading tiles (${status.requestsMade + 1} requests)...`,
                }
              : status
          )
        );
        console.log("[CesiumIon] tileLoad event for asset", asset.assetId);
      });

      // Add more detailed tile loading events
      tilesRenderer.addEventListener("tileLoadStart", (event) => {
        console.log(
          "[CesiumIon] tileLoadStart for asset",
          asset.assetId,
          event
        );
      });

      tilesRenderer.addEventListener("tileLoadEnd", (event) => {
        console.log("[CesiumIon] tileLoadEnd for asset", asset.assetId, event);
      });

      tilesRenderer.addEventListener("tileLoadError", (event) => {
        console.error(
          "[CesiumIon] tileLoadError for asset",
          asset.assetId,
          event
        );
      });

      // Initial update like the working TilesComponent
      tilesRenderer.update();
      console.log("[CesiumIon] Initialized asset", asset.assetId);
    } catch (error: any) {
      console.error(
        "[CesiumIon] Error initializing asset",
        asset.assetId,
        error
      );
      setAssetStatuses((prev) =>
        prev.map((status) =>
          status.id === asset.id
            ? {
                ...status,
                loading: false,
                error: `Error initializing: ${error.message || "Unknown error"}`,
                status: "Error initializing",
              }
            : status
        )
      );
    }
  };

  const enabledAssets = cesiumIonAssets.filter((asset) => asset.enabled);

  if (enabledAssets.length === 0) {
    return null;
  }

  return (
    <>
      {/* Visual indicators for asset locations */}
      {cesiumIonAssets.map((asset) => {
        const status = assetStatuses.find((s) => s.id === asset.id);
        if (!status || status.loading) return null;

        // Calculate approximate position based on selected location coordinates
        // This is a rough approximation - the actual position will be set by the tiles renderer
        const lat = selectedLocation?.latitude || 40.7128;
        const lon = selectedLocation?.longitude || -74.006;
        const earthRadius = 6371000; // Earth radius in meters
        const x = ((lon + 74.006) * earthRadius * Math.PI) / 180; // Approximate X offset from NYC
        const z = ((lat - 40.7128) * earthRadius * Math.PI) / 180; // Approximate Z offset from NYC

        return (
          <Sphere
            key={`indicator-${asset.id}`}
            args={[100, 16, 16]}
            position={[x, 0, z]}
          >
            <meshStandardMaterial color="red" opacity={0.7} transparent />
          </Sphere>
        );
      })}

      {/* Earth representation like the working TilesComponent */}
      <Sphere args={[6371000, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="royalblue" opacity={0.1} transparent />
      </Sphere>

      {/* Light sources */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
    </>
  );
};

export default CesiumIonAssetsRenderer;
