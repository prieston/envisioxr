"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useSceneStore } from "@envisio/core";

const ObservationPoint = ({
  id,
  position,
  target,
  selected,
  onSelect,
  previewMode: previewModeProp,
  renderObservationPoints = true,
}) => {
  // If a previewMode prop is provided, use it; otherwise, subscribe to the global store.
  const previewMode =
    typeof previewModeProp !== "undefined"
      ? previewModeProp
      : useSceneStore((state) => state.previewMode);

  const arrowRef = useRef(null);

  useEffect(() => {
    if (!position || !target || !arrowRef.current) return;

    const from = new THREE.Vector3(...position);
    const to = new THREE.Vector3(...target);
    const direction = to.clone().sub(from).normalize();

    arrowRef.current.setDirection(direction);
    arrowRef.current.position.set(...position);
  }, [position, target]);

  // In preview mode, do not render the arrow.
  if (previewMode || !renderObservationPoints || !position || !target) {
    return null;
  }

  return (
    <>
      <primitive
        object={
          new THREE.ArrowHelper(
            new THREE.Vector3()
              .subVectors(
                new THREE.Vector3(...target),
                new THREE.Vector3(...position)
              )
              .normalize(),
            new THREE.Vector3(...position),
            1,
            selected ? 0xff0000 : 0xffff00
          )
        }
        ref={arrowRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      />
    </>
  );
};

export default ObservationPoint;
