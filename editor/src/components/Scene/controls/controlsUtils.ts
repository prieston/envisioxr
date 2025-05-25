// controlsUtils.ts
import * as THREE from "three";
import { Camera } from "@react-three/fiber";
import { Scene } from "three";

export const downVec = new THREE.Vector3(0, -1, 0);

/**
 * Raycasts straight down from a height above the camera (or any object)
 * and returns the Y‑coordinate of the ground. If nothing is hit, returns -Infinity.
 */
export function raycastGroundY(
  camera: Camera,
  scene: Scene,
  raycaster: THREE.Raycaster,
  rayHeight = 50
): number {
  const origin = camera.position
    .clone()
    .add(new THREE.Vector3(0, rayHeight, 0));
  raycaster.set(origin, downVec);
  const hit = raycaster.intersectObjects(scene.children, true)[0];
  return hit ? hit.point.y : -Infinity;
}

/**
 * Applies simple gravity and ground snap to a vertical velocity + camera position.
 * Returns the new Y velocity, and updates camera.position.y in-place.
 */
export function applyGravityAndSnap(
  camera: Camera,
  velocityY: number,
  dt: number,
  scene: Scene,
  raycaster: THREE.Raycaster,
  {
    gravity = 9.81,
    playerHeight = 1.8,
    rayHeight = 50,
    groundEps = 0.1,
  }: {
    gravity?: number;
    playerHeight?: number;
    rayHeight?: number;
    groundEps?: number;
  } = {}
): { velocityY: number; onGround: boolean } {
  // fall
  velocityY -= gravity * dt;
  camera.position.y += velocityY * dt;

  // ground
  const groundY = raycastGroundY(camera, scene, raycaster, rayHeight);
  const targetY = groundY + playerHeight;
  if (camera.position.y <= targetY + groundEps) {
    camera.position.y = targetY;
    return { velocityY: 0, onGround: true };
  }
  return { velocityY, onGround: false };
}

/**
 * Applies horizontal movement based on a keys record and yaw angle.
 * Updates camera.position.x/z in-place.
 */
export function applyMovement(
  camera: Camera,
  yaw: number,
  dt: number,
  keys: Record<"w" | "a" | "s" | "d" | "shift", boolean>,
  {
    walkSpeed = 4,
    runSpeed = 8,
  }: { walkSpeed?: number; runSpeed?: number } = {}
) {
  const speed = keys.shift ? runSpeed : walkSpeed;
  const dir = new THREE.Vector3(
    keys.d ? 1 : keys.a ? -1 : 0,
    0,
    keys.s ? 1 : keys.w ? -1 : 0
  );
  if (dir.lengthSq() > 0) {
    dir.normalize().multiplyScalar(speed * dt);
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    camera.position.x += dir.x;
    camera.position.z += dir.z;
  }
}

/**
 * Sets up pointer-lock on the canvas and mouse-look controls.
 * Returns a cleanup function.
 */
export function enablePointerLockMouseLook(
  camera: Camera,
  domElement: HTMLElement,
  opts = {
    sensitivity: 0.002 as number,
    initialOrder: "YXZ" as THREE.EulerOrder,
  }
): {
  cleanup: () => void;
  getYaw: () => number;
  getPitch: () => number;
} {
  camera.rotation.order = opts.initialOrder;
  let yaw = 0,
    pitch = 0;

  const requestLock = () => domElement.requestPointerLock();
  const onMouse = (e: MouseEvent) => {
    if (document.pointerLockElement !== domElement) return;
    yaw -= e.movementX * opts.sensitivity;
    pitch -= e.movementY * opts.sensitivity;
    const limit = Math.PI / 2 - 0.01;
    pitch = Math.max(-limit, Math.min(limit, pitch));
    camera.rotation.set(pitch, yaw, 0);
  };

  domElement.addEventListener("click", requestLock);
  document.addEventListener("mousemove", onMouse);

  return {
    cleanup: () => {
      domElement.removeEventListener("click", requestLock);
      document.removeEventListener("mousemove", onMouse);
    },
    getYaw: () => yaw,
    getPitch: () => pitch,
  };
}
