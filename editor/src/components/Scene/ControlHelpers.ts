import * as THREE from "three";
import { Vector3 } from "three";

// Common key states interface
export interface KeyStates {
  w: boolean;
  s: boolean;
  a: boolean;
  d: boolean;
  space?: boolean;
  shiftLeft?: boolean;
}

// Common movement parameters interface
export interface MovementParams {
  moveSpeed: number;
  jumpForce?: number;
  rotationSpeed?: number;
  maxSpeed?: number;
  friction?: number;
}

// Helper to handle keyboard input
export const handleKeyboardInput = (
  e: KeyboardEvent,
  keys: KeyStates,
  isKeyDown: boolean
) => {
  switch (e.code) {
    case "KeyW":
      keys.w = isKeyDown;
      break;
    case "KeyS":
      keys.s = isKeyDown;
      break;
    case "KeyA":
      keys.a = isKeyDown;
      break;
    case "KeyD":
      keys.d = isKeyDown;
      break;
    case "Space":
      if (keys.space !== undefined) keys.space = isKeyDown;
      break;
    case "ShiftLeft":
      if (keys.shiftLeft !== undefined) keys.shiftLeft = isKeyDown;
      break;
  }
};

// Helper to calculate movement direction based on camera orientation
export const calculateMovementDirection = (
  camera: THREE.Camera,
  keys: KeyStates,
  moveDirection: Vector3,
  forward: Vector3,
  right: Vector3
) => {
  moveDirection.set(0, 0, 0);

  // Get forward and right vectors from camera
  forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
  right.set(1, 0, 0).applyQuaternion(camera.quaternion);

  // Forward/Backward
  if (keys.w) moveDirection.add(forward);
  if (keys.s) moveDirection.sub(forward);

  // Left/Right (strafe)
  if (keys.a) moveDirection.sub(right);
  if (keys.d) moveDirection.add(right);

  // Normalize movement direction
  if (moveDirection.length() > 0) {
    moveDirection.normalize();
  }
};

// Helper to handle ground detection
export const detectGround = (
  raycaster: THREE.Raycaster,
  scene: THREE.Scene,
  position: Vector3,
  rayOrigins: Vector3[],
  rayDir: Vector3
): { isOnGround: boolean; groundHeight: number } => {
  const allMeshes: THREE.Mesh[] = [];
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      allMeshes.push(object);
    }
  });

  const groundHeights: number[] = [];

  // Cast all rays and collect ground heights
  for (const origin of rayOrigins) {
    raycaster.set(origin, rayDir);
    const intersects = raycaster.intersectObjects(allMeshes);
    if (intersects.length > 0) {
      groundHeights.push(intersects[0].point.y);
    }
  }

  // Calculate average ground height from all samples
  let groundHeight = position.y;
  if (groundHeights.length > 0) {
    // Sort heights and take the median to avoid outliers
    groundHeights.sort((a, b) => a - b);
    const medianIndex = Math.floor(groundHeights.length / 2);
    groundHeight = groundHeights[medianIndex];
  }

  return {
    isOnGround: groundHeights.length > 0,
    groundHeight,
  };
};

// Helper to create ray origins for ground detection
export const createRayOrigins = (
  position: Vector3,
  heightOffset: number = 1.0,
  spread: number = 0.5
): Vector3[] => {
  return [
    new Vector3(position.x, position.y + heightOffset, position.z),
    new Vector3(position.x + spread, position.y + heightOffset, position.z),
    new Vector3(position.x - spread, position.y + heightOffset, position.z),
    new Vector3(position.x, position.y + heightOffset, position.z + spread),
    new Vector3(position.x, position.y + heightOffset, position.z - spread),
  ];
};

// Helper to apply movement with physics
export const applyMovement = (
  position: Vector3,
  moveDirection: Vector3,
  velocity: Vector3,
  params: MovementParams,
  delta: number,
  isOnGround: boolean
) => {
  const { moveSpeed, friction = 1, maxSpeed = Infinity } = params;

  // Apply movement
  velocity.addScaledVector(moveDirection, moveSpeed * delta);

  // Apply friction
  if (isOnGround) {
    velocity.multiplyScalar(friction);
  }

  // Limit speed
  if (velocity.length() > maxSpeed) {
    velocity.normalize().multiplyScalar(maxSpeed);
  }

  // Update position
  position.addScaledVector(velocity, delta);
};

// Helper to handle third person camera positioning
export const updateThirdPersonCamera = (
  camera: THREE.Camera,
  targetPosition: Vector3,
  cameraDistance: number,
  cameraHeight: number,
  rotationY: number
) => {
  const cameraOffset = new Vector3(
    Math.sin(rotationY) * -cameraDistance,
    cameraHeight,
    Math.cos(rotationY) * -cameraDistance
  );
  camera.position.copy(targetPosition).add(cameraOffset);
  camera.lookAt(targetPosition);
};
