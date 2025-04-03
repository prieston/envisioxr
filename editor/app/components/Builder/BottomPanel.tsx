"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AddCircleOutline as AddIcon,
  PlayArrow,
  Stop,
  NavigateBefore,
  NavigateNext,
  Camera,
  ViewInAr,
  Person,
  ThreeSixty,
} from "@mui/icons-material";
import useSceneStore from "@/app/hooks/useSceneStore";

// Container for the entire bottom panel
interface BottomPanelContainerProps {
  previewMode: boolean;
}

const BottomPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<BottomPanelContainerProps>(({ theme, previewMode }) => ({
  width: "100%",
  height: "120px",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  cursor: previewMode ? "not-allowed" : "auto",
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
  userSelect: "none",
}));

const ControlSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const ViewModeButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const ObservationCard = styled(Card)(({ theme }) => ({
  minWidth: 150,
  height: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  "&.selected": {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: "rgba(76, 95, 213, 0.1)",
  },
}));

const ObservationScroll = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  overflowX: "auto",
  padding: theme.spacing(1),
  "&::-webkit-scrollbar": {
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.3)",
    },
  },
}));

const BottomPanel = () => {
  const {
    previewMode,
    observationPoints,
    selectedObservation,
    addObservationPoint,
    selectObservation,
    viewMode,
    setViewMode,
    isPlaying,
    togglePlayback,
  } = useSceneStore();

  return (
    <BottomPanelContainer previewMode={previewMode}>
      {/* View Mode Controls */}
      <ControlSection>
        <Tooltip title="Orbit Controls">
          <ViewModeButton
            className={viewMode === "orbit" ? "active" : ""}
            onClick={() => setViewMode("orbit")}
          >
            <ThreeSixty />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="First Person">
          <ViewModeButton
            className={viewMode === "firstPerson" ? "active" : ""}
            onClick={() => setViewMode("firstPerson")}
          >
            <Person />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Third Person">
          <ViewModeButton
            className={viewMode === "thirdPerson" ? "active" : ""}
            onClick={() => setViewMode("thirdPerson")}
          >
            <ViewInAr />
          </ViewModeButton>
        </Tooltip>
      </ControlSection>

      <Divider orientation="vertical" flexItem />

      {/* Playback Controls */}
      <ControlSection>
        <Tooltip title="Previous Point">
          <IconButton size="small">
            <NavigateBefore />
          </IconButton>
        </Tooltip>
        <Tooltip title={isPlaying ? "Stop" : "Play"}>
          <IconButton size="small" onClick={togglePlayback}>
            {isPlaying ? <Stop /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Point">
          <IconButton size="small">
            <NavigateNext />
          </IconButton>
        </Tooltip>
      </ControlSection>

      <Divider orientation="vertical" flexItem />

      {/* Observation Points */}
      <ObservationScroll>
        {observationPoints.map((point) => (
          <ObservationCard
            key={point.id}
            className={selectedObservation?.id === point.id ? "selected" : ""}
            onClick={() => selectObservation(point.id)}
          >
            <CardContent>
              <Typography variant="subtitle2" noWrap>
                {point.title || "Untitled"}
              </Typography>
            </CardContent>
          </ObservationCard>
        ))}
        <ObservationCard
          onClick={addObservationPoint}
          sx={{
            border: "2px dashed rgba(255, 255, 255, 0.2)",
            backgroundColor: "transparent",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AddIcon />
            <Typography variant="caption">Add Point</Typography>
          </CardContent>
        </ObservationCard>
      </ObservationScroll>
    </BottomPanelContainer>
  );
};

export default BottomPanel;
