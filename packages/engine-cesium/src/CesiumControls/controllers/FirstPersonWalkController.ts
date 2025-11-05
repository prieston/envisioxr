import * as Cesium from "cesium";
import {
  BaseCameraController,
  CameraControllerConfig,
} from "../core/BaseCameraController";
import { MOVEMENT_KEYS } from "../constants";
import { createLogger } from "@envisio/core";
import {
  calculateMovementInput,
  calculateWorldMovementDirection,
  updateHorizontalVelocity,
  clampHorizontalSpeed,
} from "./first-person/physics-utils";
import {
  resolveGround,
  handleCrouch,
} from "./first-person/ground-resolution";
import {
  applyYawPitchFromMouseDelta,
  initializeCameraFromCurrent,
} from "./first-person/camera-orientation";

/**
 * First-person walk controller:
 * - Fixed-timestep physics (120 Hz)
 * - ENU mouselook (world-space setView)
 * - WASD accel + friction, Shift boost
 * - Jump/gravity, terrain landing (smoothed), crouch
 */
export class FirstPersonWalkController extends BaseCameraController {
  private isJumping = false;
  private lastGroundHeight = 0;
  private smoothedGroundHeight = Number.NaN;
  private __dbg = {
    frame: 0,
    lastPos: new Cesium.Cartesian3(Number.NaN, Number.NaN, Number.NaN),
    lastGroundDelta: Number.NaN,
    jitterMax: 0,
  };
  private wasGrounded = false;
  private lastTargetHeight: number | null = null;

  constructor(
    cesiumViewer: Cesium.Viewer | null,
    config: Partial<CameraControllerConfig> = {}
  ) {
    super(cesiumViewer, {
      speed: 4,
      maxSpeed: 7,
      acceleration: 30,
      friction: 0.85,
      jumpForce: 5,
      gravity: -9.81,
      height: 1.7,
      sensitivity: 0.0018,
      debugMode: false,
      ...config,
    });
    this.logger = createLogger("FPW");
  }

  initialize(): void {
    if (!this.cesiumViewer) {
      this.logger.warn("No Cesium viewer available");
      return;
    }

    this.logger.debug("Initializing with canvas:", {
      hasCanvas: !!this.cesiumViewer.canvas,
      canvasElement: this.cesiumViewer.canvas,
      canvasStyle: this.cesiumViewer.canvas?.style?.pointerEvents,
      canvasZIndex: this.cesiumViewer.canvas?.style?.zIndex,
      canvasPosition: this.cesiumViewer.canvas?.style?.position,
      canvasDisplay: this.cesiumViewer.canvas?.style?.display,
      canvasVisibility: this.cesiumViewer.canvas?.style?.visibility,
    });

    if (this.cesiumViewer.canvas) {
      this.cesiumViewer.canvas.style.pointerEvents = "auto";
      this.cesiumViewer.canvas.style.cursor = "crosshair";
      this.logger.debug("Set canvas pointer events to auto");
    }

    this.keyDownHandler = (e) => this.handleKeyDown(e);
    this.keyUpHandler = (e) => this.handleKeyUp(e);
    this.mouseMoveHandler = (e) => this.handleMouseMove(e);
    this.mouseDownHandler = (e) => this.handleMouseDown(e);
    this.mouseUpHandler = (e) => this.handleMouseUp(e);
    this.pointerLockChangeHandler = () => this.handlePointerLockChange();

    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    document.addEventListener("mousemove", this.mouseMoveHandler);
    document.addEventListener(
      "pointerlockchange",
      this.pointerLockChangeHandler
    );

    this.cesiumViewer.canvas.addEventListener(
      "mousedown",
      this.mouseDownHandler!
    );
    this.cesiumViewer.canvas.addEventListener("mouseup", this.mouseUpHandler!);

    const ctrl = this.cesiumViewer.scene.screenSpaceCameraController;
    ctrl.enableRotate = false;
    ctrl.enableTranslate = false;
    ctrl.enableZoom = false;
    ctrl.enableTilt = false;

    this.inputState.keys.clear();
    this.initializeCameraPosition();

    this.enabled = true;
    if (this.config.debugMode) this.logger.debug("Initialized");
  }

  update(deltaTime: number): void {
    if (!this.enabled || !this.camera) return;

    const clamped = Math.min(deltaTime, 0.05);

    this.fixedUpdate(clamped, 1 / 120, 6, (h) => {
      this.stepOnce(h);
    });

    this.applyYawPitch();

    if (this.config.debugMode) {
      const p = this.cameraState.position;
      if (
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        Number.isFinite(p.z)
      ) {
        const last = this.__dbg.lastPos;
        const dp = Number.isFinite(last.x)
          ? Cesium.Cartesian3.distance(p, last)
          : 0;
        this.__dbg.jitterMax = Math.max(this.__dbg.jitterMax, dp);
        this.__dbg.lastPos = Cesium.Cartesian3.clone(p);

        if (this.__dbg.frame++ % 30 === 0) {
          // Debug logging throttled
        }
      }
    }

    this.inputState.mouseDelta = { x: 0, y: 0 };
  }

