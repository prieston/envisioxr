import * as Cesium from "cesium";
import { BaseCameraController, CameraControllerConfig } from "../core/BaseCameraController";
/**
 * First-person walk controller:
 * - Fixed-timestep physics (120 Hz)
 * - ENU mouselook (world-space setView)
 * - WASD accel + friction, Shift boost
 * - Jump/gravity, terrain landing (smoothed), crouch
 */
export declare class FirstPersonWalkController extends BaseCameraController {
    private isJumping;
    private lastGroundHeight;
    private smoothedGroundHeight;
    private __dbg;
    private wasGrounded;
    private lastTargetHeight;
    constructor(cesiumViewer: Cesium.Viewer | null, config?: Partial<CameraControllerConfig>);
    initialize(): void;
    update(deltaTime: number): void;
    dispose(): void;
    /** One fixed physics step */
    private stepOnce;
    /** Terrain landing + smoothing */
    private resolveGround;
    /** Crouch lowers eye height while grounded */
    private handleCrouch;
    /** Apply ENU yaw/pitch based on accumulated mouseDelta (pointer-locked only) */
    private applyYawPitch;
    /** Start grounded at current lon/lat */
    private initializeCameraPosition;
    protected onMouseDown: (e: MouseEvent) => void;
    protected onPointerLockChange: () => void;
    protected onKeyDown: (e: KeyboardEvent) => void;
}
//# sourceMappingURL=FirstPersonWalkController.d.ts.map