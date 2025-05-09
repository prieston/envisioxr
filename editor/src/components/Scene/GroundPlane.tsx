import React from "react";
import { RigidBody } from "@react-three/rapier";
import useSceneStore from "../../../app/hooks/useSceneStore";

const GroundPlane = () => {
  const gridEnabled = useSceneStore((state) => state.gridEnabled);

  if (!gridEnabled) return null;

  return (
    <RigidBody type="fixed" colliders="cuboid">
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
    </RigidBody>
  );
};

export default GroundPlane;
