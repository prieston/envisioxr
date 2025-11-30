import type { CesiumModule } from "../types";

/**
 * Position camera to view a tileset based on transform
 */
export function positionCameraBasic(
  viewer: any,
  Cesium: CesiumModule,
  initialTransform?: number[]
) {
  if (!initialTransform || initialTransform.length !== 16) {
    // Default view of Earth (San Francisco area)
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.4194, 37.7749, 10000000),
      duration: 0,
    });
    return;
  }

  // Extract position from transform matrix
  const translation = new Cesium.Cartesian3(
    initialTransform[12],
    initialTransform[13],
    initialTransform[14]
  );
  const cartographic = Cesium.Cartographic.fromCartesian(translation);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  // Calculate camera position with offset
  const radius = 50; // Approximate tileset size
  const idealHeight = Math.max(height + radius * 4, 50);

  // Fly camera to position
  const destination = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    idealHeight
  );

  const orientation = {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0,
  };

  viewer.camera.flyTo({
    destination,
    orientation,
    duration: 1.5,
  });
}


