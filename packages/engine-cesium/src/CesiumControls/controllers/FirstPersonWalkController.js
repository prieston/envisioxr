import * as Cesium from "cesium";
import { BaseCameraController, } from "../core/BaseCameraController";
import { MOVEMENT_KEYS } from "../constants";
import { createLogger } from "../../utils/logger";
/**
 * First-person walk controller:
 * - Fixed-timestep physics (120 Hz)
 * - ENU mouselook (world-space setView)
 * - WASD accel + friction, Shift boost
 * - Jump/gravity, terrain landing (smoothed), crouch
 */
export class FirstPersonWalkController extends BaseCameraController {
    constructor(cesiumViewer, config = {}) {
        super(cesiumViewer, Object.assign({ speed: 4, maxSpeed: 7, acceleration: 30, friction: 0.85, jumpForce: 5, gravity: -9.81, height: 1.7, sensitivity: 0.0018, debugMode: false }, config));
        this.isJumping = false;
        this.lastGroundHeight = 0;
        this.smoothedGroundHeight = Number.NaN; // handles sea-level init
        this.__dbg = {
            frame: 0,
            lastPos: new Cesium.Cartesian3(Number.NaN, Number.NaN, Number.NaN),
            lastGroundDelta: Number.NaN,
            jitterMax: 0,
        };
        this.wasGrounded = false;
        this.lastTargetHeight = null; // sticky target height above terrain
        // ====== Hooks overriding Base behavior where needed ======
        this.onMouseDown = (e) => {
            if (e.button === 0) {
                // Only request pointer lock if not already locked (backup for drag-to-look)
                if (!this.inputState.isPointerLocked) {
                    this.logger.debug("Requesting pointer lock (backup)...");
                    this.requestPointerLock();
                }
            }
        };
        this.onPointerLockChange = () => {
            // Base updates isPointerLocked; nothing extra needed here.
        };
        this.onKeyDown = (e) => {
            // Prevent page scroll/shortcuts for movement keys
            const codes = new Set(Object.values(MOVEMENT_KEYS));
            if (codes.has(e.code))
                e.preventDefault();
        };
        // Re-tag logger with controller-specific prefix
        this.logger = createLogger("FPW");
    }
    initialize() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (!this.cesiumViewer) {
            this.logger.warn("No Cesium viewer available");
            return;
        }
        this.logger.debug("Initializing with canvas:", {
            hasCanvas: !!this.cesiumViewer.canvas,
            canvasElement: this.cesiumViewer.canvas,
            canvasStyle: (_b = (_a = this.cesiumViewer.canvas) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.pointerEvents,
            canvasZIndex: (_d = (_c = this.cesiumViewer.canvas) === null || _c === void 0 ? void 0 : _c.style) === null || _d === void 0 ? void 0 : _d.zIndex,
            canvasPosition: (_f = (_e = this.cesiumViewer.canvas) === null || _e === void 0 ? void 0 : _e.style) === null || _f === void 0 ? void 0 : _f.position,
            canvasDisplay: (_h = (_g = this.cesiumViewer.canvas) === null || _g === void 0 ? void 0 : _g.style) === null || _h === void 0 ? void 0 : _h.display,
            canvasVisibility: (_k = (_j = this.cesiumViewer.canvas) === null || _j === void 0 ? void 0 : _j.style) === null || _k === void 0 ? void 0 : _k.visibility,
        });
        // Ensure canvas can receive pointer events
        if (this.cesiumViewer.canvas) {
            this.cesiumViewer.canvas.style.pointerEvents = "auto";
            this.cesiumViewer.canvas.style.cursor = "crosshair";
            this.logger.debug("Set canvas pointer events to auto");
        }
        // Bind & attach DOM listeners
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
        // Mouse events for drag-to-look (backup to pointer lock)
        this.cesiumViewer.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.cesiumViewer.canvas.addEventListener("mouseup", this.mouseUpHandler);
        // Disable default Cesium camera interactions
        const ctrl = this.cesiumViewer.scene.screenSpaceCameraController;
        ctrl.enableRotate = false;
        ctrl.enableTranslate = false;
        ctrl.enableZoom = false;
        ctrl.enableTilt = false;
        // Clear keys & start on ground at current lon/lat
        this.inputState.keys.clear();
        this.initializeCameraPosition();
        this.enabled = true;
        if (this.config.debugMode)
            this.logger.debug("Initialized");
    }
    update(deltaTime) {
        if (!this.enabled || !this.camera)
            return;
        const clamped = Math.min(deltaTime, 0.05);
        // count how many fixed steps ran
        // let steps = 0;
        this.fixedUpdate(clamped, 1 / 120, 6, (h) => {
            // steps++;
            this.stepOnce(h);
        });
        // Apply ENU yaw/pitch once per frame
        this.applyYawPitch();
        // --- diagnostics ---
        if (this.config.debugMode) {
            const p = this.cameraState.position;
            if (Number.isFinite(p.x) &&
                Number.isFinite(p.y) &&
                Number.isFinite(p.z)) {
                const last = this.__dbg.lastPos;
                const dp = Number.isFinite(last.x)
                    ? Cesium.Cartesian3.distance(p, last)
                    : 0;
                this.__dbg.jitterMax = Math.max(this.__dbg.jitterMax, dp);
                this.__dbg.lastPos = Cesium.Cartesian3.clone(p);
                // Throttle logs (every ~30 frames)
                if (this.__dbg.frame++ % 30 === 0) {
                    // const horizMag = Math.hypot(
                    //   this.physicsState.velocity.x,
                    //   this.physicsState.velocity.y
                    // );
                    // const setViewCalls = (window as any).__camSetViewCalls ?? 0;
                    // (window as any).__camSetViewCalls = 0; // reset counter
                    // // console.log("[FPW dbg]", {
                    //   inst: (this as any).__instanceId,
                    //   frame: this.__dbg.frame,
                    //   steps,
                    //   dp, // per-frame position delta
                    //   jitterMax: this.__dbg.jitterMax,
                    //   grounded: this.physicsState.isGrounded,
                    //   jumpV: this.physicsState.jumpVelocity.toFixed(3),
                    //   v_h: horizMag.toFixed(3),
                    //   targetH: (this.smoothedGroundHeight + this.config.height).toFixed(
                    //     3
                    //   ),
                    //   yaw: this.cameraState.yaw.toFixed(3),
                    //   pitch: this.cameraState.pitch.toFixed(3),
                    //   setViewCallsThisWindow: setViewCalls,
                    //   pointerLocked: this.inputState.isPointerLocked,
                    // });
                }
            }
        }
        // -------------------
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
    /** One fixed physics step */
    stepOnce(h) {
        // 1) Horizontal movement relative to camera direction (FPS-style)
        const moveInput = new Cesium.Cartesian3(this.inputState.keys.has(MOVEMENT_KEYS.LEFT)
            ? -1
            : this.inputState.keys.has(MOVEMENT_KEYS.RIGHT)
                ? 1
                : 0, 0, this.inputState.keys.has(MOVEMENT_KEYS.FORWARD)
            ? -1
            : this.inputState.keys.has(MOVEMENT_KEYS.BACKWARD)
                ? 1
                : 0);
        if (Cesium.Cartesian3.magnitude(moveInput) > 0) {
            Cesium.Cartesian3.normalize(moveInput, moveInput);
        }
        // --- Local basis
        const up = this.cameraState.up; // ENU up at current position
        // forward = camera direction projected onto local tangent plane
        const dir = this.cameraState.direction;
        const dirDotUp = Cesium.Cartesian3.dot(dir, up);
        const forward = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(dir, Cesium.Cartesian3.multiplyByScalar(up, dirDotUp, new Cesium.Cartesian3()), new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // right = forward × up (already normalized in applyYawPitch, but recompute for safety)
        const right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(forward, up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        const worldMove = new Cesium.Cartesian3(0, 0, 0);
        if (moveInput.z !== 0) {
            Cesium.Cartesian3.add(worldMove, Cesium.Cartesian3.multiplyByScalar(forward, -moveInput.z, new Cesium.Cartesian3()), worldMove);
        }
        if (moveInput.x !== 0) {
            Cesium.Cartesian3.add(worldMove, Cesium.Cartesian3.multiplyByScalar(right, moveInput.x, new Cesium.Cartesian3()), worldMove);
        }
        if (Cesium.Cartesian3.magnitude(worldMove) > 0) {
            Cesium.Cartesian3.normalize(worldMove, worldMove);
        }
        const boost = this.inputState.keys.has("ShiftLeft") ||
            this.inputState.keys.has("ShiftRight")
            ? 2.0
            : 1.0;
        // --- Split velocity into horizontal (tangent) + vertical (along up)
        const v = this.physicsState.velocity;
        const vDotUp = Cesium.Cartesian3.dot(v, up);
        let vHoriz = Cesium.Cartesian3.subtract(v, Cesium.Cartesian3.multiplyByScalar(up, vDotUp, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // --- Accel / friction on horizontal only
        if (Cesium.Cartesian3.magnitude(worldMove) > 0) {
            const a = this.config.acceleration * boost * h;
            Cesium.Cartesian3.add(vHoriz, Cesium.Cartesian3.multiplyByScalar(worldMove, a, new Cesium.Cartesian3()), vHoriz);
        }
        else {
            vHoriz = Cesium.Cartesian3.multiplyByScalar(vHoriz, this.config.friction, vHoriz);
            if (Cesium.Cartesian3.magnitude(vHoriz) < 0.01) {
                vHoriz = new Cesium.Cartesian3(0, 0, 0);
            }
        }
        // --- Clamp horizontal speed
        const maxH = this.config.maxSpeed * boost;
        const vHorizMag = Cesium.Cartesian3.magnitude(vHoriz);
        if (vHorizMag > maxH) {
            Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.normalize(vHoriz, new Cesium.Cartesian3()), maxH, vHoriz);
        }
        // --- Vertical (jump/gravity) along 'up'
        if (this.inputState.keys.has(MOVEMENT_KEYS.JUMP) &&
            this.physicsState.isGrounded &&
            !this.isJumping) {
            this.physicsState.jumpVelocity = this.config.jumpForce;
            this.physicsState.isGrounded = false;
            this.isJumping = true;
        }
        if (!this.physicsState.isGrounded) {
            this.physicsState.jumpVelocity += this.config.gravity * h;
        }
        else if (!this.inputState.keys.has(MOVEMENT_KEYS.JUMP)) {
            this.physicsState.jumpVelocity = 0;
        }
        const vVert = Cesium.Cartesian3.multiplyByScalar(up, this.physicsState.jumpVelocity, new Cesium.Cartesian3());
        // --- Compose full velocity and integrate
        this.physicsState.velocity = Cesium.Cartesian3.add(vHoriz, vVert, new Cesium.Cartesian3());
        // 3) Integrate position
        const delta = Cesium.Cartesian3.multiplyByScalar(this.physicsState.velocity, h, new Cesium.Cartesian3());
        const proposed = Cesium.Cartesian3.add(this.cameraState.position, delta, new Cesium.Cartesian3());
        if (!Number.isFinite(proposed.x) ||
            !Number.isFinite(proposed.y) ||
            !Number.isFinite(proposed.z)) {
            return; // guard
        }
        // 4) Ground resolve & crouch; write back cameraState.position
        const resolved = this.resolveGround(proposed);
        this.handleCrouch(resolved);
        this.cameraState.position = resolved;
    }
    /** Terrain landing + smoothing */
    resolveGround(proposed) {
        if (!proposed ||
            !Number.isFinite(proposed.x) ||
            !Number.isFinite(proposed.y) ||
            !Number.isFinite(proposed.z)) {
            return this.cameraState.position;
        }
        const globe = this.cesiumViewer.scene.globe;
        const ellipsoid = globe.ellipsoid;
        const carto = Cesium.Cartographic.fromCartesian(proposed, ellipsoid);
        if (!carto)
            return this.cameraState.position;
        const hRaw = globe.getHeight(carto);
        if (hRaw !== undefined) {
            // gentler smoothing to avoid chasing every tile refinement
            const a = 0.15; // was 0.30
            if (!Number.isNaN(this.smoothedGroundHeight)) {
                this.smoothedGroundHeight =
                    this.smoothedGroundHeight + a * (hRaw - this.smoothedGroundHeight);
            }
            else {
                this.smoothedGroundHeight = hRaw;
            }
            // target = ground + eye height + safety clearance
            const CLEAR = 0.25; // 25 cm above ground
            const targetRaw = this.smoothedGroundHeight + this.config.height + CLEAR;
            // STICKY: only update our target if it moved significantly
            const TARGET_HOLD_BAND = 0.2; // 20 cm – ignore tiny terrain shifts
            if (this.lastTargetHeight == null) {
                this.lastTargetHeight = targetRaw;
            }
            else if (Math.abs(targetRaw - this.lastTargetHeight) > TARGET_HOLD_BAND) {
                this.lastTargetHeight = targetRaw;
            }
            const target = this.lastTargetHeight;
            // Decide how to resolve height
            const belowBy = target - carto.height; // + means we're below target
            const SNAP_UP_EPS = 0.1; // snap up if > 10 cm below
            const FALL_EPS = 0.5; // consider falling if > 50 cm above while jumping
            let groundedNow = this.wasGrounded;
            if (belowBy >= SNAP_UP_EPS || !this.isJumping) {
                // Land / stay landed at sticky target
                carto.height = target;
                const landed = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height);
                this.physicsState.isGrounded = true;
                this.isJumping = false;
                groundedNow = true;
                this.lastGroundHeight = this.smoothedGroundHeight;
                // Log only on transition
                if (this.config.debugMode && !this.wasGrounded) {
                    this.logger.debug("LAND", {
                        inst: this.__instanceId,
                        target,
                    });
                }
                this.wasGrounded = groundedNow;
                return landed;
            }
            // Still above target: only "AIR" if truly above and jumping
            if (belowBy <= -FALL_EPS && this.isJumping) {
                this.physicsState.isGrounded = false;
                groundedNow = false;
                if (this.config.debugMode && this.wasGrounded) {
                    this.logger.debug("AIR", {
                        inst: this.__instanceId,
                        cartoH: carto.height,
                        target,
                    });
                }
                this.wasGrounded = groundedNow;
                return proposed;
            }
            // Within deadband: accept proposed, stay grounded (no snap)
            this.physicsState.isGrounded = true;
            groundedNow = true;
            this.wasGrounded = groundedNow;
            return proposed;
        }
        // No terrain yet — keep altitude, neutralize vertical
        this.physicsState.isGrounded = true;
        this.physicsState.jumpVelocity = 0;
        this.physicsState.velocity.z = 0;
        this.wasGrounded = true;
        return proposed;
    }
    /** Crouch lowers eye height while grounded */
    handleCrouch(currentPos) {
        if (!this.physicsState.isGrounded)
            return;
        if (!this.inputState.keys.has(MOVEMENT_KEYS.CROUCH))
            return;
        const carto = Cesium.Cartographic.fromCartesian(currentPos);
        carto.height = this.lastGroundHeight + this.config.height * 0.6;
        const crouched = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height);
        this.cameraState.position = crouched;
    }
    /** Apply ENU yaw/pitch based on accumulated mouseDelta (pointer-locked only) */
    applyYawPitch() {
        const dx = this.inputState.mouseDelta.x;
        const dy = this.inputState.mouseDelta.y;
        if (dx !== 0 || dy !== 0) {
            const yawDelta = dx * this.config.sensitivity;
            const pitchDelta = -dy * this.config.sensitivity;
            this.cameraState.yaw = Cesium.Math.negativePiToPi(this.cameraState.yaw + yawDelta);
            this.cameraState.pitch = Cesium.Math.clamp(this.cameraState.pitch + pitchDelta, -Cesium.Math.PI_OVER_TWO + 0.1, Cesium.Math.PI_OVER_TWO - 0.1);
        }
        // Compute world orientation from ENU at the *authoritative* position
        const { east, north, up } = this.enuBasisAt(this.cameraState.position);
        // Direction in ENU (x=east, y=north, z=up)
        const dirLocal = new Cesium.Cartesian3(Math.cos(this.cameraState.pitch) * Math.sin(this.cameraState.yaw), Math.cos(this.cameraState.pitch) * Math.cos(this.cameraState.yaw), Math.sin(this.cameraState.pitch));
        // Convert to world
        const dirWorld = new Cesium.Cartesian3(east.x * dirLocal.x + north.x * dirLocal.y + up.x * dirLocal.z, east.y * dirLocal.x + north.y * dirLocal.y + up.y * dirLocal.z, east.z * dirLocal.x + north.z * dirLocal.y + up.z * dirLocal.z);
        Cesium.Cartesian3.normalize(dirWorld, dirWorld);
        // Update cameraState (authoritative)
        this.cameraState.direction = dirWorld;
        this.cameraState.up = up;
        // NEW: keep right orthonormal to (direction, up)
        this.cameraState.right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.cameraState.direction, this.cameraState.up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // Now apply exactly once per frame
        this.applyCameraState();
    }
    /** Start grounded at current lon/lat */
    initializeCameraPosition() {
        var _a;
        if (!this.camera || !this.cesiumViewer)
            return;
        this.physicsState.isGrounded = true;
        this.physicsState.velocity = new Cesium.Cartesian3(0, 0, 0);
        this.physicsState.jumpVelocity = 0;
        // Use current lon/lat and snap to ground + eye height
        const pos = Cesium.Cartesian3.clone(this.camera.position);
        const globe = this.cesiumViewer.scene.globe;
        const c = Cesium.Cartographic.fromCartesian(pos, globe.ellipsoid);
        if (!c)
            return;
        const h = (_a = globe.getHeight(c)) !== null && _a !== void 0 ? _a : c.height - this.config.height;
        this.lastGroundHeight = h;
        this.smoothedGroundHeight = h;
        c.height = h + this.config.height;
        this.cameraState.position = Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height);
        // Initialize yaw/pitch from current direction projected into ENU
        const { east, north, up } = this.enuBasisAt(this.cameraState.position);
        const dirWorld = Cesium.Cartesian3.normalize(Cesium.Cartesian3.clone(this.camera.direction), new Cesium.Cartesian3());
        const ex = Cesium.Cartesian3.dot(dirWorld, east);
        const ny = Cesium.Cartesian3.dot(dirWorld, north);
        const uz = Cesium.Cartesian3.dot(dirWorld, up);
        this.cameraState.yaw = Math.atan2(ex, ny); // 0=North, +→East
        this.cameraState.pitch = Cesium.Math.clamp(Math.asin(uz), -Cesium.Math.PI_OVER_TWO + 0.1, Cesium.Math.PI_OVER_TWO - 0.1);
        // Apply initial orientation
        this.applyYawPitchWorldFromENU(this.cameraState.position, this.cameraState.yaw, this.cameraState.pitch);
        // Set right vector after initial orientation
        this.cameraState.right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.cameraState.direction, this.cameraState.up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    }
}
