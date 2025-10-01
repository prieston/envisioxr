"use client";

import React from "react";
import { TransformControls } from "@react-three/drei";
import { useSceneStore } from "@envisio/core";
import { SceneTransformControlsProps } from "./types";
import MagnetControls from "./controls/MagnetControls";

const SceneTransformControls: React.FC<SceneTransformControlsProps> = ({
  selectedObject,
  transformControlsRef,
}) => {
  const transformMode = useSceneStore((state) => state.transformMode);
  const magnetEnabled = useSceneStore((state) => state.magnetEnabled);
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);
  const updateObjectProperty = useSceneStore(
    (state) => state.updateObjectProperty
  );

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
        // Update the object's position in the store
        updateObjectProperty(selectedObject.id, "position", position.toArray());
        break;
      case "rotate":
        setModelRotation(selectedObject.id, rotation);
        // Update the object's rotation in the store
        updateObjectProperty(selectedObject.id, "rotation", [
          rotation.x,
          rotation.y,
          rotation.z,
        ]);
        break;
      case "scale":
        setModelScale(selectedObject.id, scale);
        // Update the object's scale in the store
        updateObjectProperty(selectedObject.id, "scale", scale.toArray());
        break;
    }
  };

  return (
    <>
      <TransformControls
        ref={transformControlsRef}
        object={selectedObject.ref}
        mode={transformMode}
        onChange={handleChange}
      />
      <MagnetControls
        enabled={magnetEnabled}
        target={selectedObject.ref}
        heightOffset={0}
        smoothingFactor={0.1}
      />
    </>
  );
};

export default SceneTransformControls;
