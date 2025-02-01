// src/components/Model.jsx
"use client";

import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import useSceneStore from "@/hooks/useSceneStore";
import useModelLoader from "./useModelLoader";

const CLICK_THRESHOLD = 5;

const Model = ({ id, url, type = "glb", position, scale, rotation, selected, onSelect }) => {
  const modelData = useModelLoader(url, type);
  // For glTF, the model is usually in modelData.scene. For 3dm, it might be the object itself.
  const object = modelData.scene || modelData;

  const modelRef = useRef();
  const pointerDown = useRef(null);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissive = selected
            ? new THREE.Color(0x00ffff)
            : new THREE.Color(0x000000);
        }
      });
    }
  }, [selected]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    pointerDown.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (!pointerDown.current) return;
    const dx = e.clientX - pointerDown.current.x;
    const dy = e.clientY - pointerDown.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < CLICK_THRESHOLD && !useSceneStore.getState().previewMode) {
      onSelect(id, modelRef.current);
    }
    pointerDown.current = null;
  };

  return (
    <Suspense fallback={null}>
      <primitive
        object={object}
        ref={modelRef}
        position={position}
        scale={scale}
        rotation={rotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </Suspense>
  );
};

export default Model;
