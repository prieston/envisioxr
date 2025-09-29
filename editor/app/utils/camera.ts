import * as Cesium from "cesium";
import * as THREE from "three";

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

export function flyToThreeObject(
  object: THREE.Object3D,
  orbitControls: {
    object: THREE.Camera;
    target: THREE.Vector3;
    update: () => void;
  },
  minDistance: number = 15
) {
  const target = object.position.clone();
  const bbox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = Math.max(maxDim * 2.5, minDistance);

  const offset = new THREE.Vector3(
    distance * 0.7,
    distance * 0.8,
    distance * 0.7
  );
  orbitControls.object.position.copy(target).add(offset);
  orbitControls.target.copy(target);
  (orbitControls.object as THREE.Camera).lookAt(target);
  orbitControls.update();
}

