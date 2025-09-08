import * as Cesium from "cesium";
import {
  BaseCameraController,
  CameraControllerConfig,
} from "../core/BaseCameraController";
import { MOVEMENT_KEYS } from "../constants";

/**
 * Car / drive controller
 * - Kinematic bicycle-style turning (wheelbase + steer angle)
 * - W/S = throttle forward/back
 * - A/D = steer left/right (with return-to-center)
 * - Space = brake (strong decel), Shift = boost (more engine force + higher max speed)
 * - Movement follows local ENU tangent plane (works at any latitude)
 * - Terrain height smoothing + sticky target to avoid camera jitter
 */
export class CarDriveController extends BaseCameraController {
  // --- car state ---
  private speed = 0; // m/s (+ forward, - reverse)
  private heading = 0; // radians (ENU yaw; 0 = North, + toward East)
  private steer = 0; // radians (front wheel steer angle, left negative)

  // --- terrain state ---
  private lastGroundHeight = 0;
  private smoothedGroundHeight = Number.NaN;
  private lastTargetHeight: number | null = null;
  private wasGrounded = true;

  // --- car parameters (can be overridden via ctor config passthrough) ---
  private car = {
    wheelBase: 2.8, // meters
    maxSteer: Cesium.Math.toRadians(12), // rad - much more conservative steering
    steerRate: Cesium.Math.toRadians(30), // rad/s toward max - much slower steering
    steerReturnRate: Cesium.Math.toRadians(60), // rad/s back to zero - slower return

    mass: 1400, // kg
    engineForce: 5500, // N (≈ 0-100 in ~ a few s)
    brakeForce: 20000, // N strong brake
    dragCoef: 0.8, // quadratic drag (~aero) - much higher drag
    rollingFriction: 8.0, // linear decel m/s^2-ish - much higher friction

    maxFwdSpeed: 45, // m/s (~160 km/h)
    maxRevSpeed: 15, // m/s
    boostFactor: 1.7, // x engineForce and x max speed when Shift held

    groundClear: 0.45, // meters above ground to place the camera
  };

  constructor(
    cesiumViewer: Cesium.Viewer | null,
    config: Partial<CameraControllerConfig> = {}
  ) {
    super(cesiumViewer, {
      // Base fields we actually use here: maxSpeed is only used for reference; we keep our own limits above.
      speed: 0,
      maxSpeed: 45,
      acceleration: 0, // not used; car uses forces
      friction: 0.98, // not used; car uses drag/rolling
      jumpForce: 0, // N/A
      gravity: -9.81, // vertical handled by terrain lock
      height: 1.4, // driver eye height
      sensitivity: 0.001, // not used (no mouse lock)
      debugMode: false,
      ...config,
    });
  }

  initialize(): void {
    if (!this.cesiumViewer) return;

    // Keyboard only (no pointer lock for car)
    this.keyDownHandler = (e) => this.handleKeyDown(e);
    this.keyUpHandler = (e) => this.handleKeyUp(e);

    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);

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

  update(deltaTime: number): void {
    if (!this.enabled || !this.camera) return;

    // stable fixed step
    const clamped = Math.min(deltaTime, 0.05);
    this.fixedUpdate(clamped, 1 / 120, 6, (h) => this.stepOnce(h));
  }

