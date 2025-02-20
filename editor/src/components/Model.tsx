"use client";

import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import useSceneStore from "@/hooks/useSceneStore";
import useModelLoader from "./useModelLoader";

const CLICK_THRESHOLD = 5;

const Model = ({
  id,
  url,
  type = "glb",
  position,
  scale,
  rotation,
  selected,
  onSelect,
}: {
  id: number;
  url: string;
  type?: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  selected: boolean;
  onSelect: (id: number, object: THREE.Object3D) => void;
}) => {
  const modelData = useModelLoader(url, type);
  const object = modelData.scene || modelData;
  const modelRef = useRef(null);
  const pointerDown = useRef<{ x: number; y: number } | null>(null);

  // Subscribe to previewMode from the store.
  const previewMode = useSceneStore((state) => state.previewMode);
  // Update the model: set shadow properties and adjust emissive color if selected.
  // useEffect(() => {
  //   if (modelRef.current) {
  //     modelRef.current.traverse((child) => {
  //       if (child.isMesh) {
  //         // Enable shadows on each mesh.
  //         child.castShadow = true;
  //         child.receiveShadow = true;
  //         // Update emissive color when not in preview mode.
  //       }
  //     });
  //   }
  // }, [previewMode]);

  // Update the model: set shadow properties and adjust emissive color if selected.
  useEffect(() => {
    if (modelRef.current && !previewMode) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          // Enable shadows on each mesh.
          if (!previewMode && child.material) {
            child.material.emissive = selected
              ? new THREE.Color(0x00ffff)
              : new THREE.Color(0x000000);
          }
        }
      });
    }
  }, [selected, previewMode]);

  // Update scale manually when the scale prop changes.
  useEffect(() => {
    if (modelRef.current && scale) {
      modelRef.current.scale.set(...scale);
    }
  }, [scale]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    pointerDown.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (!pointerDown.current) return;
    const dx = e.clientX - pointerDown.current.x;
    const dy = e.clientY - pointerDown.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < CLICK_THRESHOLD && !previewMode) {
      onSelect(id, modelRef.current!);
    }
    pointerDown.current = null;
  };

  return (
    <Suspense fallback={null}>
      {/* Use primitive to render the loaded model */}
      {/* @ts-ignore-next-line */}
      <primitive
        object={object}
        ref={modelRef}
        position={position}
        rotation={rotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </Suspense>
  );
};

export default Model;
