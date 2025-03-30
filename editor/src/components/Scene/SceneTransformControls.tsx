"use client";

import React from "react";
import { TransformControls } from "@react-three/drei";
import useSceneStore from "../../../app/hooks/useSceneStore";
import { SceneTransformControlsProps } from "./types";

const SceneTransformControls: React.FC<SceneTransformControlsProps> = ({
  selectedObject,
  transformControlsRef,
}) => {
  const transformMode = useSceneStore((state) => state.transformMode);
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);

  if (!selectedObject || !selectedObject.ref) {
    return null;
  }

  const handleChange = () => {
    if (!selectedObject.ref) return;

    const position = selectedObject.ref.position;
    const rotation = selectedObject.ref.rotation;
    const scale = selectedObject.ref.scale;

    // Update the store based on the current transform mode
    switch (transformMode) {
      case "translate":
        setModelPosition(selectedObject.id, position);
        break;
      case "rotate":
        setModelRotation(selectedObject.id, rotation);
        break;
      case "scale":
        setModelScale(selectedObject.id, scale);
        break;
    }
  };

  return (
    <TransformControls
      ref={transformControlsRef}
      object={selectedObject.ref}
      mode={transformMode}
      onChange={handleChange}
    />
  );
};

export default SceneTransformControls;
