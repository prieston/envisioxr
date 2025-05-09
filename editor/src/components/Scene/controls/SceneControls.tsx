import React from "react";
import { OrbitControls } from "@react-three/drei";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import FirstPersonControls from "./FirstPersonControls";
import ThirdPersonControls from "./ThirdPersonControls";
import FlightControls from "./FlightControls";
import ThirdPersonFlightControls from "./ThirdPersonFlightControls";
import CarControls from "./CarControls";
import ThirdPersonCarControls from "./ThirdPersonCarControls";

const SceneControls = () => {
  const viewMode = useSceneStore((state) => state.viewMode);

  const orbitControlsRef = useSceneStore((state) => state.orbitControlsRef);

  const renderControls = () => {
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

  return renderControls();
};

export default SceneControls;