  dispose(): void {
    if (this.keyDownHandler)
      document.removeEventListener("keydown", this.keyDownHandler);
    if (this.keyUpHandler)
      document.removeEventListener("keyup", this.keyUpHandler);

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
  private stepOnce(h: number) {
    // 1) Inputs
    const throttle =
      (this.inputState.keys.has(MOVEMENT_KEYS.FORWARD) ? 1 : 0) +
      (this.inputState.keys.has(MOVEMENT_KEYS.BACKWARD) ? -1 : 0);
    const steerInput =
      (this.inputState.keys.has(MOVEMENT_KEYS.LEFT) ? -1 : 0) +
      (this.inputState.keys.has(MOVEMENT_KEYS.RIGHT) ? 1 : 0);
    const braking = this.inputState.keys.has(MOVEMENT_KEYS.JUMP); // Space = brake
    const boosting =
      this.inputState.keys.has("ShiftLeft") ||
      this.inputState.keys.has("ShiftRight");

    // 2) Steering dynamics (rate-limited with return to center)
    if (steerInput !== 0) {
      this.steer += steerInput * this.car.steerRate * h;
      this.steer = Cesium.Math.clamp(
        this.steer,
        -this.car.maxSteer,
        this.car.maxSteer
      );
    } else {
      // return to zero
      const sgn = Math.sign(this.steer);
      const mag = Math.max(
        0,
        Math.abs(this.steer) - this.car.steerReturnRate * h
      );
      this.steer = sgn * mag;
      if (Math.abs(this.steer) < 1e-4) this.steer = 0;
    }

    // 3) Longitudinal dynamics
    const boostMul = boosting ? this.car.boostFactor : 1;
    const F_engine = throttle * (this.car.engineForce * boostMul); // N (can be negative for reverse)

    // Improved braking - always brake when space is held, regardless of throttle
    const F_brake = braking
      ? -Math.sign(this.speed || 1) * this.car.brakeForce
      : 0;

    // Always apply drag and rolling friction (these are always present)
    const F_drag = -this.car.dragCoef * this.speed * Math.abs(this.speed); // quad drag
    const F_roll = -this.car.rollingFriction * Math.sign(this.speed); // linear friction (always opposes motion)

    // total force along car forward
    const F_total = F_engine + F_brake + F_drag + F_roll;
    const a = F_total / this.car.mass;

    this.speed += a * h;

    // Cap speeds
    const maxFwd = this.car.maxFwdSpeed * boostMul;
    const maxRev = this.car.maxRevSpeed * (boostMul * 0.8); // small boost in reverse if you want
    if (this.speed > maxFwd) this.speed = maxFwd;
    if (this.speed < -maxRev) this.speed = -maxRev;

    // Strong deadzone - car should stop quickly when no input
    const deadzone = 0.1; // 0.1 m/s = 0.36 km/h
    if (throttle === 0 && !braking && Math.abs(this.speed) < deadzone) {
      this.speed = 0;
    }

    // 4) Heading update (kinematic bicycle)
    // Reverse automatically flips turn sense because speed is negative.
    const yawRate = (this.speed / this.car.wheelBase) * Math.tan(this.steer); // rad/s
    this.heading = Cesium.Math.negativePiToPi(this.heading + yawRate * h);

    // 5) Compute ENU basis & forward on tangent plane
    const { east, north, up } = this.enuBasisAt(this.cameraState.position);

    // Car forward in ENU local (x=east, y=north)
    const fLocal = new Cesium.Cartesian3(
      Math.sin(this.heading),
      Math.cos(this.heading),
      0
    );
    // to world
    const forward = new Cesium.Cartesian3(
      east.x * fLocal.x + north.x * fLocal.y,
      east.y * fLocal.x + north.y * fLocal.y,
      east.z * fLocal.x + north.z * fLocal.y
    );
    Cesium.Cartesian3.normalize(forward, forward);

    // 6) Integrate position
    const delta = Cesium.Cartesian3.multiplyByScalar(
      forward,
      this.speed * h,
      new Cesium.Cartesian3()
    );
    const proposed = Cesium.Cartesian3.add(
      this.cameraState.position,
      delta,
      new Cesium.Cartesian3()
    );
    if (
      !Number.isFinite(proposed.x) ||
      !Number.isFinite(proposed.y) ||
      !Number.isFinite(proposed.z)
    )
      return;

    // 7) Terrain resolve (height smoothing + sticky target)
    const resolved = this.resolveGround(proposed);
    this.cameraState.position = resolved;

    // 8) Set camera orientation (look straight along car forward; keep level with local up)
    this.cameraState.direction = forward;
    this.cameraState.up = up;
    this.cameraState.right = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(
        this.cameraState.direction,
        this.cameraState.up,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );

    this.applyCameraState();
  }

  // ---- terrain helpers (same idea as in FPW) ----
  private resolveGround(proposed: Cesium.Cartesian3): Cesium.Cartesian3 {
    const globe = this.cesiumViewer!.scene.globe;
    const ellipsoid = globe.ellipsoid;
    const carto = Cesium.Cartographic.fromCartesian(proposed, ellipsoid);
    if (!carto) return this.cameraState.position;

    const hRaw = globe.getHeight(carto);
    if (hRaw !== undefined) {
      // gentle smoothing so we don't chase every tile refinement
      const a = 0.15;
      if (Number.isNaN(this.smoothedGroundHeight))
        this.smoothedGroundHeight = hRaw;
      else this.smoothedGroundHeight += a * (hRaw - this.smoothedGroundHeight);

      const targetRaw =
        this.smoothedGroundHeight + this.config.height + this.car.groundClear;
      const HOLD_BAND = 0.15;

      if (this.lastTargetHeight == null) this.lastTargetHeight = targetRaw;
      else if (Math.abs(targetRaw - this.lastTargetHeight) > HOLD_BAND)
        this.lastTargetHeight = targetRaw;

      const target = this.lastTargetHeight;
      carto.height = target;

      const landed = Cesium.Cartesian3.fromRadians(
        carto.longitude,
        carto.latitude,
        carto.height
      );
      this.physicsState.isGrounded = true;
      this.wasGrounded = true;
      this.lastGroundHeight = this.smoothedGroundHeight;
      return landed;
    }

    // No terrain yet — keep altitude
    this.physicsState.isGrounded = true;
    this.wasGrounded = true;
    return proposed;
  }

  // ---- init pose from current camera ----
  private initializePoseFromCurrentCamera() {
    if (!this.camera || !this.cesiumViewer) return;

    const globe = this.cesiumViewer.scene.globe;
    const pos = Cesium.Cartesian3.clone(this.camera.position);
    const c = Cesium.Cartographic.fromCartesian(pos, globe.ellipsoid);
    if (!c) return;

    const h = globe.getHeight(c) ?? c.height - this.config.height;
    this.lastGroundHeight = h;
    this.smoothedGroundHeight = h;

    c.height = h + this.config.height + this.car.groundClear;
    this.cameraState.position = Cesium.Cartesian3.fromRadians(
      c.longitude,
      c.latitude,
      c.height
    );

    // derive heading from current direction projected into ENU
    const { east, north, up } = this.enuBasisAt(this.cameraState.position);
    const dirWorld = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.clone(this.camera.direction),
      new Cesium.Cartesian3()
    );
    // remove vertical to get horizontal forward
    const dDotUp = Cesium.Cartesian3.dot(dirWorld, up);
    const dHoriz = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(
        dirWorld,
        Cesium.Cartesian3.multiplyByScalar(up, dDotUp, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );
    const ex = Cesium.Cartesian3.dot(dHoriz, east);
    const ny = Cesium.Cartesian3.dot(dHoriz, north);
    this.heading = Math.atan2(ex, ny);

    // initialize camera orientation along heading
    const fLocal = new Cesium.Cartesian3(
      Math.sin(this.heading),
      Math.cos(this.heading),
      0
    );
    const forward = new Cesium.Cartesian3(
      east.x * fLocal.x + north.x * fLocal.y,
      east.y * fLocal.x + north.y * fLocal.y,
      east.z * fLocal.x + north.z * fLocal.y
    );
    Cesium.Cartesian3.normalize(forward, forward);

    this.cameraState.direction = forward;
    this.cameraState.up = up;
    this.cameraState.right = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(
        this.cameraState.direction,
        this.cameraState.up,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );
    this.applyCameraState();

    // zero motion
    this.speed = 0;
    this.steer = 0;
  }

  // ---- key handling (prevent page scroll for driving keys) ----
  protected onKeyDown = (e: KeyboardEvent) => {
    const codes = new Set<string>([
      MOVEMENT_KEYS.FORWARD,
      MOVEMENT_KEYS.BACKWARD,
      MOVEMENT_KEYS.LEFT,
      MOVEMENT_KEYS.RIGHT,
      MOVEMENT_KEYS.JUMP, // used as brake here
      "ShiftLeft",
      "ShiftRight",
    ]);
    if (codes.has(e.code)) e.preventDefault();
  };
}
