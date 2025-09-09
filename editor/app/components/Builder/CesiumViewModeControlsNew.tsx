import React, { useCallback } from "react";
import { Box, Button, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ThreeSixty,
  Settings,
  Person,
  DirectionsCarFilled,
  FlightTakeoff,
  Explore,
} from "@mui/icons-material";
import { SimulationMode } from "./CesiumControls/types";
import { SIMULATION_MODES } from "./CesiumControls/constants";
import useSceneStore from "../../hooks/useSceneStore";
import { useCameraControllerManager } from "./CesiumControls/hooks/useCameraControllerManager";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ViewModeSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: previewMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)",
  borderRadius: theme.spacing(1),
  backdropFilter: "blur(10px)",
}));

const ViewModeRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const ViewModeButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(0.5),
  backgroundColor: "transparent",
  color: theme.palette.common.white,
  border: `1px solid rgba(255, 255, 255, 0.3)`,
  borderRadius: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  "&.active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      borderColor: theme.palette.primary.dark,
    },
  },
}));

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CesiumViewModeControlsProps {
  viewMode?: SimulationMode;
  setViewMode?: (mode: SimulationMode) => void;
  disabled?: boolean;
}

/**
 * CesiumViewModeControls - A comprehensive control system for Cesium 3D navigation
 *
 * Features:
 * - Orbit: Standard Cesium camera controls
 * - Explore: Free camera exploration
 * - Walk: First-person walking with mouse look and physics
 * - Drive: Vehicle simulation with realistic steering
 * - Fly: 3D aerial navigation with 6DOF movement
 * - Settings: Configuration mode
 */
const CesiumViewModeControls: React.FC<CesiumViewModeControlsProps> = ({
  viewMode = "orbit",
  setViewMode,
  disabled = false,
}) => {
  const { cesiumViewer } = useSceneStore();
  const { switchToMode, isModeActive, isInitialized } =
    useCameraControllerManager(cesiumViewer);

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[CesiumViewModeControlsNew] Render - isInitialized:",
      isInitialized,
      "viewMode:",
      viewMode
    );
  }

  /**
   * Handle view mode change
   */
  const handleViewModeChange = useCallback(
    (mode: SimulationMode) => {
      if (disabled || !isInitialized) {
        console.warn(
          "[CesiumViewModeControls] Controls disabled or not initialized"
        );
        return;
      }

      try {
        // Switch to new mode using the controller manager
        switchToMode(mode);

        // Update parent component state
        setViewMode?.(mode);

        // Handle pointer lock based on mode
        if (
          (mode === "firstPerson" || mode === "flight") &&
          cesiumViewer?.canvas
        ) {
          console.log(
            `[CesiumViewModeControls] Auto-requesting pointer lock for ${mode} mode`
          );
          // Use a small delay to ensure the controller is initialized
          setTimeout(() => {
            if (cesiumViewer.canvas && !document.pointerLockElement) {
              cesiumViewer.canvas.requestPointerLock().catch((error) => {
                console.warn(
                  "[CesiumViewModeControls] Failed to request pointer lock:",
                  error
                );
              });
            }
          }, 100);
        } else if (
          mode !== "firstPerson" &&
          mode !== "flight" &&
          document.pointerLockElement
        ) {
          // Exit pointer lock when switching away from pointer-lock modes
          console.log(
            "[CesiumViewModeControls] Exiting pointer lock - switching away from pointer-lock mode"
          );
          document.exitPointerLock();
        }

        if (process.env.NODE_ENV === "development") {
          console.log(`[CesiumViewModeControls] Switched to mode: ${mode}`);
        }
      } catch (error) {
        console.error(
          "[CesiumViewModeControls] Error changing view mode:",
          error
        );
      }
    },
    [disabled, isInitialized, switchToMode, setViewMode, cesiumViewer]
  );

  return (
    <ViewModeSection previewMode={false}>
      {/* Row 1: Basic Navigation */}
      <ViewModeRow>
        <Tooltip title="Orbit Controls">
          <ViewModeButton
            className={viewMode === "orbit" ? "active" : ""}
            onClick={() => handleViewModeChange("orbit")}
            disabled={disabled || !isInitialized}
          >
            <ThreeSixty />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Explore Mode">
          <ViewModeButton
            className={viewMode === "explore" ? "active" : ""}
            onClick={() => handleViewModeChange("explore")}
            disabled={disabled || !isInitialized}
          >
            <Explore />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Control Settings">
          <ViewModeButton
            className={viewMode === "settings" ? "active" : ""}
            onClick={() => handleViewModeChange("settings")}
            disabled={disabled || !isInitialized}
          >
            <Settings />
          </ViewModeButton>
        </Tooltip>
      </ViewModeRow>

      {/* Row 2: Simulation Modes */}
      <ViewModeRow>
        <Tooltip title="First Person (WASD + Mouse)">
          <ViewModeButton
            className={viewMode === "firstPerson" ? "active" : ""}
            onClick={() => handleViewModeChange("firstPerson")}
            disabled={disabled || !isInitialized}
          >
            <Person />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Car Mode (WASD Steering)">
          <ViewModeButton
            className={viewMode === "car" ? "active" : ""}
            onClick={() => handleViewModeChange("car")}
            disabled={disabled || !isInitialized}
          >
            <DirectionsCarFilled />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Drone Flight Mode (WASD + Mouse + Space/Shift)">
          <ViewModeButton
            className={viewMode === "flight" ? "active" : ""}
            onClick={() => handleViewModeChange("flight")}
            disabled={disabled || !isInitialized}
          >
            <FlightTakeoff />
          </ViewModeButton>
        </Tooltip>
      </ViewModeRow>
    </ViewModeSection>
  );
};

export default CesiumViewModeControls;
