"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import useSceneStore from "../../hooks/useSceneStore";
import { Canvas } from "@react-three/fiber";
import CameraPOVCaptureHandler from "../../../src/components/Scene/CameraPOVCaptureHandler";
import CameraSpringController from "../../../src/components/Scene/CameraSpringController";
import GoogleTilesRenderer from "../GoogleTilesRenderer";

interface SceneProps {
  initialSceneData: any;
  _renderObservationPoints?: boolean;
  _onSceneDataChange?: (data: any) => void;
  _enableXR?: boolean;
}

const Scene: React.FC<SceneProps> = ({
  initialSceneData,
  _renderObservationPoints = true,
  _onSceneDataChange,
  _enableXR = false,
}) => {
  const orbitControlsRef = useRef<any>(null);
  const { setOrbitControlsRef } = useSceneStore();

  useEffect(() => {
    if (orbitControlsRef.current) {
      setOrbitControlsRef(orbitControlsRef);
    }
  }, [orbitControlsRef.current]);

  // Check if we have any Google Tiles in the scene
  const hasGoogleTiles = initialSceneData?.objects?.some(
    (obj: any) => obj.type === "tiles"
  );

  return (
    <Canvas
      camera={{
        position: hasGoogleTiles ? [0, 1e8, 0] : [0, 2, 5],
        fov: 75,
      }}
      shadows
    >
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={hasGoogleTiles ? 1e6 : 1}
        maxDistance={hasGoogleTiles ? 1e9 : 20}
        maxPolarAngle={hasGoogleTiles ? Math.PI : Math.PI / 2}
        target={[0, 0, 0]}
      />
      <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />
      <CameraSpringController orbitControlsRef={orbitControlsRef} />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <directionalLight position={[-1, 1, -1]} intensity={0.7} />
      <directionalLight position={[0, 1, 0]} intensity={0.5} />
      <hemisphereLight intensity={0.6} groundColor={0x444444} />

      {/* Scene content */}
      <SceneContent initialSceneData={initialSceneData} />
    </Canvas>
  );
};

const SceneContent: React.FC<{ initialSceneData: any }> = ({
  initialSceneData,
}) => {
  useEffect(() => {
    if (!initialSceneData?.objects) return;

    // Clear existing objects
    const canvas = document.querySelector("canvas") as any;
    const scene = canvas?.__r3f?.scene;
    if (!scene) return;

    while (scene.children.length > 0) {
      const object = scene.children[0];
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
      scene.remove(object);
    }

    // Add objects from initialSceneData
    initialSceneData.objects.forEach((obj: any) => {
      if (obj.type === "tiles" && obj.apiKey) {
        // Handle Google Tiles
        const tilesRenderer = (
          <GoogleTilesRenderer key={obj.id} apiKey={obj.apiKey} />
        );
        // Add the tiles renderer to the scene
        scene.add(tilesRenderer);
      } else if (obj.url) {
        // Load GLB model
        const loader = new GLTFLoader();
        loader.load(
          obj.url,
          (gltf) => {
            const model = gltf.scene;
            model.position.set(
              obj.position[0],
              obj.position[1],
              obj.position[2]
            );
            if (obj.rotation) {
              model.rotation.set(
                obj.rotation[0],
                obj.rotation[1],
                obj.rotation[2]
              );
            }
            if (obj.scale) {
              model.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
            }
            scene.add(model);
          },
          undefined,
          (error) => {
            console.error("Error loading model:", error);
          }
        );
      }
    });
  }, [initialSceneData]);

  return null;
};

export default Scene;
