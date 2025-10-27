import * as Cesium from "cesium";
import type { ObservationProperties } from "../types";
import {
  updateFovRadius,
  updateFlags,
  updateColors,
} from "../../../utils/sensors";

interface UpdateSensorParams {
  handle: any;
  properties: ObservationProperties;
  viewer: any;
  modelMatrix: Cesium.Matrix4;
}

export function updateSensorFovRadius(params: UpdateSensorParams) {
  const { handle, properties, viewer } = params;

  if (!handle) {
    console.warn("[updateSensorFovRadius] No handle provided");
    return null;
  }

  console.log("[updateSensorFovRadius] Updating existing sensor, fov:", properties.fov);
  
  const updated = updateFovRadius(handle, {
    fovDeg: properties.fov,
    radius: properties.visibilityRadius,
    viewer,
  });

  return updated;
}

export function applySensorFlags(
  handle: any,
  properties: ObservationProperties,
  viewer: any
) {
  if (!handle) return;

  try {
    // If showSensorGeometry is true, make sure surfaces are visible
    if (properties.showSensorGeometry) {
      handle.showLateralSurfaces = true;
      handle.showDomeSurfaces = true;
    }

    updateFlags(handle, {
      show: !!properties.showSensorGeometry || !!properties.showViewshed,
      showViewshed: !!properties.showViewshed,
    });
    viewer?.scene?.requestRender();
  } catch (err) {
    console.warn("Failed to update flags:", err);
  }
}

export function applySensorColors(
  handle: any,
  properties: ObservationProperties,
  viewer: any
) {
  if (!handle || !properties.sensorColor) return;

  try {
    const color = Cesium.Color.fromCssColorString(properties.sensorColor);
    updateColors(handle, {
      volume: color.withAlpha(0.25),
      visible: color.withAlpha(0.35),
      occluded: Cesium.Color.fromBytes(255, 0, 0, 110),
    });
    viewer?.scene?.requestRender();
  } catch (err) {
    console.warn("Failed to update colors:", err);
  }
}

export function applySensorStyle(
  handle: any,
  properties: ObservationProperties,
  viewer: any
) {
  if (!handle) return;

  requestAnimationFrame(() => {
    applySensorFlags(handle, properties, viewer);
    applySensorColors(handle, properties, viewer);
  });
}
