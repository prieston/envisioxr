import * as Cesium from "cesium";
import { BaseCameraController, CameraControllerConfig } from "./BaseCameraController";
import { SimulationMode } from "../types";
/**
 * Camera controller manager for handling different simulation modes
 */
export declare class CameraControllerManager {
    private cesiumViewer;
    private currentController;
    private controllers;
    private animationFrameId;
    private isRunning;
    private lastTime;
    private logger;
    constructor(cesiumViewer: Cesium.Viewer | null);
    /**
     * Initialize all controllers
     */
    private initializeControllers;
    /**
     * Switch to a different simulation mode
     */
    switchToMode(mode: SimulationMode): void;
    /**
     * Enable default Cesium camera controls
     */
    private enableDefaultCesiumControls;
    /**
     * Start animation loop
     */
    private startAnimationLoop;
    /**
     * Stop animation loop
     */
    private stopAnimationLoop;
    /**
     * Animation loop
     */
    private animate;
    /**
     * Update controller configuration
     */
    updateControllerConfig(mode: SimulationMode, config: Partial<CameraControllerConfig>): void;
    /**
     * Get current controller
     */
    getCurrentController(): BaseCameraController | null;
    /**
     * Get controller for specific mode
     */
    getController(mode: SimulationMode): BaseCameraController | null;
    /**
     * Check if a mode is currently active
     */
    isModeActive(mode: SimulationMode): boolean;
    /**
     * Dispose all controllers and cleanup
     */
    dispose(): void;
    /**
     * Update Cesium viewer reference
     */
    updateCesiumViewer(cesiumViewer: Cesium.Viewer | null): void;
}
//# sourceMappingURL=CameraControllerManager.d.ts.map