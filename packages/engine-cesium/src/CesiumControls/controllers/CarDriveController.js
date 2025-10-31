// CarDriveController.ts
import * as Cesium from "cesium";
import { BaseCameraController, } from "../core/BaseCameraController";
import { MOVEMENT_KEYS } from "../constants";
/**
 * Car / drive controller (no mouse lock)
 * W/S = throttle, A/D = steer, Space = brake, Shift = boost
 */
export class CarDriveController extends BaseCameraController {
    constructor(viewer, config = {}) {
        super(viewer, Object.assign({ speed: 0, maxSpeed: 45, acceleration: 0, friction: 1, jumpForce: 0, gravity: -9.81, height: 1.4, sensitivity: 0.001, debugMode: false }, config));
        // --- car state ---
        this.speed = 0; // m/s (+ forward, - reverse)
        this.heading = 0; // ENU yaw (rad, 0=N, +→E)
        this.steer = 0; // front-wheel steer angle (rad, left negative)
        // --- terrain state ---
        this.lastGroundHeight = 0;
        this.smoothedGroundHeight = Number.NaN;
        this.lastTargetHeight = null;
        this.wasGrounded = true;
        // --- car parameters ---
        this.car = {
            // geometry / steering
            wheelBase: 2.7, // m
            maxSteer: Cesium.Math.toRadians(18), // rad
            steerRate: Cesium.Math.toRadians(10), // rad/s toward max
            steerReturnRate: Cesium.Math.toRadians(180), // rad/s back to zero
            // forces (N) and resistances
            mass: 1400, // kg
            engineForce: 9000, // N (punchier launch)
            engineBrakeForce: 2600, // N (applies when throttle=0)
            brakeForce: 22000, // N (Space)
            dragCoef: 0.6, // N / (m/s)^2 (quadratic)
            viscousCoef: 180, // N per (m/s) (linear damping, helps low-speed stop)
            muRoll: 0.02, // rolling resistance coeff (F = μ m g)
            // speeds
            maxFwdSpeed: 45, // m/s (~160 km/h)
            maxRevSpeed: 14, // m/s
            boostFactor: 1.6, // x engineForce & max speeds when Shift
            // camera placement
            groundClear: 0.45, // m above ground in addition to eye height
        };
        // prevent page scroll
        this.onKeyDown = (e) => {
            const codes = new Set([
                MOVEMENT_KEYS.FORWARD,
                MOVEMENT_KEYS.BACKWARD,
                MOVEMENT_KEYS.LEFT,
                MOVEMENT_KEYS.RIGHT,
                MOVEMENT_KEYS.JUMP, // brake
                "ShiftLeft",
                "ShiftRight",
            ]);
            if (codes.has(e.code))
                e.preventDefault();
        };
    }
    initialize() {
        if (!this.cesiumViewer)
            return;
        // Keys only
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        this.keyUpHandler = (e) => this.handleKeyUp(e);
        document.addEventListener("keydown", this.keyDownHandler);
        document.addEventListener("keyup", this.keyUpHandler);
        // Clear stuck keys on blur / hide
        this.blurHandler = () => this.inputState.keys.clear();
        this.visHandler = () => {
            if (document.hidden)
                this.inputState.keys.clear();
        };
        window.addEventListener("blur", this.blurHandler);
        document.addEventListener("visibilitychange", this.visHandler);
        // Disable Cesium default camera
        const ctrl = this.cesiumViewer.scene.screenSpaceCameraController;
        ctrl.enableRotate = false;
        ctrl.enableTranslate = false;
        ctrl.enableZoom = false;
        ctrl.enableTilt = false;
        this.inputState.keys.clear();
        this.initializePoseFromCurrentCamera();
        this.enabled = true;
    }
    update(dt) {
        if (!this.enabled || !this.camera)
            return;
        const clamped = Math.min(dt, 0.05);
        this.fixedUpdate(clamped, 1 / 120, 6, (h) => this.stepOnce(h));
    }
    dispose() {
        if (this.keyDownHandler)
            document.removeEventListener("keydown", this.keyDownHandler);
        if (this.keyUpHandler)
            document.removeEventListener("keyup", this.keyUpHandler);
        if (this.blurHandler)
            window.removeEventListener("blur", this.blurHandler);
        if (this.visHandler)
            document.removeEventListener("visibilitychange", this.visHandler);
        if (this.cesiumViewer) {
            const ctrl = this.cesiumViewer.scene.screenSpaceCameraController;
            ctrl.enableRotate = true;
            ctrl.enableTranslate = true;
            ctrl.enableZoom = true;
            ctrl.enableTilt = true;
        }
        this.enabled = false;
    }
    // ---- core integration ----
    stepOnce(h) {
        // 1) Inputs
        const throttle = (this.inputState.keys.has(MOVEMENT_KEYS.FORWARD) ? 1 : 0) +
            (this.inputState.keys.has(MOVEMENT_KEYS.BACKWARD) ? -1 : 0);
        const steerInput = (this.inputState.keys.has(MOVEMENT_KEYS.LEFT) ? -1 : 0) +
            (this.inputState.keys.has(MOVEMENT_KEYS.RIGHT) ? 1 : 0);
        const braking = this.inputState.keys.has(MOVEMENT_KEYS.JUMP); // Space
        const boosting = this.inputState.keys.has("ShiftLeft") ||
            this.inputState.keys.has("ShiftRight");
        // 2) Steering (rate-limited, returns to center)
        if (steerInput !== 0) {
            this.steer += steerInput * this.car.steerRate * h;
            this.steer = Cesium.Math.clamp(this.steer, -this.car.maxSteer, this.car.maxSteer);
        }
        else {
            const sgn = Math.sign(this.steer);
            const mag = Math.max(0, Math.abs(this.steer) - this.car.steerReturnRate * h);
            this.steer = sgn * mag;
            if (Math.abs(this.steer) < 1e-4)
                this.steer = 0;
        }
        // 3) Longitudinal forces (N)
        const boostMul = boosting ? this.car.boostFactor : 1;
        // engine drive (positive or negative with S)
        const F_engine = throttle * (this.car.engineForce * boostMul);
        // engine braking (ONLY when no throttle & not braking)
        const F_engineBrake = throttle === 0 && !braking && this.speed !== 0
            ? -Math.sign(this.speed) * this.car.engineBrakeForce
            : 0;
        // service brake
        const F_brake = braking
            ? -Math.sign(this.speed || throttle || 1) * this.car.brakeForce
            : 0;
        // resistances
        const F_drag = -this.car.dragCoef * this.speed * Math.abs(this.speed); // ~v^2
        const F_visc = -this.car.viscousCoef * this.speed; // ~v
        const F_roll = this.speed !== 0
            ? -this.car.muRoll * this.car.mass * 9.81 * Math.sign(this.speed) // μ m g
            : 0;
        const F_total = F_engine + F_engineBrake + F_brake + F_drag + F_visc + F_roll;
        const a = F_total / this.car.mass;
        this.speed += a * h;
        // limit speeds
        const maxFwd = this.car.maxFwdSpeed * boostMul;
        const maxRev = this.car.maxRevSpeed * (boostMul * 0.9);
        if (this.speed > maxFwd)
            this.speed = maxFwd;
        if (this.speed < -maxRev)
            this.speed = -maxRev;
        // snap to zero when nearly stopped and no input
        if (throttle === 0 && !braking && Math.abs(this.speed) < 0.15)
            this.speed = 0;
        // 4) Heading (kinematic bicycle). Reverse flips turn sense automatically.
        const yawRate = (this.speed / this.car.wheelBase) * Math.tan(this.steer); // rad/s
        this.heading = Cesium.Math.negativePiToPi(this.heading + yawRate * h);
        // 5) ENU basis & forward on tangent plane
        const { east, north, up } = this.enuBasisAt(this.cameraState.position);
        const fLocal = new Cesium.Cartesian3(Math.sin(this.heading), Math.cos(this.heading), 0);
        const forward = new Cesium.Cartesian3(east.x * fLocal.x + north.x * fLocal.y, east.y * fLocal.x + north.y * fLocal.y, east.z * fLocal.x + north.z * fLocal.y);
        Cesium.Cartesian3.normalize(forward, forward);
        // 6) Integrate position
        const delta = Cesium.Cartesian3.multiplyByScalar(forward, this.speed * h, new Cesium.Cartesian3());
        const proposed = Cesium.Cartesian3.add(this.cameraState.position, delta, new Cesium.Cartesian3());
        if (!Number.isFinite(proposed.x) ||
            !Number.isFinite(proposed.y) ||
            !Number.isFinite(proposed.z))
            return;
        // 7) Terrain resolve (height smoothing + sticky target)
        const resolved = this.resolveGround(proposed);
        this.cameraState.position = resolved;
        // 8) Camera orientation along heading
        this.cameraState.direction = forward;
        this.cameraState.up = up;
        this.cameraState.right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.cameraState.direction, this.cameraState.up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        this.applyCameraState();
    }
    // ---- terrain helpers ----
    resolveGround(proposed) {
        const globe = this.cesiumViewer.scene.globe;
        const ellipsoid = globe.ellipsoid;
        const carto = Cesium.Cartographic.fromCartesian(proposed, ellipsoid);
        if (!carto)
            return this.cameraState.position;
        const hRaw = globe.getHeight(carto);
        if (hRaw !== undefined) {
            const a = 0.15; // smoothing
            if (Number.isNaN(this.smoothedGroundHeight))
                this.smoothedGroundHeight = hRaw;
            else
                this.smoothedGroundHeight += a * (hRaw - this.smoothedGroundHeight);
            const targetRaw = this.smoothedGroundHeight + this.config.height + this.car.groundClear;
            const HOLD_BAND = 0.15;
            if (this.lastTargetHeight == null)
                this.lastTargetHeight = targetRaw;
            else if (Math.abs(targetRaw - this.lastTargetHeight) > HOLD_BAND)
                this.lastTargetHeight = targetRaw;
            carto.height = this.lastTargetHeight;
            const landed = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height);
            this.physicsState.isGrounded = true;
            this.wasGrounded = true;
            this.lastGroundHeight = this.smoothedGroundHeight;
            return landed;
        }
        // no terrain yet
        this.physicsState.isGrounded = true;
        this.wasGrounded = true;
        return proposed;
    }
    // ---- init pose from current camera ----
    initializePoseFromCurrentCamera() {
        var _a;
        if (!this.camera || !this.cesiumViewer)
            return;
        const globe = this.cesiumViewer.scene.globe;
        const pos = Cesium.Cartesian3.clone(this.camera.position);
        const c = Cesium.Cartographic.fromCartesian(pos, globe.ellipsoid);
        if (!c)
            return;
        const h = (_a = globe.getHeight(c)) !== null && _a !== void 0 ? _a : c.height - this.config.height;
        this.lastGroundHeight = h;
        this.smoothedGroundHeight = h;
        c.height = h + this.config.height + this.car.groundClear;
        this.cameraState.position = Cesium.Cartesian3.fromRadians(c.longitude, c.latitude, c.height);
        // heading from current view direction projected to tangent plane
        const { east, north, up } = this.enuBasisAt(this.cameraState.position);
        const dirWorld = Cesium.Cartesian3.normalize(Cesium.Cartesian3.clone(this.camera.direction), new Cesium.Cartesian3());
        const dDotUp = Cesium.Cartesian3.dot(dirWorld, up);
        const dHoriz = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(dirWorld, Cesium.Cartesian3.multiplyByScalar(up, dDotUp, new Cesium.Cartesian3()), new Cesium.Cartesian3()), new Cesium.Cartesian3());
        const ex = Cesium.Cartesian3.dot(dHoriz, east);
        const ny = Cesium.Cartesian3.dot(dHoriz, north);
        this.heading = Math.atan2(ex, ny);
        // orient camera along heading
        const fLocal = new Cesium.Cartesian3(Math.sin(this.heading), Math.cos(this.heading), 0);
        const forward = new Cesium.Cartesian3(east.x * fLocal.x + north.x * fLocal.y, east.y * fLocal.x + north.y * fLocal.y, east.z * fLocal.x + north.z * fLocal.y);
        Cesium.Cartesian3.normalize(forward, forward);
        this.cameraState.direction = forward;
        this.cameraState.up = up;
        this.cameraState.right = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(this.cameraState.direction, this.cameraState.up, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        this.applyCameraState();
        this.speed = 0;
        this.steer = 0;
    }
}
