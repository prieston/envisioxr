import * as Cesium from "cesium";

export function flyToCesiumPosition(
  viewer: Cesium.Viewer,
  lon: number,
  lat: number,
  height: number,
  options?: { radius?: number; duration?: number }
) {
  const position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
  const sphere = new Cesium.BoundingSphere(position, options?.radius ?? 50);
  viewer.camera.flyToBoundingSphere(sphere, {
    duration: options?.duration ?? 2.0,
    offset: new Cesium.HeadingPitchRange(0.0, -Cesium.Math.PI_OVER_FOUR, 100.0),
  });
}
