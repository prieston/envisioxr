"use client";

import React, { useRef, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";
import useSceneStore from "@/hooks/useSceneStore";
import useModelLoader from "./useModelLoader";

const CLICK_THRESHOLD = 5;

interface ModelProps {
  id: string;
  url: string;
  type?: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  selected: boolean;
  onSelect: (id: string, object: THREE.Object3D) => void;
}

const Model = ({
  id,
  url,
  type = "glb",
  position,
  scale,
  rotation,
  selected,
  onSelect,
}: ModelProps) => {
  const modelData = useModelLoader(url, type);
  // @ts-ignore-next-line
  const originalObject = modelData.scene || modelData;

  // Clone the loaded object and ensure each mesh has its own material.
  const clonedObject = useMemo(() => {
    if (originalObject) {
      const clone = originalObject.clone(true);
      clone.traverse((child) => {
        // @ts-ignore-next-line
        if (child.isMesh && child.material) {
          // Clone material to avoid sharing between instances
          child.material = child.material.clone();
        }
      });
      return clone;
    }
    return null;
  }, [originalObject]);

  const modelRef = useRef<THREE.Object3D | null>(null);
  const pointerDown = useRef<{ x: number; y: number } | null>(null);

  // Subscribe to previewMode from the store.
  const previewMode = useSceneStore((state) => state.previewMode);

  // Update emissive color if selected.
  useEffect(() => {
    if (modelRef.current && !previewMode) {
      modelRef.current.traverse((child) => {
        // @ts-ignore-next-line
        if (child.isMesh && child.material) {
          // Set emissive to highlight color if selected, otherwise reset to black.
          // @ts-ignore-next-line
          child.material.emissive = selected
            ? new THREE.Color(0x00ffff)
            : new THREE.Color(0x000000);
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

  // If cloned object is not ready, render nothing.
  if (!clonedObject) return null;

  return (
    <Suspense fallback={null}>
      {/* @ts-ignore-next-line */}
      <primitive
        object={clonedObject}
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
