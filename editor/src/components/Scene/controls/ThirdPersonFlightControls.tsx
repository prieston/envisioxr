import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import * as THREE from "three";
import { Vector3 } from "three";

const ThirdPersonFlightControls = () => {
  const { camera } = useThree();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const moveSpeed = controlSettings.flightSpeed;
  const rotationSpeed = controlSettings.turnSpeed;
  const vehicleRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const cameraDistance = 10;
  const cameraHeight = 3;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = new Vector3();

      switch (e.code) {
        case "KeyW":
          direction.z = -1;
          break;
        case "KeyS":
          direction.z = 1;
          break;
        case "KeyA":
          direction.x = -1;
          break;
        case "KeyD":
          direction.x = 1;
          break;
        case "Space":
          direction.y = 1;
          break;
        case "ShiftLeft":
          direction.y = -1;
          break;
      }

      direction.applyQuaternion(vehicleRef.current.quaternion);
      vehicleRef.current.position.addScaledVector(direction, moveSpeed);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        vehicleRef.current.rotation.y -= e.movementX * rotationSpeed;
        vehicleRef.current.rotation.x -= e.movementY * rotationSpeed;
        vehicleRef.current.rotation.x = Math.max(
          -Math.PI / 4,
          Math.min(Math.PI / 4, vehicleRef.current.rotation.x)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [moveSpeed, rotationSpeed]);

  useFrame(() => {
    // Update camera position to follow the vehicle
    const targetPosition = vehicleRef.current.position.clone();
    const cameraOffset = new Vector3(
      Math.sin(vehicleRef.current.rotation.y) * -cameraDistance,
      cameraHeight,
      Math.cos(vehicleRef.current.rotation.y) * -cameraDistance
    );
    camera.position.copy(targetPosition).add(cameraOffset);
    camera.lookAt(targetPosition);
  });

  return (
    <primitive object={vehicleRef.current}>
      {/* Visual representation of the airplane */}
      <group>
        {/* Fuselage */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[4, 0.5]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Wings */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.1, 1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Tail */}
        <mesh position={[0, 0.5, -1.5]}>
          <boxGeometry args={[1, 0.5, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Vertical stabilizer */}
        <mesh position={[0, 0.5, -1.5]}>
          <boxGeometry args={[0.1, 0.5, 0.5]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 0.2, 1.5]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>
    </primitive>
  );
};

export default ThirdPersonFlightControls;
