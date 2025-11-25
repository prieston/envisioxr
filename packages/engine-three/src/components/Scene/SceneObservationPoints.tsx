"use client";

import React, { useMemo } from "react";
import ObservationPoint from "../ObservationPoint";
import { useSceneStore } from "@klorad/core";
import { SceneObservationPointsProps } from "./types";

const SceneObservationPoints: React.FC<SceneObservationPointsProps> = ({
  points,
  previewMode,
  enableXR,
  renderObservationPoints,
}) => {
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const selectObservationPoint = useSceneStore(
    (state) => state.selectObservation
  );

  // Memoize observation points list to prevent unnecessary re-renders
  const memoizedPoints = useMemo(() => {
    return points.map((point) => (
      <ObservationPoint
        key={point.id}
        id={point.id}
        position={point.position}
        target={point.target}
        selected={selectedObservation?.id === point.id}
        onSelect={previewMode || enableXR ? null : selectObservationPoint}
        previewMode={previewMode}
        renderObservationPoints={renderObservationPoints}
      />
    ));
  }, [points, selectedObservation?.id, previewMode, enableXR, selectObservationPoint, renderObservationPoints]);

  return <>{memoizedPoints}</>;
};

export default SceneObservationPoints;
