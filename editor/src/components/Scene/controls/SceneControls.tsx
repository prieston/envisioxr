// SceneControls.tsx
"use client";

import React, { useEffect } from "react";
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
  const { camera } = useThree();
  const viewMode = useSceneStore((state) => state.viewMode);
  const orbitControlsRef = useSceneStore((state) => state.orbitControlsRef);

  // Whenever viewMode changes, “spawn” the camera if needed
  useEffect(() => {
    // Capture wherever the camera currently is when switching modes
    if (
      viewMode === "firstPerson" ||
      viewMode === "thirdPerson" ||
      viewMode === "car" ||
      viewMode === "thirdPersonCar"
    ) {
      // Optionally adjust Y to ensure we start slightly above ground
      // camera.position.y += PLAYER_HEIGHT; // import from your constants if desired

      // Zero out rotation for a clean spawn (optional)
      camera.rotation.set(0, 0, 0);
    }
  }, [viewMode, camera]);

  switch (viewMode) {
    case "orbit":
      return <OrbitControls ref={orbitControlsRef} />;
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
    default:
      return <OrbitControls ref={orbitControlsRef} />;
  }
};

export default SceneControls;
