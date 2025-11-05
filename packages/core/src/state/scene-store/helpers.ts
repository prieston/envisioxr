import * as THREE from "three";

export function findIntersectionPoint(
  scene: THREE.Scene,
  camera: THREE.Camera
): [number, number, number] {
  const raycaster = new THREE.Raycaster();
  const cameraPosition = camera.position.clone();
  const cameraTarget = new THREE.Vector3(0, 0, -1).unproject(camera);
  const direction = cameraTarget.sub(cameraPosition).normalize();
  raycaster.set(cameraPosition, direction);
  const allMeshes: THREE.Mesh[] = [];
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      allMeshes.push(object);
    }
  });
  const intersects = raycaster.intersectObjects(allMeshes);
  if (intersects.length > 0) {
    const hitPoint = intersects[0].point;
    return [hitPoint.x, hitPoint.y, hitPoint.z];
  }
  return [0, 0, 0];
}

