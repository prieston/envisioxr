"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface MagnetControlsProps {
  enabled: boolean;
  target: THREE.Object3D;
  heightOffset?: number;
  smoothingFactor?: number;
}

export default function MagnetControls({
  enabled,
  target,
  heightOffset = 0,
  smoothingFactor = 0.1,
}: MagnetControlsProps) {
  const { scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster()).current;
  const lastGroundY = useRef<number | null>(null);

  useFrame(() => {
    if (!enabled) return;

    // Cast ray from above the target
    const origin = target.position.clone().add(new THREE.Vector3(0, 10, 0));
    raycaster.set(origin, new THREE.Vector3(0, -1, 0));

    // Find all meshes in the scene
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        allMeshes.push(object);
      }
    });

    // Cast ray against all meshes
    const intersects = raycaster.intersectObjects(allMeshes);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const targetY = hitPoint.y + heightOffset;

      // Smooth transition to ground height
      if (lastGroundY.current === null) {
        lastGroundY.current = targetY;
      } else {
        lastGroundY.current = THREE.MathUtils.lerp(
          lastGroundY.current,
          targetY,
          smoothingFactor
        );
      }

      // Update target position
      target.position.y = lastGroundY.current;
    }
  });

  return null;
}
