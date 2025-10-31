import * as Cesium from "cesium";
/** Interface that all controllers implement */
export interface IBaseCameraController {
    initialize(): void;
    update(deltaTime: number): void;
    dispose(): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
}
/** Camera state */
export interface CameraState {
    position: Cesium.Cartesian3;
    direction: Cesium.Cartesian3;
    up: Cesium.Cartesian3;
    right: Cesium.Cartesian3;
    yaw: number;
    pitch: number;
    roll: number;
}
/** Input state */
export interface InputState {
    keys: Set<string>;
    mouseDelta: {
        x: number;
        y: number;
    };
    isPointerLocked: boolean;
    isMouseDown: boolean;
}
/** Physics state */
export interface PhysicsState {
    velocity: Cesium.Cartesian3;
    isGrounded: boolean;
    jumpVelocity: number;
    friction: number;
}
/** Config */
export interface CameraControllerConfig {
    sensitivity: number;
    speed: number;
    maxSpeed: number;
    acceleration: number;
    friction: number;
    jumpForce: number;
    gravity: number;
    height: number;
    debugMode: boolean;
}
/** Base class */
export declare abstract class BaseCameraController implements IBaseCameraController {
    private static __instanceSeq;
    protected __instanceId: number;
    protected cesiumViewer: Cesium.Viewer | null;
    protected camera: Cesium.Camera | null;
    protected enabled: boolean;
    protected config: CameraControllerConfig;
    protected cameraState: CameraState;
    protected inputState: InputState;
    protected physicsState: PhysicsState;
    protected logger: {
        debug: (...args: unknown[]) => void;
        info: (...args: unknown[]) => void;
        warn: (...args: unknown[]) => void;
        error: (...args: unknown[]) => void;
    };
    protected keyDownHandler?: (event: KeyboardEvent) => void;
    protected keyUpHandler?: (event: KeyboardEvent) => void;
    protected mouseMoveHandler?: (event: MouseEvent) => void;
    protected mouseDownHandler?: (event: MouseEvent) => void;
    protected mouseUpHandler?: (event: MouseEvent) => void;
    protected pointerLockChangeHandler?: () => void;
    protected stepAccumulator: number;
    private __lastApplied;
    constructor(cesiumViewer: Cesium.Viewer | null, config?: Partial<CameraControllerConfig>);
    protected createInitialCameraState(): CameraState;
    /** Sync from Cesium camera */
    protected updateCameraState(): void;
    /** Apply world position + orientation vectors to Cesium */
    protected applyCameraState(): void;
    /** ENU helpers */
    protected enuTransformAt(pos: Cesium.Cartesian3): Cesium.Matrix4;
    protected enuBasisAt(pos: Cesium.Cartesian3): {
        east: Cesium.Cartesian3;
        north: Cesium.Cartesian3;
        up: Cesium.Cartesian3;
        m: Cesium.Matrix4;
    };
    /**
     * Compute world orientation from ENU + yaw/pitch and set camera directly in world space.
     * (Safer than lookAtTransform; avoids transient invalid states.)
     */
    protected applyYawPitchWorldFromENU(pos: Cesium.Cartesian3, yaw: number, pitch: number): void;
    /** Fixed-step accumulator (default 120Hz) */
    protected fixedUpdate(dt: number, step: number, maxSteps: number, fn: (h: number) => void): void;
    /** Pointer lock (canvas-scoped) */
    protected requestPointerLock(): void;
    protected exitPointerLock(): void;
    /** Ground height (null if terrain not ready) */
    protected getGroundHeight(position: Cesium.Cartesian3): number | null;
    protected handleKeyDown: (e: KeyboardEvent) => void;
    protected handleKeyUp: (e: KeyboardEvent) => void;
    protected handleMouseMove: (e: MouseEvent) => void;
    protected handleMouseDown: (e: MouseEvent) => void;
    protected handleMouseUp: (e: MouseEvent) => void;
    protected handlePointerLockChange: () => void;
    abstract initialize(): void;
    abstract update(deltaTime: number): void;
    abstract dispose(): void;
    protected onKeyDown(_e: KeyboardEvent): void;
    protected onKeyUp(_e: KeyboardEvent): void;
    protected onMouseMove(_e: MouseEvent): void;
    protected onMouseDown(_e: MouseEvent): void;
    protected onMouseUp(_e: MouseEvent): void;
    protected onPointerLockChange(): void;
    setEnabled(enabled: boolean): void;
    isEnabled(): boolean;
    updateConfig(newConfig: Partial<CameraControllerConfig>): void;
}
//# sourceMappingURL=BaseCameraController.d.ts.map