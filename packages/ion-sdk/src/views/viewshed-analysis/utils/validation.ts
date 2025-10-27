import * as Cesium from "cesium";

export function validatePosition(position: Cesium.Cartesian3): {
  valid: boolean;
  error?: string;
} {
  if (
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.y) ||
    !Number.isFinite(position.z)
  ) {
    return { valid: false, error: "Invalid sensor position coordinates" };
  }
  return { valid: true };
}

export function validateRadius(radius: number): {
  valid: boolean;
  error?: string;
} {
  if (!isFinite(radius) || radius <= 0) {
    return { valid: false, error: `Invalid radius: ${radius}` };
  }
  return { valid: true };
}

export function normalizePositionArray(
  position: [number, number, number] | any
): [number, number, number] {
  if (Array.isArray(position) && position.length >= 3) {
    return [position[0], position[1], position[2]];
  }
  return [0, 0, 0];
}

export function normalizeRotationArray(
  rotation: [number, number, number] | any
): [number, number, number] {
  return Array.isArray(rotation) && rotation.length >= 3
    ? [rotation[0] || 0, rotation[1] || 0, rotation[2] || 0]
    : [0, 0, 0];
}
