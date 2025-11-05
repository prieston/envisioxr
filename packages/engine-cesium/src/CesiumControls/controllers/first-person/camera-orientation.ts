import * as Cesium from "cesium";
import type { CameraState } from "./physics-utils";

export function applyYawPitchFromMouseDelta(
  cameraState: CameraState,
  mouseDelta: { x: number; y: number },
  sensitivity: number,
  enuBasisAt: (pos: Cesium.Cartesian3) => {
    east: Cesium.Cartesian3;
    north: Cesium.Cartesian3;
    up: Cesium.Cartesian3;
  }
): void {
  const dx = mouseDelta.x;
  const dy = mouseDelta.y;

  if (dx !== 0 || dy !== 0) {
    const yawDelta = dx * sensitivity;
    const pitchDelta = -dy * sensitivity;

    cameraState.yaw = Cesium.Math.negativePiToPi(
      cameraState.yaw + yawDelta
    );
    cameraState.pitch = Cesium.Math.clamp(
      cameraState.pitch + pitchDelta,
      -Cesium.Math.PI_OVER_TWO + 0.1,
      Cesium.Math.PI_OVER_TWO - 0.1
    );
  }

  const { east, north, up } = enuBasisAt(cameraState.position);

  const dirLocal = new Cesium.Cartesian3(
    Math.cos(cameraState.pitch) * Math.sin(cameraState.yaw),
    Math.cos(cameraState.pitch) * Math.cos(cameraState.yaw),
    Math.sin(cameraState.pitch)
  );

  const dirWorld = new Cesium.Cartesian3(
    east.x * dirLocal.x + north.x * dirLocal.y + up.x * dirLocal.z,
    east.y * dirLocal.x + north.y * dirLocal.y + up.y * dirLocal.z,
    east.z * dirLocal.x + north.z * dirLocal.y + up.z * dirLocal.z
  );
  Cesium.Cartesian3.normalize(dirWorld, dirWorld);

  cameraState.direction = dirWorld;
  cameraState.up = up;

  cameraState.right = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.cross(
      cameraState.direction,
      cameraState.up,
      new Cesium.Cartesian3()
    ),
    new Cesium.Cartesian3()
  );
}

export function initializeCameraFromCurrent(
  camera: Cesium.Camera,
  globe: Cesium.Globe,
  config: { height: number },
  cameraState: CameraState,
  physicsState: { isGrounded: boolean; velocity: Cesium.Cartesian3; jumpVelocity: number },
  groundState: { lastGroundHeight: number; smoothedGroundHeight: number },
  enuBasisAt: (pos: Cesium.Cartesian3) => {
    east: Cesium.Cartesian3;
    north: Cesium.Cartesian3;
    up: Cesium.Cartesian3;
  },
  applyYawPitchWorldFromENU: (
    pos: Cesium.Cartesian3,
    yaw: number,
    pitch: number
  ) => void
): void {
  physicsState.isGrounded = true;
  physicsState.velocity = new Cesium.Cartesian3(0, 0, 0);
  physicsState.jumpVelocity = 0;

  const pos = Cesium.Cartesian3.clone(camera.position);
  const c = Cesium.Cartographic.fromCartesian(pos, globe.ellipsoid);
  if (!c) return;

  const h = globe.getHeight(c) ?? c.height - config.height;
  groundState.lastGroundHeight = h;
  groundState.smoothedGroundHeight = h;

  c.height = h + config.height;
  cameraState.position = Cesium.Cartesian3.fromRadians(
    c.longitude,
    c.latitude,
    c.height
  );

  const { east, north, up } = enuBasisAt(cameraState.position);
  const dirWorld = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.clone(camera.direction),
    new Cesium.Cartesian3()
  );
  const ex = Cesium.Cartesian3.dot(dirWorld, east);
  const ny = Cesium.Cartesian3.dot(dirWorld, north);
  const uz = Cesium.Cartesian3.dot(dirWorld, up);

  cameraState.yaw = Math.atan2(ex, ny);
  cameraState.pitch = Cesium.Math.clamp(
    Math.asin(uz),
    -Cesium.Math.PI_OVER_TWO + 0.1,
    Cesium.Math.PI_OVER_TWO - 0.1
  );

  applyYawPitchWorldFromENU(
    cameraState.position,
    cameraState.yaw,
    cameraState.pitch
  );

  cameraState.right = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.cross(
      cameraState.direction,
      cameraState.up,
      new Cesium.Cartesian3()
    ),
    new Cesium.Cartesian3()
  );
}

