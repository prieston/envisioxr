import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import {
  createConicSensor,
  createRectangularSensor,
  updateColors,
  updateFlags,
} from "../../../utils/sensors";
import {
  buildModelMatrix,
  validatePosition,
  validateRadius,
  normalizePositionArray,
  normalizeRotationArray,
} from "../utils";

interface CreateSensorParams {
  viewer: any;
  position: [number, number, number];
  rotation: [number, number, number];
  properties: ObservationProperties;
}

export function createSensor(params: CreateSensorParams) {
  const { viewer, position, rotation, properties } = params;

  const positionArray = normalizePositionArray(position);
  const rotationArray = normalizeRotationArray(rotation);

  const sensorPosition = Cesium.Cartesian3.fromDegrees(
    positionArray[0], // longitude
    positionArray[1], // latitude
    positionArray[2] // height
  );

  const positionValidation = validatePosition(sensorPosition);
  if (!positionValidation.valid) {
    throw new Error(positionValidation.error);
  }

  const radius = Math.max(1, properties.visibilityRadius || 100);
  const radiusValidation = validateRadius(radius);
  if (!radiusValidation.valid) {
    throw new Error(radiusValidation.error);
  }

  const modelMatrix = buildModelMatrix(
    positionArray,
    rotationArray,
    properties.sensorForwardAxis ?? "X+",
    properties.modelFrontAxis ?? "Z+",
    properties.tiltDeg ?? 0
  );

  const sensorColor = (
    properties.sensorColor
      ? Cesium.Color.fromCssColorString(properties.sensorColor)
      : Cesium.Color.GREEN
  ).withAlpha(1.0);

  let sensor: any = null;

  if (properties.sensorType === "rectangle") {
    sensor = createRectangularSensor({
      viewer,
      modelMatrix,
      fovHdeg: properties.fovH ?? properties.fov ?? 60,
      fovVdeg: properties.fovV ?? (properties.fov ?? 60) * 0.6,
      radius,
      sensorColor,
      include3DModels: properties.include3DModels,
    });
  } else {
    sensor = createConicSensor({
      viewer,
      modelMatrix,
      fovDeg: properties.fov ?? 60,
      radius,
      sensorColor,
      include3DModels: properties.include3DModels,
    });
  }

  if (!sensor) {
    throw new Error("Failed to create sensor");
  }

  updateColors(sensor, {
    volume: sensorColor.withAlpha(0.25),
    visible: sensorColor.withAlpha(0.35),
    occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
  });

  // Update flags - only set geometry visibility, don't override the surfaces we already set to true
  updateFlags(sensor, {
    show: !!properties.showSensorGeometry || !!properties.showViewshed,
    showViewshed: !!properties.showViewshed,
  });

  viewer.scene.requestRender();

  return { sensor };
}

export function computeShapeSignature(
  properties: ObservationProperties
): string {
  return JSON.stringify({
    type: properties.sensorType,
    fovH: properties.sensorType === "rectangle" ? properties.fovH : undefined,
    fovV: properties.sensorType === "rectangle" ? properties.fovV : undefined,
    include: properties.include3DModels,
  });
}
