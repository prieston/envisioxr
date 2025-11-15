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

export async function createSensor(params: CreateSensorParams) {
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
    sensor = await createRectangularSensor({
      viewer,
      modelMatrix,
      fovHdeg: properties.fovH ?? properties.fov ?? 60,
      fovVdeg: properties.fovV ?? (properties.fov ?? 60) * 0.6,
      radius,
      sensorColor,
      include3DModels: properties.include3DModels,
    });
  } else {
    sensor = await createConicSensor({
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

  // Use viewshedOpacity from properties, default to 0.35 if not specified
  const opacity = properties.viewshedOpacity ?? 0.35;
  // Use theme error color for occluded areas (softer than pure red)
  const THEME_ERROR_RED = "#ef4444"; // Light mode error color
  // Occluded areas use slightly higher opacity for better visibility
  const occludedOpacity = Math.min(opacity * 1.23, 1.0); // ~43% when opacity is 35%
  const occludedColor = Cesium.Color.fromCssColorString(THEME_ERROR_RED).withAlpha(occludedOpacity);

  updateColors(sensor, {
    volume: sensorColor.withAlpha(opacity * 0.71), // ~25% when opacity is 35%
    visible: sensorColor.withAlpha(opacity), // Use the user-defined opacity
    occluded: occludedColor,
  });

  updateFlags(sensor, {
    show: !!properties.showSensorGeometry || !!properties.showViewshed,
    showGeometry: !!properties.showSensorGeometry,
    showViewshed: !!properties.showViewshed,
  });

  const volumeMat = Cesium.Material.fromType("Color", {
    color: sensorColor.withAlpha(0.25),
  });
  sensor.lateralSurfaceMaterial = volumeMat;
  sensor.domeSurfaceMaterial = volumeMat;
  sensor.showEnvironmentOcclusion = false;
  sensor.showEnvironmentIntersection = false;
  sensor.showIntersection = false;

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
