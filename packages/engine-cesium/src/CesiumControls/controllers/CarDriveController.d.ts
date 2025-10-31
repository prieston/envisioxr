import * as Cesium from "cesium";
import { BaseCameraController, CameraControllerConfig } from "../core/BaseCameraController";
/**
 * Car / drive controller (no mouse lock)
 * W/S = throttle, A/D = steer, Space = brake, Shift = boost
 */
export declare class CarDriveController extends BaseCameraController {
    private speed;
    private heading;
    private steer;
    private lastGroundHeight;
    private smoothedGroundHeight;
    private lastTargetHeight;
    private wasGrounded;
    private blurHandler?;
    private visHandler?;
    private car;
    constructor(viewer: Cesium.Viewer | null, config?: Partial<CameraControllerConfig>);
    initialize(): void;
    update(dt: number): void;
    dispose(): void;
    private stepOnce;
    private resolveGround;
    private initializePoseFromCurrentCamera;
    protected onKeyDown: (e: KeyboardEvent) => void;
}
//# sourceMappingURL=CarDriveController.d.ts.map