"use client";

import React from "react";
import { Box } from "@mui/material";
import PlaybackControls from "./PlaybackControls";
import ObservationPointsList from "../lists/ObservationPointsList";

interface BottomPanelControlsProps {
  // Playback props
  isPlaying: boolean;
  togglePlayback: () => void;
  next: () => void;
  prev: () => void;
  canNext: boolean;
  canPrev: boolean;

  // Observation points props
  observationPoints: any[];
  selectedObservation: any;
  addObservationPoint: () => void;
  selectObservation: (id: string | number | null) => void;
  deleteObservationPoint: (id: string | number) => void;
  previewMode: boolean;
  previewIndex: number;
  setPreviewIndex: (index: number) => void;
  setPreviewMode: (mode: boolean) => void;
}

/**
 * Combined bottom panel controls that displays playback controls
 * and observation points list side by side in a horizontal layout.
 */
export const BottomPanelControls: React.FC<BottomPanelControlsProps> = ({
  isPlaying,
  togglePlayback,
  next,
  prev,
  canNext,
  canPrev,
  observationPoints,
  selectedObservation,
  addObservationPoint,
  selectObservation,
  deleteObservationPoint,
  previewMode,
  previewIndex,
  setPreviewIndex,
  setPreviewMode,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Playback Controls - Fixed width on the left */}
      <Box
        sx={{
          flexShrink: 0,
          minWidth: "fit-content",
        }}
      >
        <PlaybackControls
          isPlaying={isPlaying}
          togglePlayback={togglePlayback}
          next={next}
          prev={prev}
          canNext={canNext}
          canPrev={canPrev}
        />
      </Box>

      {/* Observation Points List - Takes remaining space */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0, // Allow shrinking below content size
        }}
      >
        <ObservationPointsList
          observationPoints={observationPoints}
          selectedObservation={selectedObservation}
          addObservationPoint={addObservationPoint}
          selectObservation={selectObservation}
          deleteObservationPoint={deleteObservationPoint}
          previewMode={previewMode}
          previewIndex={previewIndex}
          setPreviewIndex={setPreviewIndex}
          setPreviewMode={setPreviewMode}
        />
      </Box>
    </Box>
  );
};
