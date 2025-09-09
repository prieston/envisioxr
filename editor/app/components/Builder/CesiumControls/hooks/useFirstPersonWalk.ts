import { useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { SimulationParams } from "../types";

/**
 * Enhanced first-person walk simulation with proper physics
 * Based on proven FPS game mechanics
 */
export const useFirstPersonWalk = (
  cesiumViewer: Cesium.Viewer | null,
  getGroundHeight: (
    position: Cesium.Cartesian3,
    checkSlope?: boolean
  ) => number | null,
  getPressedKeys: () => Set<string>,
  params: SimulationParams
) => {
  // Physics state
  const velocity = useRef(new Cesium.Cartesian3(0, 0, 0));
  const isGrounded = useRef(false);
  const jumpVelocity = useRef(0);
  const lastGroundHeight = useRef(0);

  // Constants
  const GRAVITY = -9.81;
  const JUMP_FORCE = 5.0;
  const FRICTION = 0.85;
  const MAX_SPEED = 10.0;
  const ACCELERATION = 20.0;

  /**
   * Apply physics-based movement
   */
  const applyWalkMovement = useCallback(
    (camera: Cesium.Camera, deltaTime: number) => {
      if (!cesiumViewer) return;

      const keys = getPressedKeys();
      const currentPos = camera.position.clone();

      // Calculate movement input
      const moveInput = new Cesium.Cartesian3(0, 0, 0);

      if (keys.has("KeyW")) moveInput.z -= 1; // Forward
      if (keys.has("KeyS")) moveInput.z += 1; // Backward
      if (keys.has("KeyA")) moveInput.x -= 1; // Strafe left
      if (keys.has("KeyD")) moveInput.x += 1; // Strafe right

      // Normalize input
      if (Cesium.Cartesian3.magnitude(moveInput) > 0) {
        Cesium.Cartesian3.normalize(moveInput, moveInput);
      }

      // Get camera orientation
      const direction = camera.direction.clone();
      const right = camera.right.clone();
      const up = camera.up.clone();

      // Calculate world-space movement direction
      const worldMoveDir = new Cesium.Cartesian3(0, 0, 0);

      // Forward/backward movement
      if (moveInput.z !== 0) {
        const forwardDir = new Cesium.Cartesian3(direction.x, direction.y, 0);
        Cesium.Cartesian3.normalize(forwardDir, forwardDir);
        Cesium.Cartesian3.add(
          worldMoveDir,
          Cesium.Cartesian3.multiplyByScalar(
            forwardDir,
            -moveInput.z,
            new Cesium.Cartesian3()
          ),
          worldMoveDir
        );
      }

      // Strafe movement
      if (moveInput.x !== 0) {
        const rightDir = new Cesium.Cartesian3(right.x, right.y, 0);
        Cesium.Cartesian3.normalize(rightDir, rightDir);
        Cesium.Cartesian3.add(
          worldMoveDir,
          Cesium.Cartesian3.multiplyByScalar(
            rightDir,
            moveInput.x,
            new Cesium.Cartesian3()
          ),
          worldMoveDir
        );
      }

      // Apply acceleration
      if (Cesium.Cartesian3.magnitude(worldMoveDir) > 0) {
        Cesium.Cartesian3.normalize(worldMoveDir, worldMoveDir);
        const acceleration = Cesium.Cartesian3.multiplyByScalar(
          worldMoveDir,
          ACCELERATION * deltaTime,
          new Cesium.Cartesian3()
        );
        Cesium.Cartesian3.add(velocity.current, acceleration, velocity.current);
      } else {
        // Apply friction when not moving
        velocity.current = Cesium.Cartesian3.multiplyByScalar(
          velocity.current,
          FRICTION,
          velocity.current
        );
      }

      // Limit horizontal speed
      const horizontalVelocity = new Cesium.Cartesian3(
        velocity.current.x,
        velocity.current.y,
        0
      );
      if (Cesium.Cartesian3.magnitude(horizontalVelocity) > MAX_SPEED) {
        Cesium.Cartesian3.normalize(horizontalVelocity, horizontalVelocity);
        Cesium.Cartesian3.multiplyByScalar(
          horizontalVelocity,
          MAX_SPEED,
          horizontalVelocity
        );
        velocity.current.x = horizontalVelocity.x;
        velocity.current.y = horizontalVelocity.y;
      }

      // Handle jumping
      if (keys.has("Space") && isGrounded.current) {
        jumpVelocity.current = JUMP_FORCE;
        isGrounded.current = false;
      }

      // Apply gravity
      if (!isGrounded.current) {
        jumpVelocity.current += GRAVITY * deltaTime;
      }

      // Apply vertical velocity
      velocity.current.z = jumpVelocity.current;

      // Calculate new position
      const movement = Cesium.Cartesian3.multiplyByScalar(
        velocity.current,
        deltaTime,
        new Cesium.Cartesian3()
      );
      const newPosition = Cesium.Cartesian3.add(
        currentPos,
        movement,
        new Cesium.Cartesian3()
      );

      // Ground detection and collision
      const groundHeight = getGroundHeight(newPosition, true);
      const playerHeight = params.walkHeight || 1.8;

      if (groundHeight !== null) {
        const cartographic =
          cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
            newPosition
          );
        if (cartographic) {
          const targetHeight = groundHeight + playerHeight;

          // Check if we're on the ground
          if (newPosition.z <= targetHeight && jumpVelocity.current <= 0) {
            // Land on ground
            cartographic.height = targetHeight;
            const groundPosition =
              cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(
                cartographic
              );
            if (groundPosition) {
              camera.position = groundPosition;
              velocity.current.z = 0;
              jumpVelocity.current = 0;
              isGrounded.current = true;
              lastGroundHeight.current = groundHeight;
            }
          } else {
            // In air
            camera.position = newPosition;
            isGrounded.current = false;
          }
        }
      } else {
        // No ground detected, use direct movement
        camera.position = newPosition;
        isGrounded.current = false;
      }

      // Crouch handling
      if (keys.has("ShiftLeft") && isGrounded.current) {
        const crouchHeight = playerHeight * 0.6;
        const cartographic =
          cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(
            camera.position
          );
        if (cartographic) {
          cartographic.height = lastGroundHeight.current + crouchHeight;
          const crouchPosition =
            cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian(
              cartographic
            );
          if (crouchPosition) {
            camera.position = crouchPosition;
          }
        }
      }
    },
    [cesiumViewer, getGroundHeight, getPressedKeys, params.walkHeight]
  );

  /**
   * Reset physics state
   */
  const resetPhysics = useCallback(() => {
    velocity.current = new Cesium.Cartesian3(0, 0, 0);
    isGrounded.current = false;
    jumpVelocity.current = 0;
    lastGroundHeight.current = 0;
  }, []);

  return {
    applyWalkMovement,
    resetPhysics,
    isGrounded: () => isGrounded.current,
    getVelocity: () => velocity.current.clone(),
  };
};
