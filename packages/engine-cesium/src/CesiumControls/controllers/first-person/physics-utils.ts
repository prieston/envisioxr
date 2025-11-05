import * as Cesium from "cesium";
import { MOVEMENT_KEYS } from "../../constants";

export interface PhysicsState {
  velocity: Cesium.Cartesian3;
  isGrounded: boolean;
  jumpVelocity: number;
}

export interface CameraState {
  position: Cesium.Cartesian3;
  direction: Cesium.Cartesian3;
  up: Cesium.Cartesian3;
  right: Cesium.Cartesian3;
  yaw: number;
  pitch: number;
}

export interface InputState {
  keys: Set<string>;
  mouseDelta: { x: number; y: number };
  isPointerLocked: boolean;
}

export interface Config {
  acceleration: number;
  friction: number;
  maxSpeed: number;
  jumpForce: number;
  gravity: number;
  height: number;
  sensitivity: number;
  debugMode: boolean;
}

export interface GroundState {
  isJumping: boolean;
  lastGroundHeight: number;
  smoothedGroundHeight: number;
  wasGrounded: boolean;
  lastTargetHeight: number | null;
}

export function calculateMovementInput(inputState: InputState): Cesium.Cartesian3 {
  const moveInput = new Cesium.Cartesian3(
    inputState.keys.has(MOVEMENT_KEYS.LEFT)
      ? -1
      : inputState.keys.has(MOVEMENT_KEYS.RIGHT)
        ? 1
        : 0,
    0,
    inputState.keys.has(MOVEMENT_KEYS.FORWARD)
      ? -1
      : inputState.keys.has(MOVEMENT_KEYS.BACKWARD)
        ? 1
        : 0
  );
  if (Cesium.Cartesian3.magnitude(moveInput) > 0) {
    Cesium.Cartesian3.normalize(moveInput, moveInput);
  }
  return moveInput;
}

export function calculateWorldMovementDirection(
  moveInput: Cesium.Cartesian3,
  forward: Cesium.Cartesian3,
  right: Cesium.Cartesian3
): Cesium.Cartesian3 {
  const worldMove = new Cesium.Cartesian3(0, 0, 0);
  if (moveInput.z !== 0) {
    Cesium.Cartesian3.add(
      worldMove,
      Cesium.Cartesian3.multiplyByScalar(
        forward,
        -moveInput.z,
        new Cesium.Cartesian3()
      ),
      worldMove
    );
  }
  if (moveInput.x !== 0) {
    Cesium.Cartesian3.add(
      worldMove,
      Cesium.Cartesian3.multiplyByScalar(right, moveInput.x, new Cesium.Cartesian3()),
      worldMove
    );
  }
  if (Cesium.Cartesian3.magnitude(worldMove) > 0) {
    Cesium.Cartesian3.normalize(worldMove, worldMove);
  }
  return worldMove;
}

export function updateHorizontalVelocity(
  vHoriz: Cesium.Cartesian3,
  worldMove: Cesium.Cartesian3,
  up: Cesium.Cartesian3,
  config: Config,
  boost: number,
  h: number,
  friction: number
): Cesium.Cartesian3 {
  if (Cesium.Cartesian3.magnitude(worldMove) > 0) {
    const a = config.acceleration * boost * h;
    Cesium.Cartesian3.add(
      vHoriz,
      Cesium.Cartesian3.multiplyByScalar(worldMove, a, new Cesium.Cartesian3()),
      vHoriz
    );
  } else {
    vHoriz = Cesium.Cartesian3.multiplyByScalar(vHoriz, friction, vHoriz);
    if (Cesium.Cartesian3.magnitude(vHoriz) < 0.01) {
      vHoriz = new Cesium.Cartesian3(0, 0, 0);
    }
  }
  return vHoriz;
}

export function clampHorizontalSpeed(
  vHoriz: Cesium.Cartesian3,
  maxSpeed: number,
  boost: number
): Cesium.Cartesian3 {
  const maxH = maxSpeed * boost;
  const vHorizMag = Cesium.Cartesian3.magnitude(vHoriz);
  if (vHorizMag > maxH) {
    Cesium.Cartesian3.multiplyByScalar(
      Cesium.Cartesian3.normalize(vHoriz, new Cesium.Cartesian3()),
      maxH,
      vHoriz
    );
  }
  return vHoriz;
}

