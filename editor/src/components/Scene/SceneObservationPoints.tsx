"use client";

import React from "react";
import ObservationPoint from "../ObservationPoint";
import useSceneStore from "../../../app/hooks/useSceneStore";
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

  return (
    <>
      {points.map((point) => (
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
      ))}
    </>
  );
};

export default SceneObservationPoints;
