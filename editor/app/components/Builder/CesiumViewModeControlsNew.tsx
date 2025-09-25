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
import { useSceneStore } from "@envisio/core/state";
import { useCameraControllerManager } from "./CesiumControls/hooks/useCameraControllerManager";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ViewModeSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  padding: theme.spacing(1),
  backgroundColor: "transparent",
  borderRadius: 0,
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
  minWidth: 40,
  height: 40,
  padding: theme.spacing(0.5),
  backgroundColor: "transparent",
  color: "inherit",
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    color: "inherit",
  },
  "&.active": {
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    color: "#2563eb",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.16)",
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
  const { switchToMode, isInitialized } =
    useCameraControllerManager(cesiumViewer);

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
