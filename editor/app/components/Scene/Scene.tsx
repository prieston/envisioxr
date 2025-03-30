"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import useSceneStore from "../../hooks/useSceneStore";
import { Canvas } from "@react-three/fiber";
import CameraPOVCaptureHandler from "../../../src/components/Scene/CameraPOVCaptureHandler";
import CameraSpringController from "../../../src/components/Scene/CameraSpringController";

interface SceneProps {
  initialSceneData: any;
  renderObservationPoints?: boolean;
  onSceneDataChange?: (data: any) => void;
  enableXR?: boolean;
}

const Scene: React.FC<SceneProps> = ({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
}) => {
  const orbitControlsRef = useRef<any>(null);
  const { setOrbitControlsRef } = useSceneStore();

  useEffect(() => {
    if (orbitControlsRef.current) {
      setOrbitControlsRef(orbitControlsRef);
    }
  }, [orbitControlsRef.current]);

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 75 }} shadows>
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
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
      if (obj.url) {
        // Load GLB model
        const loader = new GLTFLoader();
        loader.load(
          obj.url,
          (gltf) => {
            const model = gltf.scene;
            model.position.set(...obj.position);
            if (obj.rotation) {
              model.rotation.set(...obj.rotation);
            }
            if (obj.scale) {
              model.scale.set(...obj.scale);
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
