import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ThreeSixty,
  Settings,
  Person,
  DirectionsCarFilled,
  FlightTakeoff,
} from "@mui/icons-material";

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

interface ViewModeControlsProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
  viewMode?: string;
  setViewMode?: (mode: string) => void;
}

const ViewModeControls: React.FC<ViewModeControlsProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <ViewModeSection previewMode={false}>
      {/* Row 1: No Simulation (Orbit Controls) */}
      <ViewModeRow>
        <Tooltip title="Orbit Controls">
          <ViewModeButton
            className={viewMode === "orbit" ? "active" : ""}
            onClick={() => setViewMode?.("orbit")}
          >
            <ThreeSixty />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Control Settings">
          <ViewModeButton
            className={viewMode === "settings" ? "active" : ""}
            onClick={() => setViewMode?.("settings")}
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
            onClick={() => setViewMode?.("firstPerson")}
          >
            <Person />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Car Mode">
          <ViewModeButton
            className={viewMode === "car" ? "active" : ""}
            onClick={() => setViewMode?.("car")}
          >
            <DirectionsCarFilled />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Flight Mode">
          <ViewModeButton
            className={viewMode === "flight" ? "active" : ""}
            onClick={() => setViewMode?.("flight")}
          >
            <FlightTakeoff />
          </ViewModeButton>
        </Tooltip>
      </ViewModeRow>
    </ViewModeSection>
  );
};

export default ViewModeControls;
