"use client";

import React from "react";
import { OrbitControls } from "@react-three/drei";
import { useSceneStore } from "@klorad/core";

const SceneControls: React.FC = () => {
  const selectedObject = useSceneStore((s) => s.selectedObject);
  const previewMode = useSceneStore((s) => s.previewMode);
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.05}
      enabled={!selectedObject && !previewMode}
      enablePan={!previewMode}
      enableZoom={!previewMode}
      enableRotate={!previewMode}
    />
  );
};

export default SceneControls;
