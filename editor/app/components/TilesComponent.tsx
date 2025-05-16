"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

// Import TilesRenderer
import { TilesRenderer } from "3d-tiles-renderer";
import {
  CesiumIonAuthPlugin,
  TilesFadePlugin,
  TileCompressionPlugin,
  GLTFExtensionsPlugin,
} from "3d-tiles-renderer/plugins";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MathUtils } from "three";
// Define props type
interface TilesComponentProps {
  apiKey: string;
  assetId?: string;
  latitude?: number;
  longitude?: number;
}

// Create a wrapper for TilesRenderer that extends Object3D
class TilesRendererWrapper extends THREE.Object3D {
  tilesRenderer: TilesRenderer;

  constructor(tilesRenderer: TilesRenderer) {
    super();
    this.tilesRenderer = tilesRenderer;

    // Add the tiles renderer's group to this object
    if (tilesRenderer.group) {
      this.add(tilesRenderer.group);
    }
  }

  update() {
    if (this.tilesRenderer) {
      this.tilesRenderer.update();
    }
  }

  dispose() {
    if (this.tilesRenderer) {
      this.tilesRenderer.dispose();
    }
  }
}

const TilesComponent: React.FC<TilesComponentProps> = ({
  apiKey,
  assetId = "2275207", // Default to Tokyo Tower if no assetId provided
  latitude = 35.6586, // Default to Tokyo Tower coordinates
  longitude = 139.7454,
}) => {
  const { camera, gl, scene } = useThree();
  const tilesRendererRef = useRef<TilesRenderer | null>(null);
  const wrapperRef = useRef<TilesRendererWrapper | null>(null);
  const [authError, setAuthError] = useState(false);

  // Update the tiles renderer on each frame
  useFrame(() => {
    if (wrapperRef.current) {
      wrapperRef.current.update();
    }
  });

  const initializeTilesRenderer = useCallback(() => {
    try {
      // Validate required parameters
      if (!apiKey) {
        throw new Error("Cesium Ion API key is required");
      }
      if (!assetId) {
        throw new Error("Asset ID is required");
      }

      // Create the tiles renderer without initial URL
      const tilesRenderer = new TilesRenderer();

      // Register plugins
      const authPlugin = new CesiumIonAuthPlugin({
        apiToken: apiKey,
        assetId: assetId,
        autoRefreshToken: true,
      });

      // Verify the auth plugin is properly initialized
      if (!authPlugin) {
        throw new Error("Failed to initialize Cesium Ion Auth Plugin");
      }

      tilesRenderer.registerPlugin(authPlugin);
      tilesRenderer.registerPlugin(new TileCompressionPlugin());
      tilesRenderer.registerPlugin(new TilesFadePlugin());
      tilesRenderer.registerPlugin(
        new GLTFExtensionsPlugin({
          dracoLoader: new DRACOLoader().setDecoderPath(
            "https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/"
          ),
        })
      );

      // Set the location to the provided coordinates
      tilesRenderer.setLatLonToYUp(
        latitude * MathUtils.DEG2RAD,
        longitude * MathUtils.DEG2RAD
      );

      tilesRendererRef.current = tilesRenderer;

      // Configure the renderer
      tilesRenderer.setCamera(camera);
      tilesRenderer.setResolutionFromRenderer(camera, gl);
      tilesRenderer.errorTarget = 4;
      tilesRenderer.displayActiveTiles = true;
      tilesRenderer.maximumScreenSpaceError = 2;
      tilesRenderer.maximumMemoryUsage = 1024;

      // Create wrapper and add to scene
      const wrapper = new TilesRendererWrapper(tilesRenderer);
      wrapper.position.y = 0; // Adjust the Y position to be closer to the ground plane
      scene.add(wrapper);
      wrapperRef.current = wrapper;

      tilesRenderer.addEventListener("error", (event: any) => {
        console.error("Error loading tiles:", event);
        if (event.code === 405) {
          console.error("Auth error with asset ID:", assetId);
          setAuthError(true);
        }
      });

      // Force initial update
      tilesRenderer.update();
      setAuthError(false);
    } catch (error: any) {
      console.error("Error initializing tiles renderer:", error);
      setAuthError(true);
    }
  }, [apiKey, camera, gl, scene, assetId, latitude, longitude]);

  useEffect(() => {
    initializeTilesRenderer();

    // Cleanup function
    return () => {
      if (wrapperRef.current) {
        scene.remove(wrapperRef.current);
        wrapperRef.current.dispose();
        wrapperRef.current = null;
      }
    };
  }, [initializeTilesRenderer, scene]);

  // Handle auth errors by reinitializing
  useEffect(() => {
    if (authError) {
      // Clean up existing renderer
      if (wrapperRef.current) {
        scene.remove(wrapperRef.current);
        wrapperRef.current.dispose();
        wrapperRef.current = null;
      }
      // Reinitialize after a short delay
      const timeout = setTimeout(() => {
        initializeTilesRenderer();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [authError, initializeTilesRenderer, scene]);

  return (
    <>
      {/* Earth representation */}
      <Sphere args={[6371000, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="royalblue" opacity={0.1} transparent />
      </Sphere>

      {/* Light sources */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
    </>
  );
};

export default TilesComponent;
