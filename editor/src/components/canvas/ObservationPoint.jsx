"use client";

import React from "react";
import useSceneStore from "@/hooks/useSceneStore";

const ObservationPoint = ({
  id,
  position,
  target,
  selected,
  onSelect,
  previewMode: previewModeProp,
}) => {
  // Use the passed prop if provided; otherwise, subscribe to the store.
  const previewMode =
    typeof previewModeProp !== "undefined"
      ? previewModeProp
      : useSceneStore((state) => state.previewMode);

  if (previewMode) {
    return null;
  }

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    >
      <coneGeometry args={[0.5, 1, 16]} />
      <meshBasicMaterial color={selected ? "cyan" : "orange"} />
    </mesh>
  );
};

export default ObservationPoint;
