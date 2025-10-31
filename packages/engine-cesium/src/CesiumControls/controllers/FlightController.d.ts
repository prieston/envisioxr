import * as Cesium from "cesium";
import { BaseCameraController, CameraControllerConfig } from "../core/BaseCameraController";
/**
 * Drone flight controller
 * - Pointer-lock mouselook (yaw/pitch), no roll
 * - WASD = horizontal move relative to view
 * - Space = up, Shift = down
 * - Smooth damping + per-axis speed limits
 */
export declare class DroneFlightController extends BaseCameraController {
    private drone;
    constructor(viewer: Cesium.Viewer | null, config?: Partial<CameraControllerConfig>);
    initialize(): void;
    update(deltaTime: number): void;
    dispose(): void;
    /** Fixed-step integration */
    private stepOnce;
    /** Apply ENU yaw/pitch (pointer-locked only) */
    private applyYawPitch;
    /** Initialize position & yaw/pitch from the current Cesium camera */
    private initializeFromCamera;
    protected onMouseDown: (e: MouseEvent) => void;
    protected onKeyDown: (e: KeyboardEvent) => void;
}
//# sourceMappingURL=FlightController.d.ts.map