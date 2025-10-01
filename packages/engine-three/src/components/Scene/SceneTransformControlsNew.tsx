"use client";

import React from "react";
import { useSceneStore, useWorldStore } from "@envisio/core";

import { OrbitControls } from "@react-three/drei";

import type { SceneTransformControlsProps } from "./types";

const SceneTransformControlsNew: React.FC<SceneTransformControlsProps> = ({
  selectedObject,
  transformControlsRef,
}) => {
  const transformMode = useSceneStore((state) => state.transformMode);

  // Placeholder: transform controls bridge lives in editor for now
  return <OrbitControls makeDefault />;
};

export default SceneTransformControlsNew;
