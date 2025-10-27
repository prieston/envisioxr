import * as Cesium from "cesium";
import type { AxisDirection } from "../types";

export function axisToVec(axis: AxisDirection): Cesium.Cartesian3 {
  switch (axis) {
    case "X+":
      return new Cesium.Cartesian3(1, 0, 0);
    case "X-":
      return new Cesium.Cartesian3(-1, 0, 0);
    case "Y+":
      return new Cesium.Cartesian3(0, 1, 0);
    case "Y-":
      return new Cesium.Cartesian3(0, -1, 0);
    case "Z+":
      return new Cesium.Cartesian3(0, 0, 1);
    case "Z-":
      return new Cesium.Cartesian3(0, 0, -1);
  }
}

export function quatBetween(
  from: Cesium.Cartesian3,
  to: Cesium.Cartesian3
): Cesium.Quaternion {
  const f = Cesium.Cartesian3.normalize(from, new Cesium.Cartesian3());
  const t = Cesium.Cartesian3.normalize(to, new Cesium.Cartesian3());
  const dot = Cesium.Cartesian3.dot(f, t);

  if (dot < -0.999999) {
    const ortho =
      Math.abs(f.x) < 0.9
        ? new Cesium.Cartesian3(1, 0, 0)
        : new Cesium.Cartesian3(0, 1, 0);
    const axis = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.cross(f, ortho, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    return Cesium.Quaternion.fromAxisAngle(axis, Math.PI);
  }
  if (dot > 0.999999) {
    return Cesium.Quaternion.IDENTITY;
  }
  const axis = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.cross(f, t, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );
  const angle = Math.acos(dot);
  return Cesium.Quaternion.fromAxisAngle(axis, angle);
}

export function buildLocalInstallMatrix(
  sensorForward: AxisDirection,
  modelFront: AxisDirection,
  tiltDeg = 0
): Cesium.Matrix4 {
  const qAlign = quatBetween(axisToVec(sensorForward), axisToVec(modelFront));
  let q = qAlign;
  if (tiltDeg && Math.abs(tiltDeg) > 1e-6) {
    const qTilt = Cesium.Quaternion.fromAxisAngle(
      axisToVec(modelFront),
      Cesium.Math.toRadians(tiltDeg)
    );
    q = Cesium.Quaternion.multiply(qAlign, qTilt, new Cesium.Quaternion());
  }
  const m3 = Cesium.Matrix3.fromQuaternion(q);
  return Cesium.Matrix4.fromRotationTranslation(m3, Cesium.Cartesian3.ZERO);
}

export function buildModelMatrix(
  position: [number, number, number],
  rotation: [number, number, number],
  sensorForwardAxis: AxisDirection,
  modelFrontAxis: AxisDirection,
  tiltDeg = 0
): Cesium.Matrix4 {
  const [longitude, latitude, height] = position;
  const [heading, pitch, roll] = rotation;

  const sensorPosition = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    height
  );
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

  let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
    sensorPosition,
    hpr,
    Cesium.Ellipsoid.WGS84,
    Cesium.Transforms.eastNorthUpToFixedFrame
  );

  const install = buildLocalInstallMatrix(
    sensorForwardAxis,
    modelFrontAxis,
    tiltDeg
  );

  return Cesium.Matrix4.multiply(modelMatrix, install, new Cesium.Matrix4());
}
