// SceneControls.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import FirstPersonControls from "./FirstPersonControls";
import ThirdPersonControls from "./ThirdPersonControls";
import FlightControls from "./FlightControls";
import ThirdPersonFlightControls from "./ThirdPersonFlightControls";
import CarControls from "./CarControls";
import ThirdPersonCarControls from "./ThirdPersonCarControls";

const SceneControls = () => {
  const { camera, scene } = useThree();
  const viewMode = useSceneStore((state) => state.viewMode);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);
  const setOrbitControlsRef = useSceneStore(
    (state) => state.setOrbitControlsRef
  );
  const setScene = useSceneStore((state) => state.setScene);

  // Create our own ref
  const localOrbitControlsRef = useRef(null);

  // Update the store's ref whenever our local ref changes
  useEffect(() => {
    setOrbitControlsRef(localOrbitControlsRef.current);
  }, [localOrbitControlsRef.current, setOrbitControlsRef]);

  // Set the scene in the store
  useEffect(() => {
    setScene(scene);
  }, [scene, setScene]);

  // Whenever viewMode changes, "spawn" the camera if needed
  useEffect(() => {
    // Capture wherever the camera currently is when switching modes
    if (
      viewMode === "firstPerson" ||
      viewMode === "thirdPerson" ||
      viewMode === "car" ||
      viewMode === "thirdPersonCar"
    ) {
      // Zero out rotation for a clean spawn (optional)
      camera.rotation.set(0, 0, 0);
    }
  }, [viewMode, camera]);

  // Render appropriate controls based on view mode
  switch (viewMode) {
    case "firstPerson":
      return <FirstPersonControls />;
    case "thirdPerson":
      return <ThirdPersonControls />;
    case "flight":
      return <FlightControls />;
    case "thirdPersonFlight":
      return <ThirdPersonFlightControls />;
    case "car":
      return <CarControls />;
    case "thirdPersonCar":
      return <ThirdPersonCarControls />;
    case "orbit":
    default:
      return (
        <OrbitControls
          ref={localOrbitControlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          enabled={!selectedObject && !previewMode}
          enablePan={!previewMode}
          enableZoom={!previewMode}
          enableRotate={!previewMode}
        />
      );
  }
};

export default SceneControls;
