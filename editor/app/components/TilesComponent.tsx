"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
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
  collisionMeshes: THREE.Mesh[];

  constructor(tilesRenderer: TilesRenderer) {
    super();
    this.tilesRenderer = tilesRenderer;
    this.collisionMeshes = []; // Initialize array in constructor

    // Add the tiles renderer's group to this object
    if (tilesRenderer.group) {
      this.add(tilesRenderer.group);
    }

    // Listen for tile load events to create collision meshes
    tilesRenderer.addEventListener("tileLoad", (event: any) => {
      const tile = event.tile;
      if (tile.cached && tile.cached.scene) {
        this.createCollisionMeshForTile(tile);
      }
    });
  }

  createCollisionMeshForTile(tile: any) {
    // Create simplified collision geometry from the tile's scene
    tile.cached.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;
        const collisionMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            visible: true,
            wireframe: true,
            color: 0xff0000,
            transparent: true,
            opacity: 0.3,
          })
        );
        collisionMesh.position.copy(object.position);
        collisionMesh.rotation.copy(object.rotation);
        collisionMesh.scale.copy(object.scale);
        collisionMesh.userData.isCollisionMesh = true;
        this.collisionMeshes.push(collisionMesh);
        this.add(collisionMesh);
      }
    });
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
    // Clean up collision meshes
    this.collisionMeshes.forEach((mesh) => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material && "dispose" in mesh.material) {
        (mesh.material as THREE.Material).dispose();
      }
      this.remove(mesh);
    });
    this.collisionMeshes = [];
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

  // Update the tiles renderer on each frame
  useFrame(() => {
    if (wrapperRef.current) {
      wrapperRef.current.update();
    }
  });

  useEffect(() => {
    // Position the camera for better viewing initially
    camera.position.set(1000, 1000, 1000);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    try {
      // Create the tiles renderer without initial URL
      const tilesRenderer = new TilesRenderer();

      // Register plugins
      tilesRenderer.registerPlugin(
        new CesiumIonAuthPlugin({
          apiToken: apiKey,
          assetId: assetId,
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
      scene.add(wrapper);
      wrapperRef.current = wrapper;

      tilesRenderer.addEventListener("error", (event: any) => {
        console.error("Error loading tiles:", event);
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
      return () => {};
    }
  }, [apiKey, camera, gl, scene, assetId, latitude, longitude]);

  return (
    <>
      {/* Earth representation */}
      <Sphere args={[6371000, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial color="royalblue" opacity={0.1} transparent />
      </Sphere>

      {/* Collision meshes for tiles */}
      {wrapperRef.current &&
        wrapperRef.current.collisionMeshes &&
        wrapperRef.current.collisionMeshes.map((mesh, index) => (
          <RigidBody key={index} type="fixed" colliders="trimesh">
            <primitive object={mesh.clone()} />
          </RigidBody>
        ))}

      {/* Light sources */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
    </>
  );
};

export default TilesComponent;
