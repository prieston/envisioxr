"use client";

import React from "react";
import {
  Box,
  // Card,
  // CardContent,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Button,
  // List,
  ListItem,
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
  // AirplanemodeActiveOutlined,
  // DriveEta,
  Person,
  // PersonOutline,
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

// const ObservationCard = styled(Card)(({ theme: _theme }) => ({
//   minWidth: 150,
//   height: 80,
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   cursor: "pointer",
//   position: "relative",
//   overflow: "hidden",
//   background: "rgba(255, 255, 255, 0.8)",
//   backdropFilter: "blur(20px) saturate(130%)",
//   WebkitBackdropFilter: "blur(20px) saturate(130%)",
//   border: "1px solid rgba(37, 99, 235, 0.3)",
//   borderRadius: "12px",
//   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//   "&:hover": {
//     background: "rgba(37, 99, 235, 0.1)",
//   },
//   "&.selected": {
//     background: "rgba(37, 99, 235, 0.12)",
//     borderColor: "#2563eb",
//   },
//   "&::before": {
//     content: '""',
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background:
//       "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)",
//     opacity: 0,
//     transform: "scale(0.95)",
//     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//     zIndex: -1,
//   },
//   "&:hover::before": {
//     opacity: 1,
//     transform: "scale(1)",
//   },
// }));

// const StyledCardContent = styled(CardContent)(({ theme: _theme }) => ({
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   height: "100%",
//   width: "100%",
//   padding: theme.spacing(1),
//   "&:last-child": {
//     paddingBottom: theme.spacing(1),
//   },
// }));

const StyledTypography = styled(Typography)(({ theme: _theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "inherit",
}));

// const StyledList = styled(List)(({ theme: _theme }) => ({
//   padding: 0,
// }));

const ObservationListItem = styled(ListItem)<{ selected: boolean }>(
  ({ theme, selected }) => ({
    cursor: "pointer",
    borderRadius: 0,
    minWidth: 150,
    height: 60,
    marginBottom: theme.spacing(0.5),
    marginLeft: `-${theme.spacing(2)}`,
    marginRight: `-${theme.spacing(2)}`,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    backgroundColor: selected ? "rgba(37, 99, 235, 0.12)" : "transparent",
    color: selected ? "#2563eb" : "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: "transparent",
      transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: -1,
    },
    "&:hover": {
      marginLeft: `-${theme.spacing(1.5)}`,
      marginRight: `-${theme.spacing(1.5)}`,
      "&::before": {
        backgroundColor: selected
          ? "rgba(37, 99, 235, 0.16)"
          : "rgba(37, 99, 235, 0.08)",
      },
      color: selected ? "#2563eb" : "#2563eb",
      transform: "translateX(4px)",
    },
    "&:active": {
      transform: "translateX(2px)",
    },
    background: "red !important",
  })
);

// const AddButton = styled(IconButton)(({ theme: _theme }) => ({
//   marginLeft: "auto",
//   color: "var(--glass-text-secondary, rgba(15, 23, 42, 0.7))",
//   "&:hover": {
//     color: "#2563eb",
//     backgroundColor: "rgba(37, 99, 235, 0.1)",
//   },
// }));

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
    // First select the observation point and set the preview index
    selectObservation(point.id);
    setPreviewIndex(index);

    // Only trigger camera movement if the point has both position and target set
    if (point.position && point.target) {
      // Then enable preview mode to trigger camera movement
      setPreviewMode(true);

      // Wait for camera movement to complete before disabling preview mode
      // Using a longer timeout to ensure the camera movement is complete
      setTimeout(() => {
        setPreviewMode(false);
      }, 1500);
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
        {/* <ViewModeRow>
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
        </ViewModeRow> */}
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
        <ObservationListItem selected={false} onClick={addObservationPoint}>
          <AddIcon />
          <StyledTypography variant="caption">Add Point</StyledTypography>
        </ObservationListItem>
        {observationPoints.map((point, index) => (
          <ObservationListItem
            key={point.id}
            selected={
              (previewMode && index === previewIndex) ||
              (!previewMode && selectedObservation?.id === point.id)
            }
            onClick={() => handleObservationClick(point, index)}
          >
            <StyledTypography variant="subtitle2" noWrap>
              {point.title || "Untitled"}
            </StyledTypography>
          </ObservationListItem>
        ))}
      </ObservationSection>
    </BottomPanelContainer>
  );
};

export default BottomPanel;
