import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

interface ObservationVisibilityAreaProps {
  position: [number, number, number];
  rotation: [number, number, number];
  fov: number;
  radius: number;
  showVisibleArea: boolean;
}

const ObservationVisibilityArea: React.FC<ObservationVisibilityAreaProps> = ({
  position,
  rotation,
  fov,
  radius,
  showVisibleArea,
}) => {
  const { scene } = useThree();
  const visibilityAreaRef = useRef<THREE.Mesh>();
  const materialRef = useRef<THREE.MeshBasicMaterial>();

  useEffect(() => {
    if (!showVisibleArea) {
      if (visibilityAreaRef.current) {
        scene.remove(visibilityAreaRef.current);
      }
      return;
    }

    // Create a cone geometry for the visibility area
    const geometry = new THREE.ConeGeometry(radius, radius, 32, 1, true);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Create a group to handle the position and rotation
    const group = new THREE.Group();
    group.position.set(...position);
    group.rotation.set(...rotation);

    // Add the cone to the group, positioned at the origin
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(Math.PI / 2, 0, 0); // Rotate to point forward

    // Scale the cone based on FOV
    const scale = Math.tan((fov * Math.PI) / 360);
    mesh.scale.set(scale, 1, scale);

    // Move the cone's origin to its base
    geometry.translate(0, -radius / 2, 0);

    group.add(mesh);
    scene.add(group);
    visibilityAreaRef.current = mesh;
    materialRef.current = material;

    return () => {
      if (visibilityAreaRef.current) {
        scene.remove(group);
      }
    };
  }, [scene, position, rotation, fov, radius, showVisibleArea]);

  return null;
};

export default ObservationVisibilityArea;
