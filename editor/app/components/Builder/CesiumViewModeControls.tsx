/* eslint-disable no-console */
import React, { useEffect, useRef, useCallback, useMemo } from "react";
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
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core/state";
import { SimulationMode } from "./CesiumControls/types";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

// Use shared SimulationMode from CesiumControls/types

/**
 * Movement vector for 3D movement calculations
 */
interface MovementVector {
  x: number;
  y: number;
  z: number;
}

/**
 * Simulation parameters configuration
 */
interface SimulationParams {
  walkSpeed: number;
  carSpeed: number;
  flightSpeed: number;
  turnSpeed: number;
  walkHeight: number;
  carHeight: number;
  maxSlope: number;
  debugMode: boolean;
}

/**
 * Props for the CesiumViewModeControls component
 */
interface CesiumViewModeControlsProps {
  disabled?: boolean;
  viewMode?: SimulationMode;
  setViewMode?: (mode: SimulationMode) => void;
}

// ============================================================================
// STYLED COMPONENTS moved to CesiumViewModeControls.styles.ts
// ============================================================================

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook for managing simulation parameters
 */
const useSimulationParams = () => {
  return useMemo(
    (): SimulationParams => ({
      walkSpeed: 50, // meters per second
      carSpeed: 100, // meters per second
      flightSpeed: 200, // meters per second
      turnSpeed: 0.02, // radians per frame
      walkHeight: 1.8, // meters above ground for walking
      carHeight: 1.5, // meters above ground for car
      maxSlope: 0.5, // maximum slope angle in radians (about 30 degrees)
      debugMode: process.env.NODE_ENV === "development", // Only enable debug in development
    }),
    []
  );
};

/**
 * Hook for managing keyboard input state
 */
const useKeyboardControls = () => {
  const keys = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keys.current.add(event.code);
    if (process.env.NODE_ENV === "development") {
      console.log(`[CesiumViewModeControls] Key pressed: ${event.code}`);
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keys.current.delete(event.code);
  }, []);

  const getPressedKeys = useCallback(() => keys.current, []);

  return {
    handleKeyDown,
    handleKeyUp,
    getPressedKeys,
  };
};

/**
 * Hook for managing pointer lock functionality
 */
const usePointerLock = () => {
  const handlePointerLockChange = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      if (document.pointerLockElement) {
        console.log("[CesiumViewModeControls] Pointer locked");
      } else {
        console.log("[CesiumViewModeControls] Pointer unlocked");
      }
    }
  }, []);

  return { handlePointerLockChange };
};

/**
 * Hook for ground detection and terrain interaction
 */
const useGroundDetection = (cesiumViewer: Cesium.Viewer | null) => {
  /**
   * Enhanced ground detection function with slope checking
   * @param position - The position to check ground height at
   * @param checkSlope - Whether to check for steep slopes
   * @returns Ground height or null if detection fails
   */
  const getGroundHeight = useCallback(
    (
      position: Cesium.Cartesian3,
      checkSlope: boolean = false
    ): number | null => {
      if (!cesiumViewer) return null;

      try {
        const cartographic =
          cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(position);
        if (!cartographic) return null;

        // Get terrain height at this position
        const terrainHeight = cesiumViewer.scene.globe.getHeight(cartographic);
        if (terrainHeight === undefined || terrainHeight === null) {
          // Fallback to ellipsoid height if terrain is not available
          return cartographic.height;
        }

        // If slope checking is enabled, check if the slope is too steep
        if (checkSlope) {
          const currentCartographic =
            cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
              cesiumViewer.camera.position
            );
          if (currentCartographic) {
            const currentHeight =
              cesiumViewer.scene.globe.getHeight(currentCartographic) ||
              currentCartographic.height;
            const heightDifference = Math.abs(terrainHeight - currentHeight);
            const distance = Cesium.Cartesian3.distance(
              position,
              cesiumViewer.camera.position
            );

            if (distance > 0) {
              const slope = Math.atan(heightDifference / distance);
              if (slope > 0.5) {
                // 30 degrees max slope
                // Slope is too steep, return current height to prevent movement
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `[Ground Detection] Slope too steep: ${((slope * 180) / Math.PI).toFixed(1)}° (max: 30.0°)`
                  );
                }
                return currentHeight;
              }
            }
          }
        }

        return terrainHeight;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Error getting ground height:", error);
        }
        return null;
      }
    },
    [cesiumViewer]
  );

  /**
   * Get current ground height for display purposes
   */
  const getCurrentGroundHeight = useCallback((): number | null => {
    if (!cesiumViewer) return null;
    return getGroundHeight(cesiumViewer.camera.position);
  }, [cesiumViewer, getGroundHeight]);

  return {
    getGroundHeight,
    getCurrentGroundHeight,
  };
};

