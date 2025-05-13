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
  ThreeSixty,
  FlightTakeoff,
  AirplanemodeActiveOutlined,
  DriveEta,
  Person,
  PersonOutline,
  DirectionsCarFilled,
  Settings,
} from "@mui/icons-material";
import useSceneStore from "@/app/hooks/useSceneStore";

// Container for the entire bottom panel
interface BottomPanelContainerProps {
  previewMode: boolean;
}

const BottomPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<BottomPanelContainerProps>(({ theme }) => ({
  width: "100%",
  height: "120px",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  userSelect: "none",
}));

const ViewModeSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.5),
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
}));

const ViewModeRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const ObservationSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  gap: theme.spacing(2),
  overflowX: "auto",
  padding: theme.spacing(1),
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
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

const ControlSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const ViewModeButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.2rem",
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
    setPreviewMode,
    nextObservation,
    prevObservation,
    previewIndex,
    setPreviewIndex,
  } = useSceneStore();

  const handlePlayback = () => {
    togglePlayback();
    setPreviewMode(!isPlaying);
  };

  const handleObservationClick = (point: any, index: number) => {
    selectObservation(point.id);
    setPreviewIndex(index);

    // Temporarily enable preview mode to trigger camera movement
    if (!previewMode) {
      setPreviewMode(true);
      // Disable preview mode after camera movement (about 500ms)
      setTimeout(() => setPreviewMode(false), 500);
    }
  };

  const hasNextPoint =
    previewMode && previewIndex < observationPoints.length - 1;
  const hasPrevPoint = previewMode && previewIndex > 0;

  return (
    <BottomPanelContainer previewMode={previewMode}>
      {/* View Mode Controls - 3x3 Grid Layout */}
      <ViewModeSection previewMode={previewMode}>
        {/* Row 1: No Simulation (Orbit Controls) */}
        <ViewModeRow>
          <Tooltip title="Orbit Controls">
            <ViewModeButton
              className={viewMode === "orbit" ? "active" : ""}
              onClick={() => setViewMode("orbit")}
            >
              <ThreeSixty />
            </ViewModeButton>
          </Tooltip>
          <Tooltip title="Control Settings">
            <ViewModeButton
              className={viewMode === "settings" ? "active" : ""}
              onClick={() => setViewMode("settings")}
            >
              <Settings />
            </ViewModeButton>
          </Tooltip>
        </ViewModeRow>

        {/* Row 2: First Person Simulations */}
        <ViewModeRow>
          <Tooltip title="First Person">
            <ViewModeButton
              className={viewMode === "firstPerson" ? "active" : ""}
              onClick={() => setViewMode("firstPerson")}
            >
              <Person />
            </ViewModeButton>
          </Tooltip>
          <Tooltip title="Car Mode">
            <ViewModeButton
              className={viewMode === "car" ? "active" : ""}
              onClick={() => setViewMode("car")}
            >
              <DirectionsCarFilled />
            </ViewModeButton>
          </Tooltip>
          <Tooltip title="Flight Mode">
            <ViewModeButton
              className={viewMode === "flight" ? "active" : ""}
              onClick={() => setViewMode("flight")}
            >
              <FlightTakeoff />
            </ViewModeButton>
          </Tooltip>
        </ViewModeRow>

        {/* Row 3: Third Person Views */}
        <ViewModeRow>
          <Tooltip title="Third Person">
            <ViewModeButton
              className={viewMode === "thirdPerson" ? "active" : ""}
              onClick={() => setViewMode("thirdPerson")}
            >
              <PersonOutline />
            </ViewModeButton>
          </Tooltip>
          <Tooltip title="Third Person Car">
            <ViewModeButton
              className={viewMode === "thirdPersonCar" ? "active" : ""}
              onClick={() => setViewMode("thirdPersonCar")}
            >
              <DriveEta />
            </ViewModeButton>
          </Tooltip>
          <Tooltip title="Third Person Flight">
            <ViewModeButton
              className={viewMode === "thirdPersonFlight" ? "active" : ""}
              onClick={() => setViewMode("thirdPersonFlight")}
            >
              <AirplanemodeActiveOutlined />
            </ViewModeButton>
          </Tooltip>
        </ViewModeRow>
      </ViewModeSection>

      <Divider orientation="vertical" flexItem />

      {/* Playback Controls - Always enabled */}
      <ControlSection>
        <Tooltip title="Previous Point">
          <span>
            <IconButton
              size="small"
              onClick={prevObservation}
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
            disabled={observationPoints.length === 0}
          >
            {isPlaying ? <Stop /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Next Point">
          <span>
            <IconButton
              size="small"
              onClick={nextObservation}
              disabled={!hasNextPoint}
            >
              <NavigateNext />
            </IconButton>
          </span>
        </Tooltip>
      </ControlSection>

      <Divider orientation="vertical" flexItem />

      {/* Observation Points */}
      <ObservationSection previewMode={previewMode}>
        {observationPoints.map((point, index) => (
          <ObservationCard
            key={point.id}
            className={
              (previewMode && index === previewIndex) ||
              (!previewMode && selectedObservation?.id === point.id)
                ? "selected"
                : ""
            }
            onClick={() => handleObservationClick(point, index)}
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
      </ObservationSection>
    </BottomPanelContainer>
  );
};

export default BottomPanel;
