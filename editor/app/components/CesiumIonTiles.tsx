"use client";

import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Html, Sphere } from "@react-three/drei";
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
      const tilesRenderer = new TilesRenderer();

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
      tilesRenderer.errorTarget = 8;

      // Create wrapper and add to scene
      const wrapper = new TilesRendererWrapper(tilesRenderer);
      wrapper.position.set(...position);
      wrapper.rotation.set(...rotation);
      wrapper.scale.set(...scale);
      // Don't adjust the Y position - let the tiles renderer handle elevation
      scene.add(wrapper);
      wrapperRef.current = wrapper;

      // Set up event listeners
      tilesRenderer.addEventListener("load", () => {
        setStatus("Tiles loaded successfully");
        setLoading(false);
      });

      tilesRenderer.addEventListener("error", (event: any) => {
        console.error("Error loading tiles:", event);
        setError(`Error loading tiles: ${event.message || "Unknown error"}`);
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
          scene.remove(wrapperRef.current);
          wrapperRef.current.dispose();
          wrapperRef.current = null;
        }
      };
    } catch (error: any) {
      console.error("Error initializing tiles renderer:", error);
      setError(
        `Error initializing tiles renderer: ${error.message || "Unknown error"}`
      );
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
      <Sphere args={[6371000, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="royalblue" opacity={0.1} transparent />
      </Sphere>

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
