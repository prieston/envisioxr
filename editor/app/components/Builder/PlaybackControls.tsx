import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  PlayArrow,
  Stop,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";

const ControlSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

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
  previewIndex,
  setPreviewMode,
  selectObservation,
}) => {
  const hasNextPoint =
    isPlaying &&
    previewIndex !== undefined &&
    previewIndex < (observationPoints?.length || 0) - 1;
  const hasPrevPoint =
    isPlaying && previewIndex !== undefined && previewIndex > 0;

  const handleNextObservation = () => {
    if (nextObservation && hasNextPoint) {
      nextObservation();
      // Select the observation point for camera animation
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
      // Select the observation point for camera animation
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
      // Enable preview mode when starting playback
      if (!isPlaying) {
        setPreviewMode?.(true);
      } else {
        // Disable preview mode when stopping playback
        setPreviewMode?.(false);
      }
    }
  };

  return (
    <ControlSection>
      <Tooltip title="Previous Point">
        <span>
          <IconButton
            size="small"
            onClick={handlePrevObservation}
            disabled={!hasPrevPoint}
          >
            <NavigateBefore />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={isPlaying ? "Stop" : "Play"}>
        <IconButton
          size="small"
          onClick={handlePlayback}
          disabled={!observationPoints || observationPoints.length === 0}
        >
          {isPlaying ? <Stop /> : <PlayArrow />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Next Point">
        <span>
          <IconButton
            size="small"
            onClick={handleNextObservation}
            disabled={!hasNextPoint}
          >
            <NavigateNext />
          </IconButton>
        </span>
      </Tooltip>
    </ControlSection>
  );
};

export default PlaybackControls;
