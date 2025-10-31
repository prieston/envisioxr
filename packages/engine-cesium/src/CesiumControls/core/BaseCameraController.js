import * as Cesium from "cesium";
import { createLogger } from "../../utils/logger";
/** Base class */
export class BaseCameraController {
    constructor(cesiumViewer, config = {}) {
        var _a;
        this.__instanceId = ++BaseCameraController.__instanceSeq;
        this.cesiumViewer = null;
        this.camera = null;
        this.enabled = false;
        this.logger = createLogger("BaseCameraController");
        // Fixed-step accumulator
        this.stepAccumulator = 0;
        this.__lastApplied = {
            pos: new Cesium.Cartesian3(Number.NaN, Number.NaN, Number.NaN),
            dir: new Cesium.Cartesian3(Number.NaN, Number.NaN, Number.NaN),
            up: new Cesium.Cartesian3(Number.NaN, Number.NaN, Number.NaN),
        };
        // Default/bindable handlers
        this.handleKeyDown = (e) => {
            this.inputState.keys.add(e.code);
            this.onKeyDown(e);
        };
        this.handleKeyUp = (e) => {
            this.inputState.keys.delete(e.code);
            this.onKeyUp(e);
        };
        this.handleMouseMove = (e) => {
            var _a, _b, _c, _d, _f;
            const canvas = (_b = (_a = this.cesiumViewer) === null || _a === void 0 ? void 0 : _a.canvas) !== null && _b !== void 0 ? _b : null;
            const locked = document.pointerLockElement === canvas;
            this.inputState.isPointerLocked = locked;
            // Accept deltas when pointer-locked OR while dragging on the canvas
            const isDragOnCanvas = this.inputState.isMouseDown &&
                (e.target === canvas ||
                    (canvas ? (_f = (_c = e.composedPath) === null || _c === void 0 ? void 0 : (_d = _c.call(e)).includes) === null || _f === void 0 ? void 0 : _f.call(_d, canvas) : false));
            if (!locked && !isDragOnCanvas) {
                return; // ignore stray moves
            }
            // ACCUMULATE (not overwrite) in case several mousemove events fire per frame
            this.inputState.mouseDelta.x += e.movementX || 0;
            this.inputState.mouseDelta.y += e.movementY || 0;
            if (this.config.debugMode) {
                this.logger.debug("mouseMove", {
                    locked,
                    dragging: isDragOnCanvas,
                    dx: e.movementX || 0,
                    dy: e.movementY || 0,
                    accX: this.inputState.mouseDelta.x,
                    accY: this.inputState.mouseDelta.y,
                });
            }
            this.onMouseMove(e);
        };
        this.handleMouseDown = (e) => {
            this.inputState.isMouseDown = true;
            this.onMouseDown(e);
        };
        this.handleMouseUp = (e) => {
            this.inputState.isMouseDown = false;
            this.onMouseUp(e);
        };
        this.handlePointerLockChange = () => {
            var _a, _b;
            const canvas = (_b = (_a = this.cesiumViewer) === null || _a === void 0 ? void 0 : _a.canvas) !== null && _b !== void 0 ? _b : null;
            this.inputState.isPointerLocked = document.pointerLockElement === canvas;
            this.inputState.mouseDelta = { x: 0, y: 0 };
            if (this.config.debugMode) {
                this.logger.debug("pointerLocked:", this.inputState.isPointerLocked);
            }
            this.onPointerLockChange();
        };
        this.cesiumViewer = cesiumViewer;
        this.camera = (_a = cesiumViewer === null || cesiumViewer === void 0 ? void 0 : cesiumViewer.camera) !== null && _a !== void 0 ? _a : null;
        this.config = Object.assign({ sensitivity: 0.0005, speed: 10, maxSpeed: 20, acceleration: 20, friction: 0.85, jumpForce: 5, gravity: -9.81, height: 1.8, debugMode: false }, config);
        this.cameraState = this.createInitialCameraState();
        this.inputState = {
            keys: new Set(),
            mouseDelta: { x: 0, y: 0 },
            isPointerLocked: false,
            isMouseDown: false,
        };
        this.physicsState = {
            velocity: new Cesium.Cartesian3(0, 0, 0),
            isGrounded: false,
            jumpVelocity: 0,
            friction: this.config.friction,
        };
    }
    createInitialCameraState() {
        if (!this.camera) {
            return {
                position: new Cesium.Cartesian3(0, 0, 0),
                direction: new Cesium.Cartesian3(0, 1, 0),
                up: new Cesium.Cartesian3(0, 0, 1),
                right: new Cesium.Cartesian3(1, 0, 0),
                yaw: 0,
                pitch: 0,
                roll: 0,
            };
        }
        return {
            position: Cesium.Cartesian3.clone(this.camera.position),
            direction: Cesium.Cartesian3.clone(this.camera.direction),
            up: Cesium.Cartesian3.clone(this.camera.up),
            right: Cesium.Cartesian3.clone(this.camera.right),
            yaw: 0,
            pitch: 0,
            roll: 0,
        };
    }
    /** Sync from Cesium camera */
    updateCameraState() {
        if (!this.camera)
            return;
        this.cameraState.position = Cesium.Cartesian3.clone(this.camera.position);
        this.cameraState.direction = Cesium.Cartesian3.clone(this.camera.direction);
        this.cameraState.up = Cesium.Cartesian3.clone(this.camera.up);
        this.cameraState.right = Cesium.Cartesian3.clone(this.camera.right);
        this.cameraState.yaw = Math.atan2(this.cameraState.direction.y, this.cameraState.direction.x);
        this.cameraState.pitch = Math.asin(this.cameraState.direction.z);
    }
    /** Apply world position + orientation vectors to Cesium */
    applyCameraState() {
        var _a;
        if (!this.camera)
            return;
        const p = this.cameraState.position, d = this.cameraState.direction, u = this.cameraState.up;
        if (!p ||
            !d ||
            !u ||
            !Number.isFinite(p.x) ||
            !Number.isFinite(p.y) ||
            !Number.isFinite(p.z) ||
            !Number.isFinite(d.x) ||
            !Number.isFinite(d.y) ||
            !Number.isFinite(d.z) ||
            !Number.isFinite(u.x) ||
            !Number.isFinite(u.y) ||
            !Number.isFinite(u.z))
            return;
        // thresholds: 1 cm position, ~0.1° orientation
        const POS_EPS = 0.01;
        const ANG_EPS_DOT = Math.cos(Cesium.Math.toRadians(0.1)); // ~0.001745 rad
        const last = this.__lastApplied;
        const posDelta = Number.isNaN(last.pos.x)
            ? Number.POSITIVE_INFINITY
            : Cesium.Cartesian3.distance(p, last.pos);
        // IMPORTANT: do NOT Math.abs here; opposite directions must NOT be treated as "same"
        const dirDot = Number.isNaN(last.dir.x)
            ? -1
            : Cesium.Cartesian3.dot(d, last.dir);
        const upDot = Number.isNaN(last.up.x)
            ? -1
            : Cesium.Cartesian3.dot(u, last.up);
        const dirClose = dirDot > ANG_EPS_DOT;
        const upClose = upDot > ANG_EPS_DOT;
        if (posDelta < POS_EPS && dirClose && upClose) {
            return; // no meaningful change
        }
        if (this.config.debugMode) {
            // very light log (once every ~30 frames – throttled by subclass below)
            window.__camSetViewCalls =
                ((_a = window.__camSetViewCalls) !== null && _a !== void 0 ? _a : 0) + 1;
        }
        this.camera.setView({
            destination: p,
            orientation: { direction: d, up: u },
        });
        Cesium.Cartesian3.clone(p, last.pos);
        Cesium.Cartesian3.clone(d, last.dir);
        Cesium.Cartesian3.clone(u, last.up);
    }
    /** ENU helpers */
    enuTransformAt(pos) {
        return Cesium.Transforms.eastNorthUpToFixedFrame(pos);
    }
    enuBasisAt(pos) {
        const m = this.enuTransformAt(pos);
        const east = new Cesium.Cartesian3(m[0], m[1], m[2]);
        const north = new Cesium.Cartesian3(m[4], m[5], m[6]);
        const up = new Cesium.Cartesian3(m[8], m[9], m[10]);
        Cesium.Cartesian3.normalize(east, east);
        Cesium.Cartesian3.normalize(north, north);
        Cesium.Cartesian3.normalize(up, up);
        return { east, north, up, m };
    }
    /**
     * Compute world orientation from ENU + yaw/pitch and set camera directly in world space.
     * (Safer than lookAtTransform; avoids transient invalid states.)
     */
    applyYawPitchWorldFromENU(pos, yaw, pitch) {
        if (!this.camera)
            return;
        if (!pos ||
            !Number.isFinite(pos.x) ||
            !Number.isFinite(pos.y) ||
            !Number.isFinite(pos.z) ||
            !Number.isFinite(yaw) ||
            !Number.isFinite(pitch))
            return;
        const { east, north, up } = this.enuBasisAt(pos);
        // dir in ENU local (x=east, y=north, z=up)
        const dirLocal = new Cesium.Cartesian3(Math.cos(pitch) * Math.sin(yaw), Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch));
        // to world
        const dirWorld = new Cesium.Cartesian3(east.x * dirLocal.x + north.x * dirLocal.y + up.x * dirLocal.z, east.y * dirLocal.x + north.y * dirLocal.y + up.y * dirLocal.z, east.z * dirLocal.x + north.z * dirLocal.y + up.z * dirLocal.z);
        Cesium.Cartesian3.normalize(dirWorld, dirWorld);
        this.camera.setView({
            destination: pos,
            orientation: { direction: dirWorld, up },
        });
        this.updateCameraState();
    }
    /** Fixed-step accumulator (default 120Hz) */
    fixedUpdate(dt, step = 1 / 120, maxSteps = 6, fn) {
        this.stepAccumulator += dt;
        let i = 0;
        while (this.stepAccumulator >= step && i < maxSteps) {
            fn(step);
            this.stepAccumulator -= step;
            i++;
        }
    }
    /** Pointer lock (canvas-scoped) */
    requestPointerLock() {
        var _a;
        const canvas = (_a = this.cesiumViewer) === null || _a === void 0 ? void 0 : _a.canvas;
        if (this.config.debugMode) {
            this.logger.debug("requestPointerLock", {
                hasCanvas: !!canvas,
                hasRequestPointerLock: !!(canvas === null || canvas === void 0 ? void 0 : canvas.requestPointerLock),
                currentLocked: document.pointerLockElement === canvas,
            });
        }
        if (canvas === null || canvas === void 0 ? void 0 : canvas.requestPointerLock)
            canvas.requestPointerLock();
    }
    exitPointerLock() {
        if (document.pointerLockElement)
            document.exitPointerLock();
    }
    /** Ground height (null if terrain not ready) */
    getGroundHeight(position) {
        if (!this.cesiumViewer)
            return null;
        try {
            const carto = Cesium.Cartographic.fromCartesian(position);
            const h = this.cesiumViewer.scene.globe.getHeight(carto);
            return h === undefined ? null : h;
        }
        catch (_a) {
            return null;
        }
    }
    // Overridable hooks
    onKeyDown(_e) { }
    onKeyUp(_e) { }
    onMouseMove(_e) { }
    onMouseDown(_e) { }
    onMouseUp(_e) { }
    onPointerLockChange() { }
    // Enable/disable
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    // Live config update
    updateConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
        this.physicsState.friction = this.config.friction;
    }
}
BaseCameraController.__instanceSeq = 0;