/**
 * Hook for managing simulation state and animation
 */
const useSimulation = (
  cesiumViewer: Cesium.Viewer | null,
  getGroundHeight: (
    position: Cesium.Cartesian3,
    checkSlope?: boolean
  ) => number | null,
  getPressedKeys: () => Set<string>,
  params: SimulationParams
) => {
  const animationFrameId = useRef<number | null>(null);
  const isSimulating = useRef(false);
  const currentMode = useRef<SimulationMode>("orbit");

  // Car simulation refs
  const carDirection = useRef(new Cesium.Cartesian3(0, 0, 1));
  const carRotation = useRef(0);

  /**
   * Calculate movement direction vector from pressed keys
   */
  const calculateMovementVector = useCallback((): MovementVector => {
    const keys = getPressedKeys();
    return {
      x: (keys.has("KeyA") ? -1 : 0) + (keys.has("KeyD") ? 1 : 0),
      y: (keys.has("Space") ? 1 : 0) + (keys.has("ShiftLeft") ? -1 : 0),
      z: (keys.has("KeyW") ? -1 : 0) + (keys.has("KeyS") ? 1 : 0),
    };
  }, [getPressedKeys]);

  /**
   * Calculate turn vector from arrow keys
   */
  const calculateTurnVector = useCallback((): MovementVector => {
    const keys = getPressedKeys();
    return {
      x: (keys.has("ArrowUp") ? -1 : 0) + (keys.has("ArrowDown") ? 1 : 0),
      y: (keys.has("ArrowLeft") ? -1 : 0) + (keys.has("ArrowRight") ? 1 : 0),
      z: 0,
    };
  }, [getPressedKeys]);

  /**
   * Apply movement to camera position
   */
  const applyMovement = useCallback(
    (
      camera: Cesium.Camera,
      moveVector: MovementVector,
      speed: number,
      mode: SimulationMode
    ): void => {
      if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
        return;

      const direction = camera.direction;
      const up = camera.up;
      const right = camera.right;

      // Calculate move direction using Cesium math
      let moveDirection = new Cesium.Cartesian3(0, 0, 0);

      if (moveVector.z !== 0) {
        const forwardVector = Cesium.Cartesian3.multiplyByScalar(
          direction,
          moveVector.z,
          new Cesium.Cartesian3()
        );
        moveDirection = Cesium.Cartesian3.add(
          moveDirection,
          forwardVector,
          moveDirection
        );
      }

      if (moveVector.x !== 0) {
        const rightVector = Cesium.Cartesian3.multiplyByScalar(
          right,
          moveVector.x,
          new Cesium.Cartesian3()
        );
        moveDirection = Cesium.Cartesian3.add(
          moveDirection,
          rightVector,
          moveDirection
        );
      }

      if (moveVector.y !== 0) {
        const upVector = Cesium.Cartesian3.multiplyByScalar(
          up,
          moveVector.y,
          new Cesium.Cartesian3()
        );
        moveDirection = Cesium.Cartesian3.add(
          moveDirection,
          upVector,
          moveDirection
        );
      }

      if (Cesium.Cartesian3.magnitude(moveDirection) > 0) {
        // Normalize and scale by speed
        Cesium.Cartesian3.normalize(moveDirection, moveDirection);
        const scaledMovement = Cesium.Cartesian3.multiplyByScalar(
          moveDirection,
          speed * 0.016, // 60fps timing
          new Cesium.Cartesian3()
        );

        // Calculate new position
        const newPosition = Cesium.Cartesian3.add(
          camera.position,
          scaledMovement,
          new Cesium.Cartesian3()
        );

        // Apply ground detection for walk and car modes
        if (mode === "firstPerson" || mode === "car") {
          const groundHeight = getGroundHeight(newPosition, true);
          if (groundHeight !== null && cesiumViewer) {
            const cartographic =
              cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
                newPosition
              );
            if (cartographic) {
              const heightOffset =
                mode === "firstPerson" ? params.walkHeight : params.carHeight;
              cartographic.height = groundHeight + heightOffset;
              const groundPosition =
                cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(
                  cartographic
                );
              if (groundPosition) {
                camera.position = groundPosition;
              }
            }
          } else {
            camera.position = newPosition;
          }
        } else {
          camera.position = newPosition;
        }
      }
    },
    [getGroundHeight, cesiumViewer, params.walkHeight, params.carHeight]
  );

  /**
   * Handle car-specific movement with steering
   */
  const handleCarMovement = useCallback(
    (camera: Cesium.Camera, speed: number): void => {
      const keys = getPressedKeys();
      const turnSpeed = 0.03;

      let isMoving = false;
      let turnAmount = 0;

      if (keys.has("KeyW")) {
        isMoving = true;
        if (keys.has("KeyA")) turnAmount = turnSpeed; // Turn left
        if (keys.has("KeyD")) turnAmount = -turnSpeed; // Turn right
      } else if (keys.has("KeyS")) {
        isMoving = true;
        if (keys.has("KeyA")) turnAmount = -turnSpeed; // Turn right (when reversing)
        if (keys.has("KeyD")) turnAmount = turnSpeed; // Turn left (when reversing)
      }

      // Update car rotation
      if (turnAmount !== 0) {
        carRotation.current += turnAmount;
        carDirection.current = new Cesium.Cartesian3(
          Math.sin(carRotation.current),
          0,
          Math.cos(carRotation.current)
        );
      }

      // Move car forward/backward
      if (isMoving) {
        const moveDirection = Cesium.Cartesian3.multiplyByScalar(
          carDirection.current,
          keys.has("KeyS") ? -1 : 1,
          new Cesium.Cartesian3()
        );

        const scaledMovement = Cesium.Cartesian3.multiplyByScalar(
          moveDirection,
          speed * 0.016,
          new Cesium.Cartesian3()
        );

        const newPosition = Cesium.Cartesian3.add(
          camera.position,
          scaledMovement,
          new Cesium.Cartesian3()
        );

        // Apply ground detection
        const groundHeight = getGroundHeight(newPosition, true);
        if (groundHeight !== null && cesiumViewer) {
          const cartographic =
            cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
              newPosition
            );
          if (cartographic) {
            cartographic.height = groundHeight + params.carHeight;
            const groundPosition =
              cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(
                cartographic
              );
            if (groundPosition) {
              camera.position = groundPosition;
            }
          }
        } else {
          camera.position = newPosition;
        }

        // Update camera rotation to match car direction
        camera.setView({
          destination: camera.position,
          orientation: {
            heading: carRotation.current,
            pitch: 0,
            roll: 0,
          },
        });
      }
    },
    [getPressedKeys, getGroundHeight, cesiumViewer, params.carHeight]
  );

  /**
   * Main animation loop
   */
  const animate = useCallback(() => {
    if (!isSimulating.current || !cesiumViewer) {
      return;
    }

    const camera = cesiumViewer.camera;
    const mode = currentMode.current;

    // Get speed based on mode
    const speed =
      mode === "firstPerson"
        ? params.walkSpeed
        : mode === "car"
          ? params.carSpeed
          : mode === "flight"
            ? params.flightSpeed
            : 0;

    if (speed === 0) return;

    // Handle movement based on mode
    if (mode === "firstPerson") {
      const moveVector = calculateMovementVector();
      applyMovement(camera, moveVector, speed, mode);
    } else if (mode === "car") {
      handleCarMovement(camera, speed);
    } else if (mode === "flight") {
      const moveVector = calculateMovementVector();
      const turnVector = calculateTurnVector();

      applyMovement(camera, moveVector, speed, mode);

      // Apply rotation for flight mode
      if (turnVector.x !== 0 || turnVector.y !== 0) {
        if (turnVector.y !== 0) {
          camera.rotate(camera.up, turnVector.y * params.turnSpeed);
        }
        if (turnVector.x !== 0) {
          camera.rotate(camera.right, turnVector.x * params.turnSpeed);
        }
      }
    }

    // Continue animation loop
    animationFrameId.current = requestAnimationFrame(animate);
  }, [
    cesiumViewer,
    params,
    calculateMovementVector,
    calculateTurnVector,
    applyMovement,
    handleCarMovement,
  ]);

  /**
   * Start simulation
   */
  const startSimulation = useCallback(() => {
    if (!cesiumViewer) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Cesium viewer not available");
      }
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[CesiumViewModeControls] Starting simulation for mode: ${currentMode.current}`
      );
    }
    isSimulating.current = true;
    animationFrameId.current = requestAnimationFrame(animate);
  }, [cesiumViewer, animate]);

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[CesiumViewModeControls] Stopping simulation");
    }
    isSimulating.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  /**
   * Set current simulation mode
   */
  const setCurrentMode = useCallback((mode: SimulationMode) => {
    currentMode.current = mode;
  }, []);

  return {
    startSimulation,
    stopSimulation,
    setCurrentMode,
    isSimulating: isSimulating.current,
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
  const { handlePointerLockChange } = usePointerLock();
  const { getGroundHeight } = useGroundDetection(cesiumViewer);
  const { startSimulation, stopSimulation, setCurrentMode } = useSimulation(
    cesiumViewer,
    getGroundHeight,
    getPressedKeys,
    params
  );

  /**
   * Handle mouse movement for first-person look
   */
  const handleFirstPersonMouseMove = useCallback(
    (_event: MouseEvent) => {
      if (!cesiumViewer) return;

      // This would need to be connected to the simulation state
      // For now, we'll keep it simple
    },
    [cesiumViewer]
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
        // Stop current simulation
        stopSimulation();

        const controller = cesiumViewer.scene.screenSpaceCameraController;

        switch (mode) {
          case "orbit":
          case "explore": {
            // Enable default Cesium camera controls
            controller.enableRotate = true;
            controller.enableTranslate = true;
            controller.enableZoom = true;
            controller.enableTilt = true;

            if (mode === "explore") {
              cesiumViewer.scene.morphTo3D();
            }
            break;
          }
          case "firstPerson":
          case "car":
          case "flight": {
            // Disable default controls for simulation
            controller.enableRotate = false;
            controller.enableTranslate = false;
            controller.enableZoom = false;
            controller.enableTilt = false;

            // Start simulation
            startSimulation();
            break;
          }
          case "settings": {
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
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleFirstPersonMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleFirstPersonMouseMove);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      stopSimulation();
    };
  }, [
    handleKeyDown,
    handleKeyUp,
    handleFirstPersonMouseMove,
    handlePointerLockChange,
    stopSimulation,
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
            className={viewMode === "orbit" ? "active" : ""}
            onClick={() => handleViewModeChange("orbit")}
          >
            <ThreeSixty />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Explore Mode">
          <ViewModeButton
            className={viewMode === "explore" ? "active" : ""}
            onClick={() => handleViewModeChange("explore")}
          >
            <Explore />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Control Settings">
          <ViewModeButton
            className={viewMode === "settings" ? "active" : ""}
            onClick={() => handleViewModeChange("settings")}
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
          >
            <Person />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Car Mode (WASD Steering)">
          <ViewModeButton
            className={viewMode === "car" ? "active" : ""}
            onClick={() => handleViewModeChange("car")}
          >
            <DirectionsCarFilled />
          </ViewModeButton>
        </Tooltip>
        <Tooltip title="Flight Mode (WASD + Arrow Keys)">
          <ViewModeButton
            className={viewMode === "flight" ? "active" : ""}
            onClick={() => handleViewModeChange("flight")}
          >
            <FlightTakeoff />
          </ViewModeButton>
        </Tooltip>
      </ViewModeRow>
    </ViewModeSection>
  );
};

export default CesiumViewModeControls;
