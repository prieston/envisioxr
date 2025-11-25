import React from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useSceneStore } from "@klorad/core";

const GroundPlane = () => {
  const gridEnabled = useSceneStore((state) => state.gridEnabled);
  if (!gridEnabled) return null;

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* 1000×1000 plane, 0.2 units thick, centered at y = –0.1 */}
      <CuboidCollider args={[500, 0.1, 500]} position={[0, -0.1, 0]} />

      {gridEnabled && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial
            color="#1a1a1a"
            transparent
            opacity={0.8}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      )}
    </RigidBody>
  );
};

export default GroundPlane;
