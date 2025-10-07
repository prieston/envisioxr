"use client";

import React from "react";
import { useSceneStore } from "@envisio/core";
import { ObservationPointsList as UIObservationPointsList } from "@envisio/ui";

interface ObservationPointsListProps {
  observationPoints?: any[];
  selectedObservation?: any;
  addObservationPoint?: () => void;
  selectObservation?: (id: number) => void;
  previewMode?: boolean;
  previewIndex?: number;
  setPreviewIndex?: (index: number) => void;
  setPreviewMode?: (mode: boolean) => void;
}

/**
 * Wrapper component that connects the UI package ObservationPointsList
 * to the Zustand store and provides the expected prop interface
 */
const ObservationPointsList: React.FC<ObservationPointsListProps> = ({
  observationPoints,
  selectedObservation,
  addObservationPoint,
  selectObservation,
  previewMode,
  previewIndex,
  setPreviewIndex,
  setPreviewMode,
}) => {
  return (
    <UIObservationPointsList
      items={observationPoints}
      selectedId={selectedObservation?.id}
      onAdd={addObservationPoint}
      onSelect={selectObservation}
      previewMode={previewMode}
      previewIndex={previewIndex}
      setPreviewIndex={setPreviewIndex}
      setPreviewMode={setPreviewMode}
    />
  );
};

export default ObservationPointsList;
