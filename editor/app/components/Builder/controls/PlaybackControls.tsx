import React from "react";
import { Tooltip } from "@mui/material";
import { ControlSection, StyledIconButton } from "./PlaybackControls.styles";
import {
  PlayArrow,
  Stop,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";

interface PlaybackControlsProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
  isPlaying?: boolean;
  togglePlayback?: () => void;
  nextObservation?: () => void;
  prevObservation?: () => void;
  observationPoints?: any[];
  previewMode?: boolean;
  previewIndex?: number;
  setPreviewMode?: (mode: boolean) => void;
  selectObservation?: (id: number) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlayback,
  nextObservation,
  prevObservation,
  observationPoints,
  previewMode,
  previewIndex,
  setPreviewMode,
  selectObservation,
}) => {
  const hasNextPoint =
    !!previewMode &&
    previewIndex !== undefined &&
    previewIndex < (observationPoints?.length || 0) - 1;
  const hasPrevPoint =
    !!previewMode && previewIndex !== undefined && previewIndex > 0;

  const handleNextObservation = () => {
    if (nextObservation && hasNextPoint) {
      nextObservation();
      const nextIndex = (previewIndex || 0) + 1;
      const nextPoint = observationPoints?.[nextIndex];
      if (nextPoint && nextPoint.position && nextPoint.target) {
        selectObservation?.(nextPoint.id);
      }
    }
  };

  const handlePrevObservation = () => {
    if (prevObservation && hasPrevPoint) {
      prevObservation();
      const prevIndex = (previewIndex || 0) - 1;
      const prevPoint = observationPoints?.[prevIndex];
      if (prevPoint && prevPoint.position && prevPoint.target) {
        selectObservation?.(prevPoint.id);
      }
    }
  };

  const handlePlayback = () => {
    if (togglePlayback) {
      togglePlayback();
      if (!isPlaying) {
        setPreviewMode?.(true);
      } else {
        setPreviewMode?.(false);
      }
    }
  };

  return (
    <ControlSection>
      <Tooltip title="Previous Point">
        <span>
          <StyledIconButton
            onClick={handlePrevObservation}
            disabled={!hasPrevPoint}
          >
            <NavigateBefore />
          </StyledIconButton>
        </span>
      </Tooltip>
      <Tooltip title={isPlaying ? "Stop" : "Play"}>
        <StyledIconButton
          onClick={handlePlayback}
          disabled={!observationPoints || observationPoints.length === 0}
        >
          {isPlaying ? <Stop /> : <PlayArrow />}
        </StyledIconButton>
      </Tooltip>
      <Tooltip title="Next Point">
        <span>
          <StyledIconButton
            onClick={handleNextObservation}
            disabled={!hasNextPoint}
          >
            <NavigateNext />
          </StyledIconButton>
        </span>
      </Tooltip>
    </ControlSection>
  );
};

export default PlaybackControls;
