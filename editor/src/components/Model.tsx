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
}) => {
  const modelData = useModelLoader(url, type);
  const object = modelData.scene || modelData;
  const modelRef = useRef(null);
  const pointerDown = useRef(null);

  // Instead of calling getState() directly, subscribe to previewMode via the hook.
  const previewMode = useSceneStore((state) => state.previewMode);

  // Highlight mesh if selected.
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

  // Effect to update scale manually when the scale prop changes.
  useEffect(() => {
    if (modelRef.current && scale) {
      modelRef.current.scale.set(...scale);
    }
  }, [scale]);

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
    // Now using the previewMode variable from the hook
    if (distance < CLICK_THRESHOLD && !previewMode) {
      onSelect(id, modelRef.current);
    }
    pointerDown.current = null;
  };

  return (
    <Suspense fallback={null}>
      {/* @ts-ignore-next-line */}
      <primitive
        object={object}
        ref={modelRef}
        position={position}
        rotation={rotation}
        // Remove the scale prop if you’re manually controlling it in the effect
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </Suspense>
  );
};

export default Model;
