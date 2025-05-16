import { useEffect } from "react";
import * as THREE from "three";
import { findIntersectionPoint } from "../../../../app/hooks/useSceneStore";

interface UseGroundMoveControlsProps {
  enabled: boolean;
  selectedObject: { id: string; ref: THREE.Object3D } | null;
  scene: THREE.Scene;
  camera: THREE.Camera;
  gl: THREE.WebGLRenderer;
  setModelPosition: (id: string, newPosition: THREE.Vector3) => void;
  updateObjectProperty: (id: string, property: string, value: any) => void;
}

export function useGroundMoveControls({
  enabled,
  selectedObject,
  scene,
  camera,
  gl,
  setModelPosition,
  updateObjectProperty,
}: UseGroundMoveControlsProps) {
  useEffect(() => {
    if (!enabled || !selectedObject?.ref) return;

    const onMouseDown = () => {
      const point = findIntersectionPoint(scene, camera);
      if (point && Array.isArray(point) && point.length === 3) {
        const newPosition = new THREE.Vector3(point[0], point[1], point[2]);
        selectedObject.ref.position.copy(newPosition);
        setModelPosition(selectedObject.id, newPosition);
        updateObjectProperty(
          selectedObject.id,
          "position",
          newPosition.toArray()
        );
      }
    };

    const onMouseMove = () => {
      const point = findIntersectionPoint(scene, camera);
      if (!point) return;
      const newPosition = new THREE.Vector3(point[0], point[1], point[2]);
      // Lock Y if needed
      newPosition.y = selectedObject.ref.position.y;
      selectedObject.ref.position.copy(newPosition);
      setModelPosition(selectedObject.id, newPosition);
      updateObjectProperty(
        selectedObject.id,
        "position",
        newPosition.toArray()
      );
    };

    const onMouseUp = () => {
      // No need to reset isDragging, dragStart, or dragOffset
    };

    gl.domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      gl.domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    enabled,
    selectedObject,
    scene,
    camera,
    gl,
    setModelPosition,
    updateObjectProperty,
  ]);
}
