import React, { useEffect, useCallback } from "react";
import { Tooltip } from "@mui/material";
import {
  ThreeSixty,
  Settings,
  Person,
  DirectionsCarFilled,
  FlightTakeoff,
  Explore,
} from "@mui/icons-material";
import useSceneStore from "../../../hooks/useSceneStore";

// Import types and constants
import { CesiumViewModeControlsProps, SimulationMode } from "./types";
import { SIMULATION_MODES } from "./constants";

// Import styled components
import {
  ViewModeSection,
  ViewModeRow,
  ViewModeButton,
} from "./components/StyledComponents";

// Import hooks
import { useSimulationParams } from "./hooks/useSimulationParams";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useGroundDetection } from "./hooks/useGroundDetection";
import { useMovementUtils } from "./hooks/useMovementUtils";
import { useCarSimulation } from "./hooks/useCarSimulation";
import { useSimulation } from "./hooks/useSimulation";
import { useMouseControls } from "./hooks/useMouseControls";

/**
 * CesiumViewModeControls - A comprehensive control system for Cesium 3D navigation
 *
 * Provides multiple simulation modes:
 * - Orbit: Standard Cesium camera controls
 * - Explore: Free camera exploration
 * - First Person: FPS-style movement with ground detection
 * - Car: Vehicle simulation with realistic steering
 * - Flight: 3D aerial navigation
 * - Settings: Configuration mode
 */
const CesiumViewModeControls: React.FC<CesiumViewModeControlsProps> = ({
  viewMode,
  setViewMode,
}) => {
  const { cesiumViewer } = useSceneStore();

  // Initialize hooks
  const params = useSimulationParams();
  const { handleKeyDown, handleKeyUp, getPressedKeys } = useKeyboardControls();
  const { getGroundHeight } = useGroundDetection(cesiumViewer);
  const { applyMovement } = useMovementUtils(getPressedKeys);
  const { handleCarMovement } = useCarSimulation(getPressedKeys);
  const { startSimulation, stopSimulation, setCurrentMode } = useSimulation(
    cesiumViewer,
    getGroundHeight,
    getPressedKeys,
    params,
    applyMovement,
    handleCarMovement
  );
  const { handleFirstPersonMouseMove, handlePointerLockChange } =
    useMouseControls(cesiumViewer);

  /**
   * Handle mouse movement based on current mode
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      // Only apply mouse controls in first-person mode
      if (viewMode === SIMULATION_MODES.FIRST_PERSON) {
        handleFirstPersonMouseMove(event);
      }
    },
    [viewMode, handleFirstPersonMouseMove]
  );

  /**
   * Handle view mode changes
   */
  const handleViewModeChange = useCallback(
    (mode: SimulationMode) => {
      if (!cesiumViewer) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Cesium viewer not available");
        }
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[CesiumViewModeControls] Switching to mode: ${mode}`);
      }

      setCurrentMode(mode);

      try {
        // Stop current simulation first
        stopSimulation();

        const controller = cesiumViewer.scene.screenSpaceCameraController;

        switch (mode) {
          case SIMULATION_MODES.ORBIT:
          case SIMULATION_MODES.EXPLORE: {
            // Exit pointer lock if active
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }

            // Enable default Cesium camera controls
            controller.enableRotate = true;
            controller.enableTranslate = true;
            controller.enableZoom = true;
            controller.enableTilt = true;

            if (mode === SIMULATION_MODES.EXPLORE) {
              cesiumViewer.scene.morphTo3D();
            }
            break;
          }
          case SIMULATION_MODES.FIRST_PERSON: {
            // Disable default controls for first-person mode
            controller.enableRotate = false;
            controller.enableTranslate = false;
            controller.enableZoom = false;
            controller.enableTilt = false;

            // Start simulation
            startSimulation();

            // Request pointer lock for first-person mode
            // Use a small delay to avoid conflicts with Cesium's event handling
            setTimeout(() => {
              if (cesiumViewer.canvas && !document.pointerLockElement) {
                cesiumViewer.canvas.requestPointerLock().catch((error) => {
                  if (process.env.NODE_ENV === "development") {
                    console.warn("Failed to request pointer lock:", error);
                  }
                });
              }
            }, 100);
            break;
          }
          case SIMULATION_MODES.CAR:
          case SIMULATION_MODES.FLIGHT: {
            // Exit pointer lock if active (not needed for car/flight)
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }

            // Disable default controls for simulation
            controller.enableRotate = false;
            controller.enableTranslate = false;
            controller.enableZoom = false;
            controller.enableTilt = false;

            // Start simulation
            startSimulation();
            break;
          }
          case SIMULATION_MODES.SETTINGS: {
            // Settings mode - keep current camera state
            break;
          }
        }

        setViewMode?.(mode);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error changing view mode:", error);
        }
      }
    },
    [cesiumViewer, setViewMode, startSimulation, stopSimulation, setCurrentMode]
  );

  // Set up event listeners
  useEffect(() => {
    const handleKeyDownWithEscape = (event: KeyboardEvent) => {
      // Handle Escape key to exit first-person mode
      if (
        event.code === "Escape" &&
        viewMode === SIMULATION_MODES.FIRST_PERSON
      ) {
        handleViewModeChange(SIMULATION_MODES.ORBIT);
        return;
      }
      handleKeyDown(event);
    };

    window.addEventListener("keydown", handleKeyDownWithEscape);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDownWithEscape);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      stopSimulation();
    };
  }, [
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handlePointerLockChange,
    stopSimulation,
    viewMode,
    handleViewModeChange,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSimulation();
    };
  }, [stopSimulation]);

  return (
    <ViewModeSection previewMode={false}>
      {/* Row 1: Basic Navigation */}
      <ViewModeRow>
        <Tooltip title="Orbit Controls">
          <ViewModeButton
            className={viewMode === SIMULATION_MODES.ORBIT ? "active" : ""}
            onClick={() => handleViewModeChange(SIMULATION_MODES.ORBIT)}
          >
            <ThreeSixty />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Explore Mode">
          <ViewModeButton
            className={viewMode === SIMULATION_MODES.EXPLORE ? "active" : ""}
            onClick={() => handleViewModeChange(SIMULATION_MODES.EXPLORE)}
          >
            <Explore />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Control Settings">
          <ViewModeButton
            className={viewMode === SIMULATION_MODES.SETTINGS ? "active" : ""}
            onClick={() => handleViewModeChange(SIMULATION_MODES.SETTINGS)}
          >
            <Settings />
          </ViewModeButton>
        </Tooltip>
      </ViewModeRow>

      {/* Row 2: Simulation Modes */}
      <ViewModeRow>
        <Tooltip title="First Person (WASD + Mouse)">
          <ViewModeButton
            className={
              viewMode === SIMULATION_MODES.FIRST_PERSON ? "active" : ""
            }
            onClick={() => handleViewModeChange(SIMULATION_MODES.FIRST_PERSON)}
          >
            <Person />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Car Mode (WASD Steering)">
          <ViewModeButton
            className={viewMode === SIMULATION_MODES.CAR ? "active" : ""}
            onClick={() => handleViewModeChange(SIMULATION_MODES.CAR)}
          >
            <DirectionsCarFilled />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Flight Mode (WASD + Arrow Keys)">
          <ViewModeButton
            className={viewMode === SIMULATION_MODES.FLIGHT ? "active" : ""}
            onClick={() => handleViewModeChange(SIMULATION_MODES.FLIGHT)}
          >
            <FlightTakeoff />
          </ViewModeButton>
        </Tooltip>
      </ViewModeRow>
    </ViewModeSection>
  );
};

export default CesiumViewModeControls;
