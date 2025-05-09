import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useRapier } from "@react-three/rapier";

const DEFAULT_MAX_SPEED = 20;
const DEFAULT_ACCELERATION = 0.5;
const DEFAULT_FRICTION = 0.95;
const DEFAULT_TURN_SPEED = 0.03;

const ThirdPersonCarControls = () => {
  const { camera } = useThree();
  const { world } = useRapier();
  const currentGroundY = useRef(0);
  const lastValidPosition = useRef(new Vector3());
  const carPosition = useRef(new Vector3());
  const carRotation = useRef(0);
  const carDirection = useRef(new Vector3());
  const currentSpeed = useRef(0);
  const keys = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });

  useEffect(() => {
    // Set initial car position
    const rayOrigin = new Vector3(
      camera.position.x,
      camera.position.y + 100,
      camera.position.z
    );
    const rayDir = new Vector3(0, -1, 0);
    const hit = world.castRay(
      { x: rayOrigin.x, y: rayOrigin.y, z: rayOrigin.z },
      { x: rayDir.x, y: rayDir.y, z: rayDir.z },
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      200
    );

    if (hit) {
      const groundY = hit.point.y;
      carPosition.current.set(camera.position.x, groundY, camera.position.z);
      lastValidPosition.current.copy(carPosition.current);
      currentGroundY.current = groundY;
    } else {
      carPosition.current.copy(camera.position);
      lastValidPosition.current.copy(camera.position);
      currentGroundY.current = camera.position.y;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = true;
          break;
        case "KeyS":
          keys.current.s = true;
          break;
        case "KeyA":
          keys.current.a = true;
          break;
        case "KeyD":
          keys.current.d = true;
          break;
        case "Space":
          keys.current.space = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = false;
          break;
        case "KeyS":
          keys.current.s = false;
          break;
        case "KeyA":
          keys.current.a = false;
          break;
        case "KeyD":
          keys.current.d = false;
          break;
        case "Space":
          keys.current.space = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [camera.position, world]);

  useFrame(() => {
    // Calculate current speed
    if (keys.current.w) {
      currentSpeed.current = Math.min(
        currentSpeed.current + DEFAULT_ACCELERATION,
        DEFAULT_MAX_SPEED
      );
    } else if (keys.current.s) {
      currentSpeed.current = Math.max(
        currentSpeed.current - DEFAULT_ACCELERATION,
        -DEFAULT_MAX_SPEED / 2
      );
    } else {
      currentSpeed.current *= DEFAULT_FRICTION;
    }

    // Apply rotation
    if (keys.current.a) {
      carRotation.current +=
        DEFAULT_TURN_SPEED * Math.sign(currentSpeed.current);
    }
    if (keys.current.d) {
      carRotation.current -=
        DEFAULT_TURN_SPEED * Math.sign(currentSpeed.current);
    }

    // Calculate movement direction
    carDirection.current.set(
      Math.sin(carRotation.current),
      0,
      Math.cos(carRotation.current)
    );

    // Apply movement
    carPosition.current.addScaledVector(
      carDirection.current,
      currentSpeed.current
    );

    // Ground detection
    const rayOrigin = new Vector3(
      carPosition.current.x,
      carPosition.current.y + 1,
      carPosition.current.z
    );
    const rayDir = new Vector3(0, -1, 0);
    const hit = world.castRay(
      { x: rayOrigin.x, y: rayOrigin.y, z: rayOrigin.z },
      { x: rayDir.x, y: rayDir.y, z: rayDir.z },
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      10
    );

    if (hit) {
      currentGroundY.current = hit.point.y;
      carPosition.current.y = currentGroundY.current;
      lastValidPosition.current.copy(carPosition.current);
    } else {
      carPosition.current.copy(lastValidPosition.current);
    }

    // Update camera position
    const cameraOffset = new Vector3(
      Math.sin(carRotation.current) * -10,
      5,
      Math.cos(carRotation.current) * -10
    );
    camera.position.copy(carPosition.current).add(cameraOffset);
    camera.lookAt(carPosition.current);
  });

  return (
    <group
      position={carPosition.current}
      rotation={[0, carRotation.current, 0]}
    >
      {/* Car body */}
      <mesh>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      {/* Wheels */}
      <group position={[1, -0.5, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
      <group position={[-1, -0.5, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
      <group position={[1, -0.5, -1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
      <group position={[-1, -0.5, -1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </group>
  );
};

export default ThirdPersonCarControls;
