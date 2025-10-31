// DroneFlightController.ts
import * as Cesium from "cesium";
import { BaseCameraController, } from "../core/BaseCameraController";
import { MOVEMENT_KEYS } from "../constants";
/**
 * Drone flight controller
 * - Pointer-lock mouselook (yaw/pitch), no roll
 * - WASD = horizontal move relative to view
 * - Space = up, Shift = down
 * - Smooth damping + per-axis speed limits
 */
export class DroneFlightController extends BaseCameraController {
    constructor(viewer, config = {}) {
        super(viewer, Object.assign({ speed: 0, maxSpeed: 240, acceleration: 135, friction: 0.92, jumpForce: 0, gravity: 0, height: 1.6, sensitivity: 0.0016, debugMode: false }, config));
        // Physics state uses Base.physicsState.velocity (full 3D)
        // Drone feel / limits (internal)
        this.drone = {
            accelHoriz: 135, // m/s^2 horizontal (7.5x faster acceleration)
            accelVert: 90, // m/s^2 vertical (7.5x faster acceleration)
            maxHorizSpeed: 240, // m/s (9.6x faster max speed)
            maxVertSpeed: 120, // m/s up/down (10x faster vertical)
            dampActive: 0.985, // per fixed-step (when input present)
            dampIdle: 0.92, // per fixed-step (no input)
            minAGL: 1.0, // meters above terrain (safety floor)
        };
        // === Hooks ===
        this.onMouseDown = (e) => {
            if (e.button === 0)
                this.requestPointerLock();
        };
        this.onKeyDown = (e) => {
            // Prevent page scroll / browser shortcuts for flight keys
            const codes = new Set([
                MOVEMENT_KEYS.FORWARD,
                MOVEMENT_KEYS.BACKWARD,
                MOVEMENT_KEYS.LEFT,
                MOVEMENT_KEYS.RIGHT,
                MOVEMENT_KEYS.JUMP, // Space -> up
                "ShiftLeft",
                "ShiftRight", // down
            ]);
            if (codes.has(e.code))
                e.preventDefault();
        };
    }
    initialize() {
        if (!this.cesiumViewer)
            return;
        // Bind DOM handlers (pointer lock like FPW)
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        this.keyUpHandler = (e) => this.handleKeyUp(e);
        this.mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.mouseDownHandler = (e) => this.handleMouseDown(e);
        this.mouseUpHandler = (e) => this.handleMouseUp(e);
        this.pointerLockChangeHandler = () => this.handlePointerLockChange();
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("pointerlockchange", this.pointerLockChangeHandler);
        // Click canvas to request pointer lock
        this.cesiumViewer.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.cesiumViewer.canvas.addEventListener("mouseup", this.mouseUpHandler);
        // Disable default Cesium camera interactions
        const ctrl = this.cesiumViewer.scene.screenSpaceCameraController;
        ctrl.enableRotate = false;
        ctrl.enableTranslate = false;
        ctrl.enableZoom = false;
        ctrl.enableTilt = false;
        // Initialize pose from current camera
        this.inputState.keys.clear();
        this.initializeFromCamera();
        this.enabled = true;
    }
    update(deltaTime) {
        if (!this.enabled || !this.camera)
            return;
        const clamped = Math.min(deltaTime, 0.05);
        this.fixedUpdate(clamped, 1 / 120, 6, (h) => this.stepOnce(h));
        // Apply yaw/pitch once per frame from accumulated mouse delta
        this.applyYawPitch();
        this.inputState.mouseDelta = { x: 0, y: 0 };
    }
    dispose() {
        if (this.keyDownHandler)
            document.removeEventListener("keydown", this.keyDownHandler);
        if (this.keyUpHandler)
            document.removeEventListener("keyup", this.keyUpHandler);
        if (this.mouseMoveHandler)
            document.removeEventListener("mousemove", this.mouseMoveHandler);
        if (this.pointerLockChangeHandler)
            document.removeEventListener("pointerlockchange", this.pointerLockChangeHandler);
        if (this.mouseDownHandler && this.cesiumViewer) {
            this.cesiumViewer.canvas.removeEventListener("mousedown", this.mouseDownHandler);
            this.cesiumViewer.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        }
        if (this.cesiumViewer) {
            const ctrl = this.cesiumViewer.scene.screenSpaceCameraController;
            ctrl.enableRotate = true;
            ctrl.enableTranslate = true;
            ctrl.enableZoom = true;
            ctrl.enableTilt = true;
        }
        this.enabled = false;
    }
    /** Fixed-step integration */
    stepOnce(h) {
        // --- Build inputs ---
        const moveF = (this.inputState.keys.has(MOVEMENT_KEYS.FORWARD) ? 1 : 0) +
            (this.inputState.keys.has(MOVEMENT_KEYS.BACKWARD) ? -1 : 0);
        const moveR = (this.inputState.keys.has(MOVEMENT_KEYS.RIGHT) ? 1 : 0) +
            (this.inputState.keys.has(MOVEMENT_KEYS.LEFT) ? -1 : 0);
        const moveU = (this.inputState.keys.has(MOVEMENT_KEYS.JUMP) ? 1 : 0) + // Space -> up
            (this.inputState.keys.has("ShiftLeft") ||
                this.inputState.keys.has("ShiftRight")
                ? -1
                : 0); // Shift -> down
        // --- Local ENU basis at current position ---
        const { up } = this.enuBasisAt(this.cameraState.position);
        // View-relative horizontal basis:
        // forward = camera direction projected onto tangent plane
        const dir = this.cameraState.direction;
        const dirDotUp = Cesium.Cartesian3.dot(dir, up);
        const forwardHoriz = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(dir, Cesium.Cartesian3.multiplyByScalar(up, dirDotUp, new Cesium.Cartesian3()), new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // right = forward × up
        const rightHoriz = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(forwardHoriz, up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // --- Desired accelerations ---
        const aHoriz = new Cesium.Cartesian3(0, 0, 0);
        if (moveF !== 0) {
            Cesium.Cartesian3.add(aHoriz, Cesium.Cartesian3.multiplyByScalar(forwardHoriz, moveF, new Cesium.Cartesian3()), aHoriz);
        }
        if (moveR !== 0) {
            Cesium.Cartesian3.add(aHoriz, Cesium.Cartesian3.multiplyByScalar(rightHoriz, moveR, new Cesium.Cartesian3()), aHoriz);
        }
        if (Cesium.Cartesian3.magnitude(aHoriz) > 0) {
            Cesium.Cartesian3.normalize(aHoriz, aHoriz);
            Cesium.Cartesian3.multiplyByScalar(aHoriz, this.drone.accelHoriz, aHoriz);
        }
        const aVert = moveU !== 0
            ? Cesium.Cartesian3.multiplyByScalar(up, moveU * this.drone.accelVert, new Cesium.Cartesian3())
            : new Cesium.Cartesian3(0, 0, 0);
        // --- Update velocity with damping ---
        // Mild damping if there is input, stronger if idle.
        const anyInput = moveF !== 0 || moveR !== 0 || moveU !== 0;
        const damp = anyInput ? this.drone.dampActive : this.drone.dampIdle;
        this.physicsState.velocity = Cesium.Cartesian3.multiplyByScalar(this.physicsState.velocity, damp, new Cesium.Cartesian3());
        // Integrate acceleration
        const aTotal = Cesium.Cartesian3.add(aHoriz, aVert, new Cesium.Cartesian3());
        Cesium.Cartesian3.add(this.physicsState.velocity, Cesium.Cartesian3.multiplyByScalar(aTotal, h, new Cesium.Cartesian3()), this.physicsState.velocity);
        // --- Clamp speeds (separate horizontal vs vertical) ---
        const v = this.physicsState.velocity;
        const vDotUp = Cesium.Cartesian3.dot(v, up);
        let vHoriz = Cesium.Cartesian3.subtract(v, Cesium.Cartesian3.multiplyByScalar(up, vDotUp, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        const vHorizMag = Cesium.Cartesian3.magnitude(vHoriz);
        if (vHorizMag > this.drone.maxHorizSpeed) {
            vHoriz = Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.normalize(vHoriz, new Cesium.Cartesian3()), this.drone.maxHorizSpeed, vHoriz);
        }
        const vVert = Cesium.Math.clamp(vDotUp, -this.drone.maxVertSpeed, this.drone.maxVertSpeed);
        // Recompose velocity
        this.physicsState.velocity = Cesium.Cartesian3.add(vHoriz, Cesium.Cartesian3.multiplyByScalar(up, vVert, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // --- Integrate position ---
        const delta = Cesium.Cartesian3.multiplyByScalar(this.physicsState.velocity, h, new Cesium.Cartesian3());
        let proposed = Cesium.Cartesian3.add(this.cameraState.position, delta, new Cesium.Cartesian3());
        // --- Optional AGL clamp (don't go below terrain + margin) ---
        const globe = this.cesiumViewer.scene.globe;
        const ellipsoid = globe.ellipsoid;
        const carto = Cesium.Cartographic.fromCartesian(proposed, ellipsoid);
        if (carto) {
            const terrain = globe.getHeight(carto);
            if (terrain !== undefined) {
                const minH = terrain + this.drone.minAGL + this.config.height;
                if (carto.height < minH) {
                    // clamp and kill downward velocity
                    carto.height = minH;
                    proposed = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height);
                    // remove downward component
                    const vNewDotUp = Cesium.Cartesian3.dot(this.physicsState.velocity, up);
                    if (vNewDotUp < 0) {
                        // zero vertical if descending
                        this.physicsState.velocity = vHoriz; // vertical set to 0
                    }
                }
            }
        }
        this.cameraState.position = proposed;
        // Orientation is handled in applyYawPitch() per-frame; keep up = ENU up
        this.cameraState.up = up;
        // Apply to Cesium
        this.applyCameraState();
    }
    /** Apply ENU yaw/pitch (pointer-locked only) */
    applyYawPitch() {
        const dx = this.inputState.mouseDelta.x;
        const dy = this.inputState.mouseDelta.y;
        if (dx !== 0 || dy !== 0) {
            const yawDelta = dx * this.config.sensitivity;
            const pitchDelta = -dy * this.config.sensitivity;
            this.cameraState.yaw = Cesium.Math.negativePiToPi(this.cameraState.yaw + yawDelta);
            this.cameraState.pitch = Cesium.Math.clamp(this.cameraState.pitch + pitchDelta, -Cesium.Math.PI_OVER_TWO + 0.05, Cesium.Math.PI_OVER_TWO - 0.05);
        }
        // Compute world direction from ENU yaw/pitch, keep roll = 0
        const { east, north, up } = this.enuBasisAt(this.cameraState.position);
        const dirLocal = new Cesium.Cartesian3(Math.cos(this.cameraState.pitch) * Math.sin(this.cameraState.yaw), // x=east
        Math.cos(this.cameraState.pitch) * Math.cos(this.cameraState.yaw), // y=north
        Math.sin(this.cameraState.pitch) // z=up
        );
        const dirWorld = new Cesium.Cartesian3(east.x * dirLocal.x + north.x * dirLocal.y + up.x * dirLocal.z, east.y * dirLocal.x + north.y * dirLocal.y + up.y * dirLocal.z, east.z * dirLocal.x + north.z * dirLocal.y + up.z * dirLocal.z);
        Cesium.Cartesian3.normalize(dirWorld, dirWorld);
        this.cameraState.direction = dirWorld;
        this.cameraState.up = up;
        this.cameraState.right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.cameraState.direction, this.cameraState.up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        this.applyCameraState();
    }
    /** Initialize position & yaw/pitch from the current Cesium camera */
    initializeFromCamera() {
        if (!this.camera || !this.cesiumViewer)
            return;
        // Start from current camera position; ensure we are above terrain by minAGL
        const globe = this.cesiumViewer.scene.globe;
        const pos = Cesium.Cartesian3.clone(this.camera.position);
        const c = Cesium.Cartographic.fromCartesian(pos, globe.ellipsoid);
        if (!c)
            return;
        const terrain = globe.getHeight(c);
        const minH = (terrain !== null && terrain !== void 0 ? terrain : c.height) + this.drone.minAGL + this.config.height;
        if (c.height < minH)
            c.height = minH;
        this.cameraState.position = Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height);
        // Yaw/pitch from current direction in ENU
        const { east, north, up } = this.enuBasisAt(this.cameraState.position);
        const d = Cesium.Cartesian3.normalize(Cesium.Cartesian3.clone(this.camera.direction), new Cesium.Cartesian3());
        const ex = Cesium.Cartesian3.dot(d, east);
        const ny = Cesium.Cartesian3.dot(d, north);
        const uz = Cesium.Cartesian3.dot(d, up);
        this.cameraState.yaw = Math.atan2(ex, ny);
        this.cameraState.pitch = Cesium.Math.clamp(Math.asin(uz), -Cesium.Math.PI_OVER_TWO + 0.05, Cesium.Math.PI_OVER_TWO - 0.05);
        // Set initial orientation
        this.applyYawPitch();
        // Reset velocity
        this.physicsState.velocity = new Cesium.Cartesian3(0, 0, 0);
    }
}
