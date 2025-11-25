import * as Cesium from "cesium";
import {
  BaseCameraController,
  CameraControllerConfig,
} from "../core/BaseCameraController";
import { MOVEMENT_KEYS, ROTATION_KEYS } from "../constants";
import { createLogger } from "@klorad/core";

/**
 * Car controller with realistic vehicle physics
 * Features:
 * - WASD movement with acceleration/deceleration
 * - Arrow keys for steering
 * - Realistic car physics (momentum, braking, turning radius)
 * - Ground following
 * - No mouse look (camera follows car direction)
 */
export class CarController extends BaseCameraController {
  private carDirection: Cesium.Cartesian3 = new Cesium.Cartesian3(0, 0, 1);
  private carRotation: number = 0;
  private targetRotation: number = 0;
  private currentSpeed: number = 0;
  private targetSpeed: number = 0;
  private isMoving: boolean = false;
  private lastGroundHeight: number = 0;

  // Car physics constants
  private readonly maxSpeed: number = 20;
  private readonly acceleration: number = 15;
  private readonly deceleration: number = 20;
  private readonly turnSpeed: number = 0.03;
  private readonly turnSmoothing: number = 0.1;
  private readonly speedBasedTurnFactor: number = 0.7;

  constructor(
    cesiumViewer: Cesium.Viewer | null,
    config: Partial<CameraControllerConfig> = {}
  ) {
    super(cesiumViewer, {
      speed: 15,
      maxSpeed: 20,
      acceleration: 15,
      friction: 0.9,
      height: 1.5,
      sensitivity: 0.01,
      ...config,
    });
    this.logger = createLogger("CarController");
  }

  initialize(): void {
    if (!this.cesiumViewer) return;

    // Set up event listeners
    this.keyDownHandler = this.handleKeyDown;
    this.keyUpHandler = this.handleKeyUp;

    // Add event listeners
    document.addEventListener("keydown", this.keyDownHandler);
    document.addEventListener("keyup", this.keyUpHandler);

    // Disable default Cesium camera controls
    const controller = this.cesiumViewer.scene.screenSpaceCameraController;
    controller.enableRotate = false;
    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableTilt = false;

    this.enabled = true;

    if (this.config.debugMode) {
      this.logger.debug("Initialized");
    }
  }

  update(_deltaTime: number): void {
    if (!this.enabled || !this.camera) return;

    this.updateCameraState();
    this.handleCarMovement(_deltaTime);
    this.handleSteering(_deltaTime);
    this.handleGroundFollowing();
    this.updateCameraPosition();
    this.applyCameraState();
  }

  dispose(): void {
    // Remove event listeners
    if (this.keyDownHandler) {
      document.removeEventListener("keydown", this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      document.removeEventListener("keyup", this.keyUpHandler);
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
      this.logger.debug("Disposed");
    }
  }

  /**
   * Handle car movement with realistic physics
   */
  private handleCarMovement(_deltaTime: number): void {
    // Determine target speed based on input
    this.targetSpeed = 0;
    this.isMoving = false;

    if (this.inputState.keys.has(MOVEMENT_KEYS.FORWARD)) {
      this.targetSpeed = this.maxSpeed;
      this.isMoving = true;
    } else if (this.inputState.keys.has(MOVEMENT_KEYS.BACKWARD)) {
      this.targetSpeed = -this.maxSpeed * 0.5; // Reverse is slower
      this.isMoving = true;
    }

    // Apply acceleration/deceleration
    if (this.isMoving) {
      const acceleration =
        this.targetSpeed > 0 ? this.acceleration : this.deceleration;
      this.currentSpeed = this.lerp(
        this.currentSpeed,
        this.targetSpeed,
        acceleration * _deltaTime
      );
    } else {
      // Apply friction when not moving
      this.currentSpeed = this.lerp(
        this.currentSpeed,
        0,
        this.deceleration * _deltaTime
      );
    }

    // Move car forward/backward
    if (Math.abs(this.currentSpeed) > 0.1) {
      const movement = Cesium.Cartesian3.multiplyByScalar(
        this.carDirection,
        this.currentSpeed * _deltaTime,
        new Cesium.Cartesian3()
      );
      this.cameraState.position = Cesium.Cartesian3.add(
        this.cameraState.position,
        movement,
        new Cesium.Cartesian3()
      );
    }
  }

  /**
   * Handle car steering
   */
  private handleSteering(_deltaTime: number): void {
    // Only allow steering when moving
    if (!this.isMoving || Math.abs(this.currentSpeed) < 0.5) return;

    let turnAmount = 0;

    // Determine turn direction
    if (this.inputState.keys.has(ROTATION_KEYS.LOOK_LEFT)) {
      turnAmount = this.turnSpeed;
    } else if (this.inputState.keys.has(ROTATION_KEYS.LOOK_RIGHT)) {
      turnAmount = -this.turnSpeed;
    }

    // Apply speed-based turn rate (slower turns at higher speeds)
    if (turnAmount !== 0) {
      const speedFactor =
        1 -
        (Math.abs(this.currentSpeed) / this.maxSpeed) *
          this.speedBasedTurnFactor;
      const adjustedTurnSpeed = turnAmount * speedFactor;

      this.targetRotation += adjustedTurnSpeed;
    }

    // Smoothly interpolate current rotation to target rotation
    this.carRotation = this.lerp(
      this.carRotation,
      this.targetRotation,
      this.turnSmoothing
    );

    // Update car direction
    this.carDirection = new Cesium.Cartesian3(
      Math.sin(this.carRotation),
      0,
      Math.cos(this.carRotation)
    );
  }

  /**
   * Handle ground following
   */
  private handleGroundFollowing(): void {
    const groundHeight = this.getGroundHeight(this.cameraState.position);

    if (groundHeight !== null) {
      const cartographic =
        this.cesiumViewer!.scene.globe.ellipsoid.cartesianToCartographic(
          this.cameraState.position
        );
      if (cartographic) {
        cartographic.height = groundHeight + this.config.height;
        const groundPosition =
          this.cesiumViewer!.scene.globe.ellipsoid.cartographicToCartesian(
            cartographic
          );
        if (groundPosition) {
          this.cameraState.position = groundPosition;
          this.lastGroundHeight = groundHeight;
        }
      }
    }
  }

  /**
   * Update camera position to follow car
   */
  private updateCameraPosition(): void {
    // Set camera direction to match car direction
    this.cameraState.direction = this.carDirection.clone();

    // Calculate right vector
    this.cameraState.right = Cesium.Cartesian3.cross(
      this.cameraState.direction,
      new Cesium.Cartesian3(0, 0, 1),
      new Cesium.Cartesian3()
    );
    Cesium.Cartesian3.normalize(this.cameraState.right, this.cameraState.right);

    // Keep up vector pointing up
    this.cameraState.up = new Cesium.Cartesian3(0, 0, 1);

    // Update yaw to match car rotation
    this.cameraState.yaw = this.carRotation;
    this.cameraState.pitch = 0;
  }

  /**
   * Linear interpolation helper
   */
  private lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
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
  protected onKeyUp(_event: KeyboardEvent): void {
    // Handle any key up logic here
  }

  /**
   * Get current car speed
   */
  getCurrentSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Get car rotation
   */
  getCarRotation(): number {
    return this.carRotation;
  }

  /**
   * Get car direction
   */
  getCarDirection(): Cesium.Cartesian3 {
    return this.carDirection.clone();
  }
}
