import { useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { SimulationMode, SimulationParams } from "../types";
import { SIMULATION_MODES } from "../constants";
import { useFirstPersonWalk } from "./useFirstPersonWalk";
import { createLogger } from "@envisio/core";

/**
 * Hook for managing simulation state and animation
 *
 * @param cesiumViewer - The Cesium viewer instance
 * @param getGroundHeight - Function to get ground height
 * @param getPressedKeys - Function to get currently pressed keys
 * @param params - Simulation parameters
 * @param applyMovement - Function to apply movement
 * @param handleCarMovement - Function to handle car movement
 * @returns Object containing simulation control functions
 */
export const useSimulation = (
  cesiumViewer: Cesium.Viewer | null,
  getGroundHeight: (
    position: Cesium.Cartesian3,
    checkSlope?: boolean
  ) => number | null,
  getPressedKeys: () => Set<string>,
  params: SimulationParams,
  applyMovement: (
    camera: Cesium.Camera,
    cesiumViewer: Cesium.Viewer,
    moveVector: any,
    speed: number,
    mode: string,
    getGroundHeight: (
      position: Cesium.Cartesian3,
      checkSlope?: boolean
    ) => number | null,
    params: SimulationParams
  ) => void,
  handleCarMovement: (
    camera: Cesium.Camera,
    cesiumViewer: Cesium.Viewer,
    speed: number,
    getGroundHeight: (
      position: Cesium.Cartesian3,
      checkSlope?: boolean
    ) => number | null,
    params: SimulationParams
  ) => void
) => {
  const logger = createLogger("Simulation");
  // Initialize enhanced walk simulation
  const { applyWalkMovement } = useFirstPersonWalk(
    cesiumViewer,
    getGroundHeight,
    getPressedKeys,
    params
  );
  const animationFrameId = useRef<number | null>(null);
  const isSimulating = useRef(false);
  const currentMode = useRef<SimulationMode>("orbit");

  /**
   * Main animation loop
   */
  const animate = useCallback(() => {
    if (!isSimulating.current || !cesiumViewer) {
      return;
    }

    // Debug: Log simulation heartbeat (less frequent)
    if (Math.random() < 0.1) {
      logger.debug(`[Simulation] Heartbeat - Mode: ${currentMode.current}`);
    }

    const camera = cesiumViewer.camera;
    const mode = currentMode.current;

    // Get speed based on mode
    const speed =
      mode === SIMULATION_MODES.FIRST_PERSON
        ? params.walkSpeed
        : mode === SIMULATION_MODES.CAR
          ? params.carSpeed
          : mode === SIMULATION_MODES.FLIGHT
            ? params.flightSpeed
            : 0;

    if (speed === 0) return;

    // Handle movement based on mode
    if (mode === SIMULATION_MODES.FIRST_PERSON) {
      // Use enhanced first-person walk simulation
      applyWalkMovement(camera, 0.016); // 60fps timing
    } else if (mode === SIMULATION_MODES.CAR) {
      handleCarMovement(camera, cesiumViewer, speed, getGroundHeight, params);
    } else if (mode === SIMULATION_MODES.FLIGHT) {
      // Flight: WASD for movement, Arrow keys for rotation
      const moveVector = { x: 0, y: 0, z: 0 };
      const turnVector = { x: 0, y: 0 };
      const keys = getPressedKeys();

      if (keys.has("KeyW")) moveVector.z = -1;
      if (keys.has("KeyS")) moveVector.z = 1;
      if (keys.has("KeyA")) moveVector.x = -1;
      if (keys.has("KeyD")) moveVector.x = 1;
      if (keys.has("Space")) moveVector.y = 1;
      if (keys.has("ShiftLeft")) moveVector.y = -1;

      // Handle rotation keys
      if (keys.has("ArrowLeft")) turnVector.y = -1;
      if (keys.has("ArrowRight")) turnVector.y = 1;
      if (keys.has("ArrowUp")) turnVector.x = -1;
      if (keys.has("ArrowDown")) turnVector.x = 1;

      applyMovement(
        camera,
        cesiumViewer,
        moveVector,
        speed,
        mode,
        getGroundHeight,
        params
      );

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
    getPressedKeys,
    applyMovement,
    handleCarMovement,
    getGroundHeight,
  ]);

  /**
   * Start simulation
   */
  const startSimulation = useCallback(() => {
    if (!cesiumViewer) {
      logger.warn("Cesium viewer not available");
      return;
    }

    logger.debug(
      `[CesiumViewModeControls] Starting simulation for mode: ${currentMode.current}`
    );

    isSimulating.current = true;
    animationFrameId.current = requestAnimationFrame(animate);
  }, [cesiumViewer, animate]);

  /**
   * Stop simulation
   */
  const stopSimulation = useCallback(() => {
    logger.debug("[CesiumViewModeControls] Stopping simulation");
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

  /**
   * Get current simulation state
   */
  const getSimulationState = useCallback(
    () => ({
      isSimulating: isSimulating.current,
      currentMode: currentMode.current,
    }),
    []
  );

  return {
    startSimulation,
    stopSimulation,
    setCurrentMode,
    getSimulationState,
  };
};
