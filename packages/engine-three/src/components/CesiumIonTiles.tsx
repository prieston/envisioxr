"use client";

import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Html, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Import TilesRenderer
// 3d-tiles-renderer types are available but moduleResolution must be bundler. Fall back to `any` for plugins.
import { TilesRenderer } from "3d-tiles-renderer";
import {
  CesiumIonAuthPlugin,
  TilesFadePlugin,
  TileCompressionPlugin,
  GLTFExtensionsPlugin,
} from "3d-tiles-renderer/plugins";
// Types for DRACOLoader can be missing depending on three version; cast to any where necessary.
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MathUtils } from "three";

// Extend TilesRenderer type to include setLatLonToYUp
declare module "3d-tiles-renderer" {
  interface TilesRenderer {
    setLatLonToYUp(latitude: number, longitude: number): void;
  }
}

interface CesiumIonTilesProps {
  apiKey: string;
  assetId: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  latitude: number;
  longitude: number;
}

// Create a wrapper for TilesRenderer that extends Object3D
class TilesRendererWrapper extends THREE.Object3D {
  tilesRenderer: TilesRenderer;

  constructor(tilesRenderer: TilesRenderer) {
    super();
    this.tilesRenderer = tilesRenderer;
    // Add the tiles renderer's group to this object
    const tilesGroup = (tilesRenderer as unknown as { group?: THREE.Object3D })
      .group;
    if (tilesGroup) {
      (this as unknown as { add: (obj: unknown) => void }).add(
        tilesGroup as unknown
      );
    }
  }

  update() {
    (this.tilesRenderer as unknown as { update?: () => void }).update?.();
  }

  dispose() {
    (this.tilesRenderer as unknown as { dispose?: () => void }).dispose?.();
  }
}

const CesiumIonTiles: React.FC<CesiumIonTilesProps> = ({
  apiKey,
  assetId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  latitude,
  longitude,
}) => {
  const { camera, gl, scene } = useThree();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Initializing...");
  const [requestsMade, setRequestsMade] = useState(0);
  const tilesRendererRef = useRef<TilesRenderer | null>(null);
  const wrapperRef = useRef<TilesRendererWrapper | null>(null);

  // Update the tiles renderer on each frame
  useFrame(() => {
    if (wrapperRef.current) {
      wrapperRef.current.update();
    }
  });

  useEffect(() => {
    try {
      // Create the tiles renderer without initial URL
      const tilesRenderer = new (TilesRenderer as unknown as {
        new (): TilesRenderer;
      })();

      // Register plugins
      tilesRenderer.registerPlugin(
        new CesiumIonAuthPlugin({
          apiToken: apiKey,
          assetId,
          autoRefreshToken: true,
        })
      );
      tilesRenderer.registerPlugin(new TileCompressionPlugin());
      tilesRenderer.registerPlugin(new TilesFadePlugin());
      (
        tilesRenderer as unknown as { registerPlugin: (p: unknown) => void }
      ).registerPlugin(
        new (GLTFExtensionsPlugin as unknown as new (args: {
          dracoLoader: DRACOLoader;
        }) => unknown)({
          dracoLoader: new DRACOLoader().setDecoderPath(
            "https://unpkg.com/three@0.153.0/examples/jsm/libs/draco/gltf/"
          ) as DRACOLoader,
        }) as unknown
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
      tilesRenderer.errorTarget = 8;

      // Create wrapper and add to scene
      const wrapper = new TilesRendererWrapper(tilesRenderer);
      (
        wrapper as unknown as {
          position: { set: (x: number, y: number, z: number) => void };
        }
      ).position.set(...position);
      (
        wrapper as unknown as {
          rotation: { set: (x: number, y: number, z: number) => void };
        }
      ).rotation.set(...rotation);
      (
        wrapper as unknown as {
          scale: { set: (x: number, y: number, z: number) => void };
        }
      ).scale.set(...scale);
      // Don't adjust the Y position - let the tiles renderer handle elevation
      scene.add(wrapper as unknown as THREE.Object3D);
      wrapperRef.current = wrapper;

      // Set up event listeners
      tilesRenderer.addEventListener("load", () => {
        setStatus("Tiles loaded successfully");
        setLoading(false);
      });

      tilesRenderer.addEventListener("error", (event: unknown) => {
        console.error("Error loading tiles:", event);
        const message =
          (event as { message?: string })?.message || "Unknown error";
        setError(`Error loading tiles: ${message}`);
        setLoading(false);
      });

      tilesRenderer.addEventListener("tileLoad", () => {
        setRequestsMade((prev) => prev + 1);
        setStatus(`Loading tiles (${requestsMade + 1} requests)...`);
      });

      // Force initial update
      tilesRenderer.update();

      // Cleanup function
      return () => {
        if (wrapperRef.current) {
          scene.remove(wrapperRef.current as unknown as THREE.Object3D);
          wrapperRef.current.dispose();
          wrapperRef.current = null;
        }
      };
    } catch (error: unknown) {
      console.error("Error initializing tiles renderer:", error);
      const message =
        (error as { message?: string })?.message || "Unknown error";
      setError(`Error initializing tiles renderer: ${message}`);
      setLoading(false);
      return () => {};
    }
  }, [
    apiKey,
    assetId,
    camera,
    gl,
    scene,
    position,
    rotation,
    scale,
    latitude,
    longitude,
  ]);

  return (
    <>
      {/* Earth representation */}
      <Sphere args={[6371000, 64, 64]} position={[0, 0, 0]} />

      {/* Coordinate axes for reference */}
      <axesHelper args={[10000]} />

      {/* Debug grid */}
      <gridHelper args={[20000, 20, 0xff0000, 0x00ff00]} />

      {/* Light sources */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />

      {/* Status indicator */}
      <Html position={[0, 0, 0]} center>
        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            color: loading ? "white" : error ? "red" : "green",
            padding: "10px",
            borderRadius: "5px",
            fontFamily: "Arial",
            fontSize: "14px",
            pointerEvents: "none",
            width: "300px",
            textAlign: "center",
          }}
        >
          {error || status}
          <br />
          <small>Requests made: {requestsMade}</small>
          <br />
          <small>Viewing: Tokyo Tower (Cesium Ion 3D Tiles)</small>
        </div>
      </Html>
    </>
  );
};

export default CesiumIonTiles;
