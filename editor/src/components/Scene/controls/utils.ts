import * as THREE from "three";
import { useRapier } from "@react-three/rapier";

export const findGroundPosition = (position: THREE.Vector3): THREE.Vector3 => {
  const { world } = useRapier();
  const ray = new THREE.Ray(
    position.clone().add(new THREE.Vector3(0, 1, 0)),
    new THREE.Vector3(0, -1, 0)
  );
  const hit = world.castRay(ray, 10, true);
  if (hit) {
    return hit.point;
  }
  return position;
};

export const createGroundRaycaster = () => {
  return new THREE.Raycaster();
};

export const setupKeyboardControls = (keys: { [key: string]: boolean }) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
        keys.w = true;
        break;
      case "KeyS":
        keys.s = true;
        break;
      case "KeyA":
        keys.a = true;
        break;
      case "KeyD":
        keys.d = true;
        break;
      case "Space":
        keys.space = true;
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
        keys.w = false;
        break;
      case "KeyS":
        keys.s = false;
        break;
      case "KeyA":
        keys.a = false;
        break;
      case "KeyD":
        keys.d = false;
        break;
      case "Space":
        keys.space = false;
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
};
