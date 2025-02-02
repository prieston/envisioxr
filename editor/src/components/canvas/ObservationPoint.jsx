"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import useSceneStore from "@/hooks/useSceneStore";

const ObservationPoint = ({
  id,
  position,
  target,
  selected,
  onSelect,
  previewMode: previewModeProp,
}) => {
  // If a previewMode prop is provided, use it; otherwise, subscribe to the global store.
  const previewMode =
    typeof previewModeProp !== "undefined"
      ? previewModeProp
      : useSceneStore((state) => state.previewMode);

  const arrowRef = useRef();

  useEffect(() => {
    if (!position || !target || !arrowRef.current) return;

    const from = new THREE.Vector3(...position);
    const to = new THREE.Vector3(...target);
    const direction = to.clone().sub(from).normalize();

    arrowRef.current.setDirection(direction);
    arrowRef.current.position.set(...position);
  }, [position, target]);

  // In preview mode, do not render the arrow.
  if (previewMode) {
    return null;
  }

  return (
    <primitive
      object={
        new THREE.ArrowHelper(
          // Compute direction using the target and position
          new THREE.Vector3()
            .subVectors(
              new THREE.Vector3(...(target || [0, 0, 1])),
              new THREE.Vector3(...(position || [0, 0, 0]))
            )
            .normalize(),
          new THREE.Vector3(...(position || [0, 0, 0])),
          1, // Length of the arrow; adjust as needed
          selected ? 0xff0000 : 0xffff00 // Color: red if selected, yellow otherwise
        )
      }
      ref={arrowRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    />
  );
};

export default ObservationPoint;