  dispose(): void {
    if (this.keyDownHandler)
      document.removeEventListener("keydown", this.keyDownHandler);
    if (this.keyUpHandler)
      document.removeEventListener("keyup", this.keyUpHandler);
    if (this.mouseMoveHandler)
      document.removeEventListener("mousemove", this.mouseMoveHandler);
    if (this.pointerLockChangeHandler)
      document.removeEventListener(
        "pointerlockchange",
        this.pointerLockChangeHandler
      );

    if (this.mouseDownHandler && this.cesiumViewer) {
      this.cesiumViewer.canvas.removeEventListener(
        "mousedown",
        this.mouseDownHandler
      );
      this.cesiumViewer.canvas.removeEventListener(
        "mouseup",
        this.mouseUpHandler!
      );
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
  private stepOnce(h: number) {
    const moveInput = calculateMovementInput(this.inputState);

    const up = this.cameraState.up;
    const dir = this.cameraState.direction;
    const dirDotUp = Cesium.Cartesian3.dot(dir, up);
    const forward = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(
        dir,
        Cesium.Cartesian3.multiplyByScalar(
          up,
          dirDotUp,
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );

    const right = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(forward, up, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );

    const worldMove = calculateWorldMovementDirection(moveInput, forward, right);

    const boost =
      this.inputState.keys.has("ShiftLeft") ||
      this.inputState.keys.has("ShiftRight")
        ? 2.0
        : 1.0;

    const v = this.physicsState.velocity;
    const vDotUp = Cesium.Cartesian3.dot(v, up);
    let vHoriz = Cesium.Cartesian3.subtract(
      v,
      Cesium.Cartesian3.multiplyByScalar(up, vDotUp, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );

    vHoriz = updateHorizontalVelocity(
      vHoriz,
      worldMove,
      up,
      this.config,
      boost,
      h,
      this.config.friction
    );

    vHoriz = clampHorizontalSpeed(vHoriz, this.config.maxSpeed, boost);

    if (
      this.inputState.keys.has(MOVEMENT_KEYS.JUMP) &&
      this.physicsState.isGrounded &&
      !this.isJumping
    ) {
      this.physicsState.jumpVelocity = this.config.jumpForce;
      this.physicsState.isGrounded = false;
      this.isJumping = true;
    }
    if (!this.physicsState.isGrounded) {
      this.physicsState.jumpVelocity += this.config.gravity * h;
    } else if (!this.inputState.keys.has(MOVEMENT_KEYS.JUMP)) {
      this.physicsState.jumpVelocity = 0;
    }
    const vVert = Cesium.Cartesian3.multiplyByScalar(
      up,
      this.physicsState.jumpVelocity,
      new Cesium.Cartesian3()
    );

    this.physicsState.velocity = Cesium.Cartesian3.add(
      vHoriz,
      vVert,
      new Cesium.Cartesian3()
    );

    const delta = Cesium.Cartesian3.multiplyByScalar(
      this.physicsState.velocity,
      h,
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
    ) {
      return;
    }

    const groundState = {
      isJumping: this.isJumping,
      lastGroundHeight: this.lastGroundHeight,
      smoothedGroundHeight: this.smoothedGroundHeight,
      wasGrounded: this.wasGrounded,
      lastTargetHeight: this.lastTargetHeight,
    };

    const resolved = resolveGround(
      proposed,
      this.cameraState.position,
      this.cesiumViewer!.scene.globe,
      groundState,
      this.physicsState,
      this.config,
      this.config.debugMode,
      this.logger
    );

    this.isJumping = groundState.isJumping;
    this.lastGroundHeight = groundState.lastGroundHeight;
    this.smoothedGroundHeight = groundState.smoothedGroundHeight;
    this.wasGrounded = groundState.wasGrounded;
    this.lastTargetHeight = groundState.lastTargetHeight;

    const crouched = handleCrouch(
      resolved,
      this.physicsState,
      this.inputState,
      groundState,
      this.config
    );
    this.cameraState.position = crouched;
  }

  /** Apply ENU yaw/pitch based on accumulated mouseDelta */
  private applyYawPitch() {
    applyYawPitchFromMouseDelta(
      this.cameraState,
      this.inputState.mouseDelta,
      this.config.sensitivity,
      (pos) => this.enuBasisAt(pos)
    );
    this.applyCameraState();
  }

  /** Start grounded at current lon/lat */
  private initializeCameraPosition() {
    if (!this.camera || !this.cesiumViewer) return;

    const groundState = {
      lastGroundHeight: this.lastGroundHeight,
      smoothedGroundHeight: this.smoothedGroundHeight,
    };

    initializeCameraFromCurrent(
      this.camera,
      this.cesiumViewer.scene.globe,
      this.config,
      this.cameraState,
      this.physicsState,
      groundState,
      (pos) => this.enuBasisAt(pos),
      (pos, yaw, pitch) => this.applyYawPitchWorldFromENU(pos, yaw, pitch)
    );

    this.lastGroundHeight = groundState.lastGroundHeight;
    this.smoothedGroundHeight = groundState.smoothedGroundHeight;
  }

  protected onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      if (!this.inputState.isPointerLocked) {
        this.logger.debug("Requesting pointer lock (backup)...");
        this.requestPointerLock();
      }
    }
  };

  protected onPointerLockChange = () => {
    // Base updates isPointerLocked; nothing extra needed here.
  };

  protected onKeyDown = (e: KeyboardEvent) => {
    const codes = new Set(Object.values(MOVEMENT_KEYS) as string[]);
    if (codes.has(e.code)) e.preventDefault();
  };
}
