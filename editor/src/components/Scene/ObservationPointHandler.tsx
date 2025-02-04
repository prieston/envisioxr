"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import useSceneStore from "@/hooks/useSceneStore";
import * as THREE from "three";

const ObservationPointHandler = () => {
  const { camera, controls } = useThree((state) => ({
    camera: state.camera,
    controls: state.controls as any & { target: THREE.Vector3 },
  }));
  const addingObservation = useSceneStore((state) => state.addingObservation);
  const addObservationPoint = useSceneStore(
    (state) => state.addObservationPoint
  );

  useEffect(() => {
    if (addingObservation && camera && controls) {
      addObservationPoint(camera.position, controls.target);
    }
  }, [addingObservation, camera, controls, addObservationPoint]);

  return null;
};

export default ObservationPointHandler;
