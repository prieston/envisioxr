"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { MathUtils } from "three";
import { useSceneStore } from "@envisio/core/state";
import { setReferenceLocation } from "@envisio/core/utils";

// Import TilesRenderer and plugins
import { TilesRenderer } from "3d-tiles-renderer";
import {
  CesiumIonAuthPlugin,
  TilesFadePlugin,
  TileCompressionPlugin,
  GLTFExtensionsPlugin,
} from "3d-tiles-renderer/plugins";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Define props type
interface TilesComponentProps {
  apiKey: string;
  assetId?: string;
  latitude?: number;
  longitude?: number;
}

// Wrapper to add TilesRenderer.group into scene
class TilesRendererWrapper extends THREE.Object3D {
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

/**
 * Main component that initializes and renders 3D Tiles
 */
const TilesComponent: React.FC<TilesComponentProps> = ({
  apiKey,
  assetId = "2275207",
  latitude = 40.7128,
  longitude = -74.006,
}) => {
  const { camera, gl, scene } = useThree();
  const tilesRendererRef = useRef<TilesRenderer | null>(null);
  const wrapperRef = useRef<TilesRendererWrapper | null>(null);
  const [authError, setAuthError] = useState(false);
  const setTilesRenderer = useSceneStore((state) => state.setTilesRenderer);

  // Configure camera settings
  useEffect(() => {
    // Set camera far plane to a much larger value
    camera.far = 10000000; // 10000km
    camera.updateProjectionMatrix();

    // Configure orbit controls if they exist
    const controls = useSceneStore.getState().orbitControlsRef;
    if (controls) {
      controls.minDistance = 10; // Minimum zoom distance
      controls.maxDistance = 1000000; // Maximum zoom distance (1000km)
      controls.maxPolarAngle = Math.PI; // Allow full vertical rotation
      controls.update();
    }
  }, [camera]);

  // Animate / update tiles each frame
  useFrame(() => wrapperRef.current?.update());

  const initializeTilesRenderer = useCallback(() => {
    try {
      if (!apiKey) throw new Error("Cesium Ion API key is required");
      if (!assetId) throw new Error("Asset ID is required");

      const tilesRenderer = new TilesRenderer();
      tilesRenderer.registerPlugin(
        new CesiumIonAuthPlugin({
          apiToken: apiKey,
          assetId,
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

      // Set the reference location for coordinate conversions
      setReferenceLocation(latitude, longitude);

      tilesRenderer.setLatLonToYUp(
        latitude * MathUtils.DEG2RAD,
        longitude * MathUtils.DEG2RAD
      );

      tilesRenderer.setCamera(camera);
      tilesRenderer.setResolutionFromRenderer(camera, gl);
      tilesRenderer.errorTarget = 32; // Increase error target for better performance
      tilesRenderer.displayActiveTiles = true;

      // Add to scene
      const wrapper = new TilesRendererWrapper(tilesRenderer);
      scene.add(wrapper);
      tilesRendererRef.current = tilesRenderer;
      wrapperRef.current = wrapper;

      // Store the tilesRenderer in the scene store
      setTilesRenderer(tilesRenderer);

      // Listen for auth errors
      tilesRenderer.addEventListener("error", (e: any) => {
        if (e.code === 405) setAuthError(true);
      });

      tilesRenderer.update();
      setAuthError(false);
    } catch (err) {
      console.error(err);
      setAuthError(true);
    }
  }, [
    apiKey,
    assetId,
    camera,
    gl,
    scene,
    latitude,
    longitude,
    setTilesRenderer,
  ]);

  useEffect(() => {
    initializeTilesRenderer();
    return () => {
      if (wrapperRef.current) {
        scene.remove(wrapperRef.current);
        wrapperRef.current.dispose();
        wrapperRef.current = null;
      }
      setTilesRenderer(null);
    };
  }, [initializeTilesRenderer, scene, setTilesRenderer]);

  useEffect(() => {
    if (!authError) return;
    // retry once on auth failure
    wrapperRef.current?.dispose();
    scene.remove(wrapperRef.current!);
    wrapperRef.current = null;
    const id = setTimeout(() => initializeTilesRenderer(), 1000);
    return () => clearTimeout(id);
  }, [authError, initializeTilesRenderer, scene]);

  return (
    <>
      <Sphere args={[6371000, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="royalblue" opacity={0.1} transparent />
      </Sphere>
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
    </>
  );
};

export default TilesComponent;
