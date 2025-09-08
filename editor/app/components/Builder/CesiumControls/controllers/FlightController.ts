import * as Cesium from "cesium";
import {
  BaseCameraController,
  CameraControllerConfig,
} from "../core/BaseCameraController";
import { MOVEMENT_KEYS, ROTATION_KEYS } from "../constants";

/**
 * Flight controller with 6DOF movement
 * Features:
 * - WASD for forward/back/strafe movement
 * - Space/Shift for up/down movement
 * - Arrow keys for pitch/yaw rotation
 * - Mouse look support
 * - Realistic flight physics with momentum
 * - No ground collision (free flight)
 */
export class FlightController extends BaseCameraController {
  private velocity: Cesium.Cartesian3 = new Cesium.Cartesian3(0, 0, 0);
  private angularVelocity: Cesium.Cartesian3 = new Cesium.Cartesian3(0, 0, 0);
  private isMouseLookEnabled: boolean = false;

  // Flight physics constants
  private readonly maxSpeed: number = 50;
  private readonly acceleration: number = 25;
  private readonly friction: number = 0.95;
  private readonly angularAcceleration: number = 0.1;
  private readonly angularFriction: number = 0.9;
  private readonly mouseSensitivity: number = 0.001;

  constructor(
    cesiumViewer: Cesium.Viewer | null,
    config: Partial<CameraControllerConfig> = {}
  ) {
    super(cesiumViewer, {
      speed: 25,
      maxSpeed: 50,
      acceleration: 25,
      friction: 0.95,
      height: 0,
      sensitivity: 0.001,
      ...config,
    });
  }

  initialize(): void {
    if (!this.cesiumViewer) return;

    // Set up event listeners
    this.keyDownHandler = this.handleKeyDown;
    this.keyUpHandler = this.handleKeyUp;
    this.mouseMoveHandler = this.handleMouseMove;
    this.mouseDownHandler = this.handleMouseDown;
    this.pointerLockChangeHandler = this.handlePointerLockChange;

    // Add event listeners
    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);
    document.addEventListener("mousemove", this.mouseMoveHandler);
    this.cesiumViewer.canvas.addEventListener(
      "mousedown",
      this.mouseDownHandler
    );
    document.addEventListener(
      "pointerlockchange",
      this.pointerLockChangeHandler
    );

    // Disable default Cesium camera controls
    const controller = this.cesiumViewer.scene.screenSpaceCameraController;
    controller.enableRotate = false;
    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableTilt = false;

    this.enabled = true;

