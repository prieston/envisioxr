import { useRef, useEffect } from "react";
import * as THREE from "three";

// ✅ Observation Point with Arrow (Without Temporary Direction)
const ObservationPoint = ({ id, position, target, selected, onSelect }) => {
  const arrowRef = useRef();

  useEffect(() => {
    if (!position || !target || !arrowRef.current) return;

    const from = new THREE.Vector3(...position);
    const to = new THREE.Vector3(...target);
    const direction = to.clone().sub(from).normalize();

    arrowRef.current.setDirection(direction);
    arrowRef.current.position.set(...position);
  }, [position, target]);

  return (
    <primitive
      object={new THREE.ArrowHelper(
        new THREE.Vector3().subVectors(new THREE.Vector3(...(target || [0,0,1])), new THREE.Vector3(...(position || [0,0,0]))).normalize(), // ✅ Compute directly
        new THREE.Vector3(...(position || [0,0,0])), // ✅ Set correct position from the start
        1, // Arrow length
        selected ? 0xff0000 : 0xffff00 // Color: Red if selected, Yellow otherwise
      )}
      ref={arrowRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
    />
  );
};

export default ObservationPoint;
