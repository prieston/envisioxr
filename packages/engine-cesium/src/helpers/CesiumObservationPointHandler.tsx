"use client";

import { useEffect } from "react";
import { useSceneStore } from "@envisio/core";

const CesiumObservationPointHandler: React.FC = () => {
  const addingObservation = useSceneStore((state) => state.addingObservation);
  const addObservationPoint = useSceneStore(
    (state) => state.addObservationPoint
  );

  useEffect(() => {
    if (addingObservation) {
      addObservationPoint();
    }
  }, [addingObservation, addObservationPoint]);

  return null;
};

export default CesiumObservationPointHandler;
