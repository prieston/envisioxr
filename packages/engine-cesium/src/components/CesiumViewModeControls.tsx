import React, { useCallback } from "react";
import { Tooltip } from "@mui/material";
import {
  ViewModeSection,
  ViewModeRow,
  ViewModeButton,
} from "./CesiumViewModeControls.styles";
import {
  ThreeSixty,
  Settings,
  Person,
  DirectionsCarFilled,
  FlightTakeoff,
  Explore,
} from "@mui/icons-material";
import { SimulationMode } from "../CesiumControls/types";
import { useSceneStore } from "@envisio/core";
import { useCameraControllerManager } from "../CesiumControls/hooks/useCameraControllerManager";
import { createLogger } from "@envisio/core";

const logger = createLogger("CesiumViewModeControls");
import {
  exitPointerLockIfActive,
  requestPointerLockForCanvas,
} from "../utils/cesiumPointerLock";

// ============================================================================
// STYLED COMPONENTS moved to CesiumViewModeControlsNew.styles.ts
// ============================================================================

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
        logger.warn(
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
          logger.info(
            `[CesiumViewModeControls] Auto-requesting pointer lock for ${mode} mode`
          );
          requestPointerLockForCanvas(cesiumViewer.canvas, 100);
        } else if (
          mode !== "firstPerson" &&
          mode !== "flight" &&
          document.pointerLockElement
        ) {
          // Exit pointer lock when switching away from pointer-lock modes
          logger.info(
            "[CesiumViewModeControls] Exiting pointer lock - switching away from pointer-lock mode"
          );
          exitPointerLockIfActive();
        }

        logger.info(`[CesiumViewModeControls] Switched to mode: ${mode}`);
      } catch (error) {
        logger.error(
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
