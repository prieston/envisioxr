import React, { useEffect, useRef } from "react";
import { Text, Plane } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IoTDataDisplayProps {
  position: [number, number, number];
  data: {
    speed: number;
    volume: number;
    occupancy: number;
  };
}

const IoTDataDisplay: React.FC<IoTDataDisplayProps> = ({ position, data }) => {
  const groupRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.Camera>();

  // Get camera reference from the scene
  useEffect(() => {
    const camera = document.querySelector("canvas")?.__r3f?.camera;
    if (camera) {
      cameraRef.current = camera;
    }
  }, []);

  // Update text scale and rotation based on camera
  useFrame(() => {
    if (groupRef.current && cameraRef.current) {
      const distance = groupRef.current.position.distanceTo(
        cameraRef.current.position
      );
      const scale = Math.max(0.5, Math.min(2, distance * 0.1));
      groupRef.current.scale.set(scale, scale, scale);

      // Make the panel always face the camera
      groupRef.current.lookAt(cameraRef.current.position);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1] + 2, position[2]]}
    >
      {/* Background panel */}
      <Plane args={[2, 1.5]} position={[0, 0, -0.01]}>
        <meshBasicMaterial
          color="#1a1a1a"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Border */}
      <Plane args={[2.1, 1.6]} position={[0, 0, -0.02]}>
        <meshBasicMaterial
          color="#4a4a4a"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </Plane>

      {/* Data text */}
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.2}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {`SPEED: ${data.speed}`}
      </Text>
      <Text
        position={[0, 0, 0]}
        fontSize={0.2}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {`VOLUME: ${data.volume}`}
      </Text>
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.2}
        color="#ff00ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="black"
      >
        {`OCCUPANCY: ${data.occupancy}`}
      </Text>
    </group>
  );
};

export default IoTDataDisplay;
