"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useSceneStore from "../../app/hooks/useSceneStore";
import useModelLoader from "./useModelLoader";
import { useModelSelection } from "./hooks/useModelSelection";
import { useModelMaterials } from "./hooks/useModelMaterials";

const CLICK_THRESHOLD = 5;

interface ModelProps {
  id: string;
  url: string;
  type?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  selected?: boolean;
  onSelect?: (id: string, object: THREE.Object3D) => void;
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
  const previewMode = useSceneStore((state) => state.previewMode);
  const updateModelRef = useSceneStore((state) => state.updateModelRef);
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);

  // Use custom hooks for model functionality
  const { handlePointerDown, handlePointerUp } = useModelSelection({
    id,
    onSelect,
    previewMode,
  });

  useModelMaterials({
    modelRef,
    selected,
    previewMode,
  });

  // Update model properties when they change
  useEffect(() => {
    if (modelRef.current) {
      // Update position
      if (position) {
        modelRef.current.position.set(...position);
      }
      // Update rotation
      if (rotation) {
        modelRef.current.rotation.set(...rotation);
      }
      // Update scale
      if (scale) {
        modelRef.current.scale.set(...scale);
      }
    }
  }, [position, rotation, scale]);

  // Update model ref in store
  useEffect(() => {
    if (modelRef.current) {
      updateModelRef(id, modelRef.current);
    }
  }, [id, updateModelRef]);

  if (!clonedObject) {
    return null;
  }

  return (
    <primitive
      object={clonedObject}
      ref={modelRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  );
};

export default Model;
