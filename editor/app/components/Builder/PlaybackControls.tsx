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
  gap: theme.spacing(0.5),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  minWidth: 40,
  height: 40,
  borderRadius: 0,
  backgroundColor: "transparent",
  color: "inherit",
  border: "none",
  boxShadow: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    color: "inherit",
  },
  "&.active": {
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    color: "#2563eb",
  },
  "&:disabled": {
    backgroundColor: "transparent",
    color: "rgba(0, 0, 0, 0.26)",
    cursor: "not-allowed",
    "&:hover": {
      backgroundColor: "transparent",
      color: "rgba(0, 0, 0, 0.26)",
    },
  },
  "&:not(:last-child)::after": {
    content: '""',
    position: "absolute",
    right: -4,
    top: "50%",
    transform: "translateY(-50%)",
    width: "1px",
    height: "60%",
    background:
      "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1), transparent)",
  },
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
