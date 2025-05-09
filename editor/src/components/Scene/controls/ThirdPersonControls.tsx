import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import * as THREE from "three";
import { Vector3 } from "three";
import {
  handleKeyboardInput,
  calculateMovementDirection,
  detectGround,
  createRayOrigins,
  applyMovement,
  updateThirdPersonCamera,
  KeyStates,
  MovementParams,
} from "../ControlHelpers";
import { PlayerRigidBody } from "./PlayerRigidBody";

interface PhysicsObject extends THREE.Object3D {
  setTranslation?: (x: number, y: number, z: number) => void;
  translation?: () => { x: number; y: number; z: number };
  linvel?: () => { x: number; y: number; z: number };
  setLinvel?: (velocity: Vector3) => void;
}

const ThirdPersonControls = () => {
  const { camera } = useThree();
  const { world } = useRapier();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const moveSpeed = controlSettings.walkSpeed;
  const jumpForce = 5;
  const playerHeight = 1.8;
  const playerRadius = 0.3;
  const cameraDistance = 5;
  const cameraHeight = 2;
  const isOnGround = useRef(false);
  const velocity = useRef(new Vector3());
  const keys = useRef<KeyStates>({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });
  const moveDirection = useRef(new Vector3());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const playerRef = useRef<PhysicsObject>(
    new THREE.Object3D() as PhysicsObject
  );

  const updatePosition = (newPos: Vector3) => {
    if (playerRef.current?.setTranslation) {
      playerRef.current.setTranslation(newPos.x, newPos.y, newPos.z);
    }
  };

  // Find ground position using ray cast
  useEffect(() => {
    if (!world) return;

    // Create ray from high up
    const rayOrigin = new Vector3(0, 1000, 0);
    const rayDir = new Vector3(0, -1, 0);
    const hit = world.castRay(rayOrigin, rayDir, 2000, true);

    if (hit) {
      // Spawn slightly above the hit point
      const spawnY = hit.point.y + playerHeight / 2 + 0.1;
      updatePosition(new Vector3(0, spawnY, 5));
    } else {
      // No ground found, spawn at default height
      updatePosition(new Vector3(0, playerHeight, 5));
    }
  }, [world]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    const rigidBody = playerRef.current;
    const position = rigidBody.translation?.() ?? { x: 0, y: 0, z: 0 };
    const targetPosition = new Vector3(
      position.x,
      position.y + cameraHeight,
      position.z
    );

    // Calculate movement direction
    calculateMovementDirection(
      camera,
      keys.current,
      moveDirection.current,
      forward.current,
      right.current
    );

    // Apply movement
    const movementParams: MovementParams = {
      moveSpeed,
      friction: 0.95,
      maxSpeed: 10,
    };

    // Update velocity based on movement direction
    const currentVelocity = rigidBody.linvel?.() ?? { x: 0, y: 0, z: 0 };
    velocity.current.set(
      currentVelocity.x,
      currentVelocity.y,
      currentVelocity.z
    );

    applyMovement(
      targetPosition,
      moveDirection.current,
      velocity.current,
      movementParams,
      delta,
      isOnGround.current
    );

    // Handle jumping
    if (keys.current.space && isOnGround.current) {
      velocity.current.y = jumpForce;
    }

    // Apply gravity when not on ground
    if (!isOnGround.current) {
      velocity.current.y -= 9.8 * delta;
    }

    // Update rigid body velocity
    if (rigidBody.setLinvel) {
      rigidBody.setLinvel(velocity.current);
    }

    // Update camera position
    updateThirdPersonCamera(
      camera,
      targetPosition,
      cameraDistance,
      cameraHeight,
      camera.rotation.y
    );

    // Ground check
    const rayOrigin = new Vector3(position.x, position.y, position.z);
    const rayDir = new Vector3(0, -1, 0);
    const ray = new world.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, playerHeight / 2 + 0.1, true);
    isOnGround.current = !!hit;
  });

  return (
    <PlayerRigidBody
      ref={playerRef}
      playerHeight={playerHeight}
      playerRadius={playerRadius}
    >
      {/* Visual representation of the player */}
      <group>
        {/* Body */}
        <mesh position={[0, playerHeight * 0.5, 0]}>
          <capsuleGeometry args={[playerHeight * 0.4, playerRadius * 2]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {/* Head */}
        <mesh position={[0, playerHeight * 0.9, 0]}>
          <sphereGeometry args={[playerRadius * 0.8]} />
          <meshStandardMaterial color="#f5d0a9" />
        </mesh>
        {/* Arms */}
        <mesh position={[playerRadius * 1.2, playerHeight * 0.5, 0]}>
          <capsuleGeometry args={[playerHeight * 0.3, playerRadius * 0.5]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <mesh position={[-playerRadius * 1.2, playerHeight * 0.5, 0]}>
          <capsuleGeometry args={[playerHeight * 0.3, playerRadius * 0.5]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {/* Legs */}
        <mesh position={[playerRadius * 0.5, playerHeight * 0.2, 0]}>
          <capsuleGeometry args={[playerHeight * 0.4, playerRadius * 0.5]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[-playerRadius * 0.5, playerHeight * 0.2, 0]}>
          <capsuleGeometry args={[playerHeight * 0.4, playerRadius * 0.5]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </PlayerRigidBody>
  );
};

export default ThirdPersonControls;
