import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import {
  OrbitControls,
  FirstPersonControls,
  PointerLockControls,
} from "@react-three/drei";
import useSceneStore from "../../../app/hooks/useSceneStore";
import * as THREE from "three";

interface SceneViewModeControllerProps {
  orbitControlsRef: React.MutableRefObject<any>;
}

const SceneViewModeController: React.FC<SceneViewModeControllerProps> = ({
  orbitControlsRef,
}) => {
  const { camera, gl } = useThree();
  const firstPersonControlsRef = useRef<any>(null);
  const pointerLockControlsRef = useRef<any>(null);

  const viewMode = useSceneStore((state) => state.viewMode);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);

  // Handle view mode changes
  useEffect(() => {
    // Disable all controls first
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }
    if (firstPersonControlsRef.current) {
      firstPersonControlsRef.current.enabled = false;
    }
    if (pointerLockControlsRef.current) {
      pointerLockControlsRef.current.enabled = false;
    }

    // Enable the selected control
    switch (viewMode) {
      case "orbit":
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !selectedObject && !previewMode;
        }
        break;
      case "firstPerson":
        if (firstPersonControlsRef.current) {
          firstPersonControlsRef.current.enabled = !previewMode;
          // Set initial position for first person view
          camera.position.set(0, 1.6, 5); // Height of ~1.6 meters
        }
        break;
      case "thirdPerson":
        if (pointerLockControlsRef.current) {
          pointerLockControlsRef.current.enabled = !previewMode;
          // Set initial position for third person view
          if (selectedObject?.ref) {
            const objectPosition = selectedObject.ref.position;
            camera.position.set(
              objectPosition.x,
              objectPosition.y + 2,
              objectPosition.z + 5
            );
          }
        }
        break;
    }
  }, [viewMode, selectedObject, previewMode, camera, orbitControlsRef]);

  // Update third person camera position when selected object moves
  useEffect(() => {
    if (viewMode === "thirdPerson" && selectedObject?.ref) {
      const objectPosition = selectedObject.ref.position;
      camera.position.set(
        objectPosition.x,
        objectPosition.y + 2,
        objectPosition.z + 5
      );
    }
  }, [viewMode, selectedObject, camera]);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={1000}
        enablePan={!previewMode}
        enableZoom={!previewMode}
        enableRotate={!previewMode}
      />

      {viewMode === "firstPerson" && (
        <FirstPersonControls
          ref={firstPersonControlsRef}
          activeLook={!previewMode}
          enabled={viewMode === "firstPerson" && !previewMode}
          lookSpeed={0.1}
          movementSpeed={10}
          heightCoef={1}
          lookVertical={true}
        />
      )}

      {viewMode === "thirdPerson" && (
        <PointerLockControls
          ref={pointerLockControlsRef}
          enabled={viewMode === "thirdPerson" && !previewMode}
        />
      )}
    </>
  );
};

export default SceneViewModeController;
