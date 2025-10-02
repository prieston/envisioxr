import React from "react";
import type { ViewMode } from "@envisio/core/state/useSceneStore";
import { Tooltip } from "@mui/material";
import {
  ViewModeSection,
  ViewModeRow,
  ViewModeButton,
} from "./ViewModeControls.styles";
import {
  ThreeSixty,
  Settings,
  Person,
  DirectionsCarFilled,
  FlightTakeoff,
} from "@mui/icons-material";

interface ViewModeControlsProps {
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  disabled?: boolean;
}

const ViewModeControls: React.FC<ViewModeControlsProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <ViewModeSection previewMode={false}>
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