    if (this.config.debugMode) {
      console.log("[FlightController] Initialized");
    }
  }

  update(deltaTime: number): void {
    if (!this.enabled || !this.camera) return;

    this.updateCameraState();
    this.handleMovement(deltaTime);
    this.handleRotation(deltaTime);
    this.handleMouseLook();
    this.applyPhysics(deltaTime);
    this.applyCameraState();

    // Reset mouse delta after processing
    this.inputState.mouseDelta = { x: 0, y: 0 };
  }

  dispose(): void {
    // Remove event listeners
    if (this.keyDownHandler) {
      document.removeEventListener("keydown", this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      document.removeEventListener("keyup", this.keyUpHandler);
    }
    if (this.mouseMoveHandler) {
      document.removeEventListener("mousemove", this.mouseMoveHandler);
    }
    if (this.mouseDownHandler && this.cesiumViewer) {
      this.cesiumViewer.canvas.removeEventListener(
        "mousedown",
        this.mouseDownHandler
      );
    }
    if (this.pointerLockChangeHandler) {
      document.removeEventListener(
        "pointerlockchange",
        this.pointerLockChangeHandler
      );
    }

    // Re-enable default Cesium camera controls
    if (this.cesiumViewer) {
      const controller = this.cesiumViewer.scene.screenSpaceCameraController;
      controller.enableRotate = true;
      controller.enableTranslate = true;
      controller.enableZoom = true;
      controller.enableTilt = true;
    }

    this.enabled = false;

    if (this.config.debugMode) {
      console.log("[FlightController] Disposed");
    }
  }

  /**
   * Handle linear movement (WASD + Space/Shift)
   */
  private handleMovement(deltaTime: number): void {
    // Calculate movement input
    const moveInput = new Cesium.Cartesian3(0, 0, 0);

    if (this.inputState.keys.has(MOVEMENT_KEYS.FORWARD)) moveInput.z -= 1;
    if (this.inputState.keys.has(MOVEMENT_KEYS.BACKWARD)) moveInput.z += 1;
    if (this.inputState.keys.has(MOVEMENT_KEYS.LEFT)) moveInput.x -= 1;
    if (this.inputState.keys.has(MOVEMENT_KEYS.RIGHT)) moveInput.x += 1;
    if (this.inputState.keys.has(MOVEMENT_KEYS.JUMP)) moveInput.y += 1; // Up
    if (this.inputState.keys.has(MOVEMENT_KEYS.CROUCH)) moveInput.y -= 1; // Down

    // Normalize input
    if (Cesium.Cartesian3.magnitude(moveInput) > 0) {
      Cesium.Cartesian3.normalize(moveInput, moveInput);
    }

    // Calculate world-space movement direction
    const worldMoveDir = this.calculateWorldMovementDirection(moveInput);

    // Apply acceleration
    if (Cesium.Cartesian3.magnitude(worldMoveDir) > 0) {
      Cesium.Cartesian3.normalize(worldMoveDir, worldMoveDir);
      const acceleration = Cesium.Cartesian3.multiplyByScalar(
        worldMoveDir,
        this.acceleration * deltaTime,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.add(this.velocity, acceleration, this.velocity);
    } else {
      // Apply friction when not moving
      this.velocity = Cesium.Cartesian3.multiplyByScalar(
        this.velocity,
        this.friction,
        this.velocity
      );
    }

    // Limit speed
    if (Cesium.Cartesian3.magnitude(this.velocity) > this.maxSpeed) {
      Cesium.Cartesian3.normalize(this.velocity, this.velocity);
      Cesium.Cartesian3.multiplyByScalar(
        this.velocity,
        this.maxSpeed,
        this.velocity
      );
    }
  }

  /**
   * Handle rotation (Arrow keys)
   */
  private handleRotation(deltaTime: number): void {
    // Calculate rotation input
    const rotationInput = new Cesium.Cartesian3(0, 0, 0);

    if (this.inputState.keys.has(ROTATION_KEYS.LOOK_UP)) rotationInput.x += 1;
    if (this.inputState.keys.has(ROTATION_KEYS.LOOK_DOWN)) rotationInput.x -= 1;
    if (this.inputState.keys.has(ROTATION_KEYS.LOOK_LEFT)) rotationInput.y += 1;
    if (this.inputState.keys.has(ROTATION_KEYS.LOOK_RIGHT))
      rotationInput.y -= 1;

    // Apply angular acceleration
    if (Cesium.Cartesian3.magnitude(rotationInput) > 0) {
      Cesium.Cartesian3.normalize(rotationInput, rotationInput);
      const angularAcceleration = Cesium.Cartesian3.multiplyByScalar(
        rotationInput,
        this.angularAcceleration * deltaTime,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.add(
        this.angularVelocity,
        angularAcceleration,
        this.angularVelocity
      );
    } else {
      // Apply angular friction
      this.angularVelocity = Cesium.Cartesian3.multiplyByScalar(
        this.angularVelocity,
        this.angularFriction,
        this.angularVelocity
      );
    }
  }

  /**
   * Handle mouse look
   */
  private handleMouseLook(): void {
    if (!this.isMouseLookEnabled || !this.inputState.isPointerLocked) return;

    const mouseDelta = this.inputState.mouseDelta;
    if (mouseDelta.x === 0 && mouseDelta.y === 0) return;

    // Calculate rotation from mouse movement
    const yawDelta = -mouseDelta.x * this.mouseSensitivity;
    const pitchDelta = -mouseDelta.y * this.mouseSensitivity;

    // Update yaw and pitch
    this.cameraState.yaw += yawDelta;
    this.cameraState.pitch += pitchDelta;

    // Clamp pitch to prevent over-rotation
    this.cameraState.pitch = Math.max(
      -Math.PI / 2 + 0.1,
      Math.min(Math.PI / 2 - 0.1, this.cameraState.pitch)
    );

    // Update camera orientation
    this.updateCameraOrientation();
  }

  /**
   * Apply physics to camera
   */
  private applyPhysics(deltaTime: number): void {
    // Apply linear velocity
    const movement = Cesium.Cartesian3.multiplyByScalar(
      this.velocity,
      deltaTime,
      new Cesium.Cartesian3()
    );
    this.cameraState.position = Cesium.Cartesian3.add(
      this.cameraState.position,
      movement,
      new Cesium.Cartesian3()
    );

    // Apply angular velocity
    this.cameraState.yaw += this.angularVelocity.y * deltaTime;
    this.cameraState.pitch += this.angularVelocity.x * deltaTime;
    this.cameraState.roll += this.angularVelocity.z * deltaTime;

    // Clamp pitch
    this.cameraState.pitch = Math.max(
      -Math.PI / 2 + 0.1,
      Math.min(Math.PI / 2 - 0.1, this.cameraState.pitch)
    );

    // Update camera orientation
    this.updateCameraOrientation();
  }

  /**
   * Calculate world-space movement direction from input
   */
  private calculateWorldMovementDirection(
    moveInput: Cesium.Cartesian3
  ): Cesium.Cartesian3 {
    const worldMoveDir = new Cesium.Cartesian3(0, 0, 0);

    // Forward/backward movement
    if (moveInput.z !== 0) {
      Cesium.Cartesian3.add(
        worldMoveDir,
        Cesium.Cartesian3.multiplyByScalar(
          this.cameraState.direction,
          -moveInput.z,
          new Cesium.Cartesian3()
        ),
        worldMoveDir
      );
    }

    // Strafe movement
    if (moveInput.x !== 0) {
      Cesium.Cartesian3.add(
        worldMoveDir,
        Cesium.Cartesian3.multiplyByScalar(
          this.cameraState.right,
          moveInput.x,
          new Cesium.Cartesian3()
        ),
        worldMoveDir
      );
    }

    // Up/down movement
    if (moveInput.y !== 0) {
      Cesium.Cartesian3.add(
        worldMoveDir,
        Cesium.Cartesian3.multiplyByScalar(
          this.cameraState.up,
          moveInput.y,
          new Cesium.Cartesian3()
        ),
        worldMoveDir
      );
    }

    return worldMoveDir;
  }

  /**
   * Update camera orientation from yaw, pitch, roll
   */
  private updateCameraOrientation(): void {
    // Calculate direction vector from yaw and pitch
    this.cameraState.direction = new Cesium.Cartesian3(
      Math.cos(this.cameraState.pitch) * Math.cos(this.cameraState.yaw),
      Math.cos(this.cameraState.pitch) * Math.sin(this.cameraState.yaw),
      Math.sin(this.cameraState.pitch)
    );

    // Calculate right vector
    this.cameraState.right = Cesium.Cartesian3.cross(
      this.cameraState.direction,
      new Cesium.Cartesian3(0, 0, 1),
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(this.cameraState.right, this.cameraState.right);

    // Calculate up vector
    this.cameraState.up = Cesium.Cartesian3.cross(
      this.cameraState.right,
      this.cameraState.direction,
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(this.cameraState.up, this.cameraState.up);
  }

  /**
   * Handle mouse down - toggle mouse look
   */
  protected onMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      // Left mouse button
      if (this.isMouseLookEnabled) {
        this.exitPointerLock();
        this.isMouseLookEnabled = false;
      } else {
        this.requestPointerLock();
        this.isMouseLookEnabled = true;
      }
    }
  }

  /**
   * Handle key down
   */
  protected onKeyDown(event: KeyboardEvent): void {
    // Prevent default for movement and rotation keys
    const movementKeys = Object.values(MOVEMENT_KEYS);
    const rotationKeys = Object.values(ROTATION_KEYS);

    if (
      movementKeys.includes(event.code as any) ||
      rotationKeys.includes(event.code as any)
    ) {
      event.preventDefault();
    }
  }

  /**
   * Handle key up
   */
  protected onKeyUp(event: KeyboardEvent): void {
    // Handle any key up logic here
  }

  /**
   * Handle mouse move
   */
  protected onMouseMove(event: MouseEvent): void {
    // Mouse movement is handled in handleMouseLook()
  }

  /**
   * Handle pointer lock change
   */
  protected onPointerLockChange(): void {
    this.isMouseLookEnabled = this.inputState.isPointerLocked;

    if (this.config.debugMode) {
      console.log(
        "[FlightController] Mouse look:",
        this.isMouseLookEnabled ? "enabled" : "disabled"
      );
    }
  }

  /**
   * Get current velocity
   */
  getVelocity(): Cesium.Cartesian3 {
    return this.velocity.clone();
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return Cesium.Cartesian3.magnitude(this.velocity);
  }

  /**
   * Set mouse look enabled
   */
  setMouseLookEnabled(enabled: boolean): void {
    this.isMouseLookEnabled = enabled;
    if (enabled) {
      this.requestPointerLock();
    } else {
      this.exitPointerLock();
    }
  }
}
