import * as Cesium from "cesium";

export function hprRotation(h: number, p: number, r: number): Cesium.Matrix3 {
  const q = Cesium.Quaternion.fromHeadingPitchRoll(
    new Cesium.HeadingPitchRoll(h, p, r)
  );
  return Cesium.Matrix3.fromQuaternion(q);
}

export function enuFrame(origin: Cesium.Cartesian3): Cesium.Matrix4 {
  return Cesium.Transforms.eastNorthUpToFixedFrame(origin);
}

export function worldFromLocal(
  origin: Cesium.Cartesian3,
  vLocal: Cesium.Cartesian3,
  rot: Cesium.Matrix3
): Cesium.Cartesian3 {
  const vRot = Cesium.Matrix3.multiplyByVector(
    rot,
    vLocal,
    new Cesium.Cartesian3()
  );
  return Cesium.Cartesian3.add(origin, vRot, new Cesium.Cartesian3());
}

export function unitFromAzEl(az: number, el: number): Cesium.Cartesian3 {
  // local frame: +X forward, +Y left, +Z up
  const cosEl = Math.cos(el);
  return new Cesium.Cartesian3(
    Math.cos(az) * cosEl, // X
    Math.sin(az) * cosEl, // Y
    Math.sin(el) // Z
  );
}

