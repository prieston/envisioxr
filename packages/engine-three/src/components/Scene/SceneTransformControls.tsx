"use client";

import React from "react";
import { OrbitControls } from "@react-three/drei";

import type { SceneTransformControlsProps } from "./types";

const SceneTransformControls: React.FC<SceneTransformControlsProps> = ({
  selectedObject: _selectedObject,
  transformControlsRef: _transformControlsRef,
}) => {
  // Placeholder: transform controls bridge lives in editor for now
  return <OrbitControls makeDefault />;
};

export default SceneTransformControls;
