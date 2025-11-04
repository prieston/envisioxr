import * as Cesium from "cesium";
import {
  BaseCameraController,
  CameraControllerConfig,
} from "./BaseCameraController";
import { FirstPersonWalkController } from "../controllers/FirstPersonWalkController";
import { CarDriveController } from "../controllers/CarDriveController";
import { DroneFlightController } from "../controllers/FlightController";
import { SimulationMode } from "../types";
import { SIMULATION_MODES } from "../constants";
import { createLogger } from "@envisio/core";

/**
 * Camera controller manager for handling different simulation modes
 */
export class CameraControllerManager {
  private cesiumViewer: Cesium.Viewer | null = null;
  private currentController: BaseCameraController | null = null;
  private controllers: Map<SimulationMode, BaseCameraController> = new Map();
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private logger = createLogger("CameraControllerManager");

  constructor(cesiumViewer: Cesium.Viewer | null) {
    this.cesiumViewer = cesiumViewer;
    this.initializeControllers();

    // Note: Tile provider errors are not critical and will be suppressed by Cesium
  }

  /**
   * Initialize all controllers
   */
  private initializeControllers(): void {
    if (!this.cesiumViewer) return;

    // Create controllers with default configurations
    const walkConfig: Partial<CameraControllerConfig> = {
      speed: 5,
      maxSpeed: 10,
      acceleration: 20,
      friction: 0.85,
      jumpForce: 8,
      gravity: -9.81,
      height: 1.8,
      sensitivity: 0.0005,
      debugMode: process.env.NODE_ENV === "development",
    };

    const carConfig: Partial<CameraControllerConfig> = {
      speed: 0, // not used by car controller
      maxSpeed: 45, // reference only, car has its own limits
      acceleration: 0, // not used, car uses forces
      friction: 0.98, // not used, car uses drag/rolling
      height: 1.4, // driver eye height
      sensitivity: 0.001, // not used (no mouse lock)
      debugMode: process.env.NODE_ENV === "development",
    };

    const flightConfig: Partial<CameraControllerConfig> = {
      speed: 0, // not used by drone controller
      maxSpeed: 240, // reference only, drone has its own limits
      acceleration: 135, // not used, drone uses forces
      friction: 0.92, // not used, drone uses damping
      height: 1.6, // eye height when clamping to ground
      sensitivity: 0.0016, // mouse sensitivity
      debugMode: process.env.NODE_ENV === "development",
    };

    // Initialize controllers
    this.controllers.set(
      "firstPerson",
      new FirstPersonWalkController(this.cesiumViewer, walkConfig)
    );
    this.controllers.set(
      "car",
      new CarDriveController(this.cesiumViewer, carConfig)
    );
    this.controllers.set(
      "flight",
      new DroneFlightController(this.cesiumViewer, flightConfig)
    );

    this.logger.debug("Controllers initialized");
  }

  /**
   * Switch to a different simulation mode
   */
  switchToMode(mode: SimulationMode): void {
    if (!this.cesiumViewer) {
      this.logger.warn("Cesium viewer not available");
      return;
    }

    // Stop current controller
    if (this.currentController) {
      this.currentController.dispose();
      this.currentController = null;
    }

    // Handle special modes
    if (
      mode === SIMULATION_MODES.ORBIT ||
      mode === SIMULATION_MODES.EXPLORE ||
      mode === SIMULATION_MODES.SETTINGS
    ) {
      this.enableDefaultCesiumControls(mode);
      return;
    }

    // Get new controller
    const newController = this.controllers.get(mode);
    if (!newController) {
      this.logger.warn(`No controller found for mode: ${mode}`);
      return;
    }

    // Initialize and start new controller
    newController.initialize();
    this.currentController = newController;

    // Start animation loop if not already running
    if (!this.isRunning) {
      this.startAnimationLoop();
    }

    this.logger.info(`Switched to mode: ${mode}`);
  }

  /**
   * Enable default Cesium camera controls
   */
  private enableDefaultCesiumControls(mode: SimulationMode): void {
    if (!this.cesiumViewer) return;

    const controller = this.cesiumViewer.scene.screenSpaceCameraController;

    switch (mode) {
      case SIMULATION_MODES.ORBIT:
        controller.enableRotate = true;
        controller.enableTranslate = true;
        controller.enableZoom = true;
        controller.enableTilt = true;
        break;
      case SIMULATION_MODES.EXPLORE:
        controller.enableRotate = true;
        controller.enableTranslate = true;
        controller.enableZoom = true;
        controller.enableTilt = true;
        this.cesiumViewer.scene.morphTo3D();
        break;
      case SIMULATION_MODES.SETTINGS:
        // Keep current camera state
        break;
    }

    // Stop animation loop
    this.stopAnimationLoop();
  }

  /**
   * Start animation loop
   */
  private startAnimationLoop(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.logger.debug("Animation loop started");
  }

  /**
   * Stop animation loop
   */
  private stopAnimationLoop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.logger.debug("Animation loop stopped");
  }

  /**
   * Animation loop
   */
  private animate = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update current controller
    if (this.currentController && this.currentController.isEnabled()) {
      this.currentController.update(deltaTime);
    }

    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Update controller configuration
   */
  updateControllerConfig(
    mode: SimulationMode,
    config: Partial<CameraControllerConfig>
  ): void {
    const controller = this.controllers.get(mode);
    if (controller) {
      controller.updateConfig(config);

      this.logger.debug(`Updated config for mode: ${mode}`);
    }
  }

  /**
   * Get current controller
   */
  getCurrentController(): BaseCameraController | null {
    return this.currentController;
  }

  /**
   * Get controller for specific mode
   */
  getController(mode: SimulationMode): BaseCameraController | null {
    return this.controllers.get(mode) || null;
  }

  /**
   * Check if a mode is currently active
   */
  isModeActive(mode: SimulationMode): boolean {
    if (
      mode === SIMULATION_MODES.ORBIT ||
      mode === SIMULATION_MODES.EXPLORE ||
      mode === SIMULATION_MODES.SETTINGS
    ) {
      return !this.isRunning;
    }
    return this.currentController === this.controllers.get(mode);
  }

  /**
   * Dispose all controllers and cleanup
   */
  dispose(): void {
    // Stop animation loop
    this.stopAnimationLoop();

    // Dispose current controller
    if (this.currentController) {
      this.currentController.dispose();
      this.currentController = null;
    }

    // Dispose all controllers
    this.controllers.forEach((controller) => {
      controller.dispose();
    });
    this.controllers.clear();

    this.logger.debug("Disposed");
  }

  /**
   * Update Cesium viewer reference
   */
  updateCesiumViewer(cesiumViewer: Cesium.Viewer | null): void {
    this.cesiumViewer = cesiumViewer;

    // Reinitialize controllers with new viewer
    this.controllers.forEach((controller) => {
      controller.dispose();
    });
    this.controllers.clear();

    this.initializeControllers();
  }
}
