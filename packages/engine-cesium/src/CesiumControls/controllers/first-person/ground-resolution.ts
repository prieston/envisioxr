import * as Cesium from "cesium";
import { MOVEMENT_KEYS } from "../../constants";
import type { PhysicsState, GroundState, Config, InputState } from "./physics-utils";

export function resolveGround(
  proposed: Cesium.Cartesian3,
  currentPosition: Cesium.Cartesian3,
  globe: Cesium.Globe,
  groundState: GroundState,
  physicsState: PhysicsState,
  config: Config,
  debugMode: boolean,
  logger: any
): Cesium.Cartesian3 {
  if (
    !proposed ||
    !Number.isFinite(proposed.x) ||
    !Number.isFinite(proposed.y) ||
    !Number.isFinite(proposed.z)
  ) {
    return currentPosition;
  }

  const ellipsoid = globe.ellipsoid;
  const carto = Cesium.Cartographic.fromCartesian(proposed, ellipsoid);
  if (!carto) return currentPosition;

  const hRaw = globe.getHeight(carto);
  if (hRaw !== undefined) {
    const a = 0.15;
    if (!Number.isNaN(groundState.smoothedGroundHeight)) {
      groundState.smoothedGroundHeight =
        groundState.smoothedGroundHeight +
        a * (hRaw - groundState.smoothedGroundHeight);
    } else {
      groundState.smoothedGroundHeight = hRaw;
    }

    const CLEAR = 0.25;
    const targetRaw =
      groundState.smoothedGroundHeight + config.height + CLEAR;

    const TARGET_HOLD_BAND = 0.2;
    if (groundState.lastTargetHeight == null) {
      groundState.lastTargetHeight = targetRaw;
    } else if (
      Math.abs(targetRaw - groundState.lastTargetHeight) > TARGET_HOLD_BAND
    ) {
      groundState.lastTargetHeight = targetRaw;
    }
    const target = groundState.lastTargetHeight;

    const belowBy = target - carto.height;
    const SNAP_UP_EPS = 0.1;
    const FALL_EPS = 0.5;

    let groundedNow = groundState.wasGrounded;

    if (belowBy >= SNAP_UP_EPS || !groundState.isJumping) {
      carto.height = target;
      const landed = Cesium.Cartesian3.fromRadians(
        carto.longitude,
        carto.latitude,
        carto.height
      );

      physicsState.isGrounded = true;
      groundState.isJumping = false;
      groundedNow = true;
      groundState.lastGroundHeight = groundState.smoothedGroundHeight;

      if (debugMode && !groundState.wasGrounded) {
        logger.debug("LAND", { target });
      }
      groundState.wasGrounded = groundedNow;
      return landed;
    }

    if (belowBy <= -FALL_EPS && groundState.isJumping) {
      physicsState.isGrounded = false;
      groundedNow = false;
      if (debugMode && groundState.wasGrounded) {
        logger.debug("AIR", { cartoH: carto.height, target });
      }
      groundState.wasGrounded = groundedNow;
      return proposed;
    }

    physicsState.isGrounded = true;
    groundedNow = true;
    groundState.wasGrounded = groundedNow;
    return proposed;
  }

  physicsState.isGrounded = true;
  physicsState.jumpVelocity = 0;
  physicsState.velocity.z = 0;
  groundState.wasGrounded = true;
  return proposed;
}

export function handleCrouch(
  currentPos: Cesium.Cartesian3,
  physicsState: PhysicsState,
  inputState: InputState,
  groundState: GroundState,
  config: Config
): Cesium.Cartesian3 {
  if (!physicsState.isGrounded) return currentPos;
  if (!inputState.keys.has(MOVEMENT_KEYS.CROUCH)) return currentPos;

  const carto = Cesium.Cartographic.fromCartesian(currentPos);
  carto.height = groundState.lastGroundHeight + config.height * 0.6;
  return Cesium.Cartesian3.fromRadians(
    carto.longitude,
    carto.latitude,
    carto.height
  );
}

